const Review = require('../models/Review');
const Mentor = require('../models/Mentor');

exports.createReview = async (req, res, next) => {
    try {
        const { mentorId, rating, comment } = req.body;

        // Ensure student hasn't already reviewed this mentor
        const existingReview = await Review.findOne({ mentor: mentorId, student: req.user.id });
        if (existingReview) {
            return res.status(400).json({ success: false, error: 'You have already reviewed this mentor.' });
        }

        const review = await Review.create({
            mentor: mentorId,
            student: req.user.id,
            rating: Number(rating),
            comment
        });

        // Update mentor's average rating and review count
        const reviews = await Review.find({ mentor: mentorId });
        const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

        await Mentor.findByIdAndUpdate(mentorId, {
            rating: avgRating.toFixed(1),
            reviews: reviews.length
        });

        const populatedReview = await Review.findById(review._id).populate('student', 'firstName lastName profileImage');
        res.status(201).json({ success: true, data: populatedReview });
    } catch (error) {
        next(error);
    }
};

exports.getMentorReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ mentor: req.params.mentorId })
            .populate('student', 'firstName lastName profileImage')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        next(error);
    }
};
