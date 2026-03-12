const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Leaderboard = require('../models/Leaderboard');

// @desc    Get admin analytics overview
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMentors = await Mentor.countDocuments({ role: 'mentor' });
        const totalSessions = await Session.countDocuments();

        // Revenue calculations or session hours can be simulated or grabbed from Sessions data
        const analytics = {
            totalUsers,
            totalMentors,
            totalSessions,
            mentorGrowth: [
                { name: 'Jan', value: 400 },
                { name: 'Feb', value: 600 },
                { name: 'Mar', value: 800 }
            ], // Mocked for charts
        }

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get leaderboard
// @route   GET /api/admin/leaderboard
// @access  Private/Admin
exports.getTopMentors = async (req, res, next) => {
    try {
        const topMentors = await Leaderboard.find().populate('mentor', 'firstName lastName company jobTitle profileImage').sort({ points: -1 }).limit(10);

        res.status(200).json({
            success: true,
            data: topMentors
        });
    } catch (err) {
        next(err);
    }
};
