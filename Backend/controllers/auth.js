const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { uploadToCloudinary } = require('../services/cloudinary');
const crypto = require('crypto');

// Note: To use Firebase Admin, insure FIREBASE_SERVICE_ACCOUNT is configured.
if (!admin.apps.length) {
    admin.initializeApp();
}

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user
        });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, ...profileData } = req.body;

        if (req.files) {
            if (req.files.profileImage && req.files.profileImage[0]) {
                const result = await uploadToCloudinary(req.files.profileImage[0].buffer, 'mentor_connect/profiles');
                profileData.profileImage = result.secure_url;
            }
            if (req.files.resume && req.files.resume[0]) {
                const result = await uploadToCloudinary(req.files.resume[0].buffer, 'mentor_connect/resumes');
                profileData.resume = result.secure_url;
            }
            if (req.files.introVideo && req.files.introVideo[0]) {
                const result = await uploadToCloudinary(req.files.introVideo[0].buffer, 'mentor_connect/videos', 'video');
                profileData.introVideo = result.secure_url;
            }
        }

        let user;

        if (role === 'mentor') {
            const parsedProfile = { ...profileData };

            if (typeof parsedProfile.education === 'string') {
                parsedProfile.education = [{ degree: parsedProfile.education, institution: '', year: '' }];
            }
            if (typeof parsedProfile.employment === 'string') {
                parsedProfile.employment = [{ title: parsedProfile.employment, company: '', description: '' }];
            }
            if (typeof parsedProfile.skills === 'string') {
                parsedProfile.skills = parsedProfile.skills.split(',').map(s => s.trim()).filter(s => s);
            }

            user = await Mentor.create({ firstName, lastName, email, password, role, ...parsedProfile });
        } else if (role === 'mentee') {
            user = await Mentee.create({ firstName, lastName, email, password, role, ...profileData });
        } else {
            user = await User.create({ firstName, lastName, email, password, ...profileData });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all mentees for mentor lookup
// @route   GET /api/auth/mentees
// @access  Private
exports.getAllMentees = async (req, res, next) => {
    try {
        const mentees = await Mentee.find({ role: 'mentee' }).select('firstName lastName _id profileImage');

        res.status(200).json({
            success: true,
            data: mentees
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Firebase login
// @route   POST /api/auth/firebase
// @access  Public
exports.firebaseLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, error: 'Please provide an idToken' });
        }

        // Verify token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email } = decodedToken;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            // Reject if user doesn't exist
            return res.status(401).json({
                success: false,
                error: 'Account not found. Please create an account first.'
            });
        }

        // Log them in since they exist
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Firebase Auth Error:', err);
        return res.status(401).json({ success: false, error: 'Firebase Authentication failed' });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = { ...req.body };

        // Remove fields that shouldn't be updated this way
        delete fieldsToUpdate.password;
        delete fieldsToUpdate.role;
        delete fieldsToUpdate.email; // Usually requires email verification process

        let Model = User;
        if (req.user.role === 'mentor') Model = Mentor;
        if (req.user.role === 'mentee') Model = Mentee;

        const user = await Model.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    try {
        let Model = User;
        if (req.user.role === 'mentor') Model = Mentor;
        if (req.user.role === 'mentee') Model = Mentee;

        await Model.findByIdAndDelete(req.user.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In a real app we'd email this. For simplicity in dev, we return it in the response 
        // Or if frontend handles it, the link should go to frontend route like /reset-password/:token
        // But we will just return it so the API can be manually verified.
        // If frontend is deployed at localhost:5173 
        const resetUrl = `${req.protocol}://${req.get('host').replace(req.get('port') || '5000', '5173')}/reset-password/${resetToken}`;

        res.status(200).json({
            success: true,
            data: 'Password reset link generated',
            resetToken, // Returning for dev purposes
            resetUrl
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};
