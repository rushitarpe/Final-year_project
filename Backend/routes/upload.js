const express = require('express');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinary');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Upload file
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

module.exports = router;
