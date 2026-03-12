const express = require('express');
const { protect } = require('../middleware/auth');
const { createMeeting, joinMeeting } = require('../controllers/video');

const router = express.Router();

router.use(protect);

router.get('/create', createMeeting);
router.get('/join/:meetingId', joinMeeting);

module.exports = router;
