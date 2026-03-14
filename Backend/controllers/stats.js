const User = require('../models/User');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/async');

// @desc    Get aggregate platform statistics
// @route   GET /api/stats
// @access  Public
exports.getPlatformStats = asyncHandler(async (req, res, next) => {
    // Run all count queries concurrently for performance
    const [totalUsers, activeMentors, totalSessions] = await Promise.all([
        User.countDocuments({ role: 'mentee' }),
        User.countDocuments({ role: 'mentor', isApproved: true }),
        Booking.countDocuments({ status: { $in: ['completed', 'accepted'] } })
    ]);

    res.status(200).json({
        success: true,
        data: {
            activeMentors,
            totalSessions,
            totalUsers
        }
    });
});
