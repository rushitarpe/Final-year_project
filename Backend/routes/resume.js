const express = require('express');
const upload = require('../middleware/upload');
const { parseResume } = require('../controllers/resume');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public: anyone can upload and parse a resume during registration
router.post('/parse', upload.single('file'), parseResume);

module.exports = router;
