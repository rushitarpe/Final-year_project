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
// ...existing controller code...
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

// @desc    Get all mentees
// @route   GET /api/admin/mentees
// @access  Private/Admin
exports.getMentees = async (req, res, next) => {
    try {
        const mentees = await User.find({ role: 'mentee' }).select('-password');
        res.status(200).json({
            success: true,
            count: mentees.length,
            data: mentees
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a mentor
// @route   DELETE /api/admin/mentors/:id
// @access  Private/Admin
exports.deleteMentor = async (req, res, next) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }
        await User.findByIdAndDelete(req.params.id); // Also deletes from mentors collection since they use discriminator
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Warn a mentor
// @route   POST /api/admin/mentors/:id/warn
// @access  Private/Admin
exports.warnMentor = async (req, res, next) => {
    try {
        const { message } = req.body;
        const mentor = await Mentor.findById(req.params.id);
        
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }
        
        if (!message) {
             return res.status(400).json({ success: false, message: 'Please provide a warning message' });
        }
        
        mentor.warnings.push({ message });
        await mentor.save();
        
        res.status(200).json({
            success: true,
            data: mentor
        });
    } catch (err) {
        next(err);
    }
};
