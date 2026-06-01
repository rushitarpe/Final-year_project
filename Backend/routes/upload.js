const express = require('express');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinary');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');

const router = express.Router();

// @desc    Upload any file (general)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const folder = req.body.folder || 'mentor_connect/general';
        const result = await uploadToCloudinary(req.file.buffer, folder);

        res.status(200).json({
            success: true,
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
            }
        });
    } catch (err) {
        next(err);
    }
});

// @desc    Upload avatar and update user profile
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload an image file' });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
            req.file.buffer,
            'mentor_connect/avatars'
        );

        const newImageUrl = result.secure_url;

        // Update the correct model
        let Model = User;
        if (req.user.role === 'mentor') Model = Mentor;
        if (req.user.role === 'mentee') Model = Mentee;

        await Model.findByIdAndUpdate(req.user.id, {
            profileImage: newImageUrl
        });

        res.status(200).json({
            success: true,
            data: {
                url: newImageUrl,
                public_id: result.public_id
            }
        });
    } catch (err) {
        next(err);
    }
});

// @desc    Upload resume (PDF/DOCX) and update user profile
// @route   POST /api/upload/resume
// @access  Private
router.post('/resume', protect, upload.single('resume'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ success: false, error: 'Only PDF and Word documents are allowed' });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'mentor_connect/resumes');

        let Model = User;
        if (req.user.role === 'mentor') Model = Mentor;
        if (req.user.role === 'mentee') Model = Mentee;

        await Model.findByIdAndUpdate(req.user.id, {
            resumeUrl: result.secure_url,
            resumePublicId: result.public_id,
            resume: result.secure_url,
        });

        res.status(200).json({
            success: true,
            data: { url: result.secure_url, public_id: result.public_id }
        });
    } catch (err) {
        next(err);
    }
});

// @desc    Upload intro video and update mentor profile
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, upload.single('video'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a video file' });
        }

        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ success: false, error: 'Only MP4, MOV, AVI, and WEBM videos are allowed' });
        }

        // Upload as video resource type
        const result = await uploadToCloudinary(req.file.buffer, 'mentor_connect/videos', 'video');

        let Model = User;
        if (req.user.role === 'mentor') Model = Mentor;
        if (req.user.role === 'mentee') Model = Mentee;

        await Model.findByIdAndUpdate(req.user.id, {
            introVideoUrl: result.secure_url,
            introVideoPublicId: result.public_id,
            introVideo: result.secure_url,
        });

        res.status(200).json({
            success: true,
            data: { url: result.secure_url, public_id: result.public_id }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
