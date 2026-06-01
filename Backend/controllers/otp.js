const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const jwt = require('jsonwebtoken');
const { generateOTP, hashOTP, verifyOTP, maskEmail } = require('../utils/otp');
const { sendOTPEmail } = require('../services/email');

const isDev = process.env.NODE_ENV !== 'production';

// ─── Token helper (reused from auth.js pattern) ──────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user,
    });
};

// ─── Email format validation ──────────────────────────────────────────────────
const EMAIL_RE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Step 1 — Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate email format
        if (!email || !EMAIL_RE.test(email.trim())) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }
        const cleanEmail = email.trim().toLowerCase();

        // 2. Check if already fully registered
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser && existingUser.emailVerified && existingUser.password) {
            return res.status(409).json({
                success: false,
                error: 'This email is already registered. Please log in instead.',
            });
        }

        // 3. Rate limit — read otpAttempts via raw query (field is select:false)
        const rawDoc = await User.collection.findOne({ email: cleanEmail });
        if (rawDoc) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const attempts = rawDoc.otpAttempts || 0;
            const lastExpiry = rawDoc.otpExpiry;
            // Reset counter if last OTP was > 1 hour ago
            const effectiveAttempts = (lastExpiry && lastExpiry < oneHourAgo) ? 0 : attempts;
            if (effectiveAttempts >= 3) {
                return res.status(429).json({
                    success: false,
                    error: 'Too many OTP requests. Please wait 1 hour before requesting again.',
                });
            }
        }

        // 4. Generate, hash OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const now = new Date();

        // 5. Upsert OTP record using raw collection (bypasses discriminator/validation)
        await User.collection.updateOne(
            { email: cleanEmail },
            {
                $set: {
                    otpHash,
                    otpExpiry,
                    otpVerified: false,
                    emailVerified: false,
                    updatedAt: now,
                },
                $inc: { otpAttempts: 1 },
                $setOnInsert: {
                    email: cleanEmail,
                    firstName: '',
                    lastName: '',
                    role: 'mentee',
                    profileImage: '',
                    createdAt: now,
                },
            },
            { upsert: true }
        );

        // 6. Send OTP email
        const masked = maskEmail(cleanEmail);
        try {
            await sendOTPEmail(cleanEmail, otp, masked);
        } catch (emailErr) {
            console.error('Email send failed:', emailErr.message);
            if (!isDev) {
                return res.status(500).json({ success: false, error: 'Failed to send OTP email. Please try again.' });
            }
        }

        const responseData = {
            success: true,
            message: `OTP sent to ${masked}`,
            maskedEmail: masked,
        };
        // Dev-only: surface raw OTP for testing (never in production)
        if (isDev) responseData._devOtp = otp;

        return res.status(200).json(responseData);
    } catch (err) {
        console.error('sendOtp error:', err.message, err.stack);
        return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Step 2 — Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
        }
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ success: false, error: 'OTP must be exactly 6 numeric digits.' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Use raw collection to read all OTP fields (they are select:false in Mongoose)
        const rawDoc = await User.collection.findOne({ email: cleanEmail });

        if (!rawDoc) {
            return res.status(404).json({ success: false, error: 'No OTP request found for this email. Please request a new OTP.' });
        }

        // Check expiry
        if (!rawDoc.otpExpiry || rawDoc.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
        }

        // Verify hash (timingSafeEqual inside verifyOTP)
        if (!rawDoc.otpHash || !verifyOTP(otp, rawDoc.otpHash)) {
            return res.status(400).json({ success: false, error: 'Incorrect OTP. Please check your email and try again.' });
        }

        // ✅ Correct — clear OTP fields and mark verified using raw update
        await User.collection.updateOne(
            { email: cleanEmail },
            {
                $set: { otpVerified: true, otpAttempts: 0, updatedAt: new Date() },
                $unset: { otpHash: '', otpExpiry: '' },
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully.',
            verifiedEmail: cleanEmail,
        });
    } catch (err) {
        console.error('verifyOtp error:', err.message, err.stack);
        return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Step 3 — Complete Registration
// @route   POST /api/auth/complete-register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.completeRegister = async (req, res) => {
    try {
        const { email, firstName, lastName, password, confirmPassword, role } = req.body;

        // 1. Validate all fields present
        if (!email || !firstName || !lastName || !password || !confirmPassword) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // 2. Find user and check OTP was verified
        const user = await User.findOne({ email: cleanEmail }).select('+otpVerified +password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'No email verification found. Please start from Step 1.' });
        }
        if (!user.otpVerified) {
            return res.status(403).json({ success: false, error: 'Email not yet verified. Please complete OTP verification first.' });
        }

        // 3. Validate passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match.' });
        }

        // 4. Validate password strength
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!strongRegex.test(password)) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
            });
        }

        // 5. Validate role
        const validRoles = ['mentee', 'mentor'];
        const cleanRole = (role || 'mentee').toLowerCase();
        if (!validRoles.includes(cleanRole)) {
            return res.status(400).json({ success: false, error: 'Role must be either mentee or mentor.' });
        }

        // 6. Create proper profile record based on role
        // Delete the placeholder user first, then recreate as correct discriminator type
        await User.findByIdAndDelete(user._id);

        let finalUser;
        const baseData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: cleanEmail,
            password,
            role: cleanRole,
            emailVerified: true,
            otpVerified: false, // reset
        };

        if (cleanRole === 'mentor') {
            finalUser = await Mentor.create(baseData);
        } else {
            finalUser = await Mentee.create(baseData);
        }

        // 7. Send token response — same format as login
        sendTokenResponse(finalUser, 201, res);
    } catch (err) {
        console.error('completeRegister error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ success: false, error: 'This email is already registered. Please log in instead.' });
        }
        return res.status(500).json({ success: false, error: err.message || 'Server error. Please try again.' });
    }
};
