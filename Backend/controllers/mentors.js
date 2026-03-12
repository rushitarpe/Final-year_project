const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const { findMatches } = require('../services/matching');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res, next) => {
    try {
        const mentors = await Mentor.find({ role: 'mentor', isApproved: true });
        res.status(200).json({ success: true, count: mentors.length, data: mentors });
    } catch (err) {
        next(err);
    }
};

// @desc    Get mentor recommendations for mentee
// @route   GET /api/mentors/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
    try {
        const mentee = await Mentee.findById(req.user.id);

        if (!mentee || mentee.role !== 'mentee') {
            return res.status(403).json({ success: false, error: 'Only mentees can get recommendations' });
        }

        const matches = await findMatches(req.user.id, mentee);

        res.status(200).json({
            success: true,
            data: matches
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentor = async (req, res, next) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, error: 'Mentor not found' });
        }
        res.status(200).json({ success: true, data: mentor });
    } catch (err) {
        next(err);
    }
};
