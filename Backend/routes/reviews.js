const express = require('express');
const { createReview, getMentorReviews } = require('../controllers/review');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, authorize('mentee'), createReview);

router.route('/:mentorId')
    .get(getMentorReviews);

module.exports = router;
