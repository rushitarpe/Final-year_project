const multer = require('multer');
const path = require('path');

// Determine file storage
const storage = multer.memoryStorage(); // We use memory storage to upload straight to Cloudinary

// File filter (optional, to restrict file types)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp4|webm|mov|avi|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Invalid file type!'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter,
});

module.exports = upload;
