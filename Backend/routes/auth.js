const express = require('express');
const { register, login, getMe, firebaseLogin, updateDetails, deleteAccount, forgotPassword, resetPassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

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
router.put('/updatedetails', protect, updateDetails);
router.delete('/delete', protect, deleteAccount);

module.exports = router;
