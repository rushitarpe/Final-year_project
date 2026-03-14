const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAnalytics, getTopMentors, getMentees, deleteMentor, warnMentor } = require('../controllers/admin');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Restrict to admin users only

router.get('/analytics', getAnalytics);
router.get('/leaderboard', getTopMentors);
router.get('/mentees', getMentees);
router.delete('/mentors/:id', deleteMentor);
router.post('/mentors/:id/warn', warnMentor);

module.exports = router;
