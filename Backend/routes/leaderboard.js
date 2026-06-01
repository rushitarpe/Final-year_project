const express = require('express');
const { protect } = require('../middleware/auth');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');

const router = express.Router();

// @desc    Get leaderboard
// @route   GET /api/leaderboard?role=mentor|mentee
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const role = req.query.role === 'mentor' ? 'mentor' : 'mentee';
        const limit = parseInt(req.query.limit) || 50;

        if (role === 'mentor') {
            const mentors = await Mentor.find({ isApproved: true })
                .select('firstName lastName profileImage category averageRating rating xpPoints level streak completedSessions totalSessions totalMentees badges')
                .sort({ xpPoints: -1, averageRating: -1 })
                .limit(limit);

            const data = mentors.map((m, i) => ({
                rank: i + 1,
                _id: m._id,
                firstName: m.firstName,
                lastName: m.lastName,
                profileImage: m.profileImage,
                category: m.category,
                xpPoints: m.xpPoints || 0,
                level: m.level || 1,
                streak: m.streak || 0,
                completedSessions: m.completedSessions || m.totalSessions || 0,
                totalMentees: m.totalMentees || 0,
                averageRating: m.averageRating || m.rating || 0,
                badgesCount: (m.badges || []).length,
            }));

            return res.status(200).json({ success: true, data, role: 'mentor' });
        } else {
            const mentees = await Mentee.find({ role: 'mentee' })
                .select('firstName lastName profileImage xpPoints level streak completedSessions totalSessions badges')
                .sort({ xpPoints: -1 })
                .limit(limit);

            const data = mentees.map((m, i) => ({
                rank: i + 1,
                _id: m._id,
                firstName: m.firstName,
                lastName: m.lastName,
                profileImage: m.profileImage,
                xpPoints: m.xpPoints || 0,
                level: m.level || 1,
                streak: m.streak || 0,
                completedSessions: m.completedSessions || m.totalSessions || 0,
                badgesCount: (m.badges || []).length,
            }));

            return res.status(200).json({ success: true, data, role: 'mentee' });
        }
    } catch (err) {
        next(err);
    }
});

// @desc    Get logged-in user's rank
// @route   GET /api/leaderboard/rank
// @access  Private
router.get('/rank', protect, async (req, res, next) => {
    try {
        const { user } = req;
        let rank = null;
        let xpPoints = 0;
        let level = 1;

        if (user.role === 'mentor') {
            const myDoc = await Mentor.findById(user.id).select('xpPoints level');
            if (myDoc) {
                xpPoints = myDoc.xpPoints || 0;
                level = myDoc.level || 1;
                const above = await Mentor.countDocuments({ xpPoints: { $gt: xpPoints } });
                rank = above + 1;
            }
        } else if (user.role === 'mentee') {
            const myDoc = await Mentee.findById(user.id).select('xpPoints level');
            if (myDoc) {
                xpPoints = myDoc.xpPoints || 0;
                level = myDoc.level || 1;
                const above = await Mentee.countDocuments({ role: 'mentee', xpPoints: { $gt: xpPoints } });
                rank = above + 1;
            }
        }

        res.status(200).json({
            success: true,
            data: { rank, xpPoints, level, role: user.role }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
