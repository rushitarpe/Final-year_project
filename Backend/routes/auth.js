const express = require('express');
const { register, login, getMe, firebaseLogin, updateDetails, deleteAccount, forgotPassword, resetPassword, getAllMentees } = require('../controllers/auth');
const { sendOtp, verifyOtp, completeRegister } = require('../controllers/otp');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// ── Existing routes (DO NOT MODIFY) ──────────────────────────────────────────
router.post('/register', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'introVideo', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
]), register);
router.post('/login', login);
router.post('/firebase', firebaseLogin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.get('/mentees', protect, authorize('mentor', 'admin'), getAllMentees);
router.put('/updatedetails', protect, updateDetails);
router.delete('/delete', protect, deleteAccount);

// ── New 3-Step OTP Registration endpoints ────────────────────────────────────
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/complete-register', completeRegister);

module.exports = router;

