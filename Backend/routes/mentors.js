const express = require('express');
const { protect } = require('../middleware/auth');
const { getMentors, getRecommendations, getMentor } = require('../controllers/mentors');

const router = express.Router();

router.get('/', getMentors);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getMentor);

module.exports = router;
