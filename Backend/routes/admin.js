const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAnalytics, getTopMentors } = require('../controllers/admin');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Restrict to admin users only

router.get('/analytics', getAnalytics);
router.get('/leaderboard', getTopMentors);

module.exports = router;
