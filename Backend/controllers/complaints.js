const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Mentee only)
exports.createComplaint = async (req, res, next) => {
    try {
        req.body.mentee = req.user.id; // User ID from protect middleware

        // Make sure user is mentee
        if (req.user.role !== 'mentee') {
            return res.status(403).json({
                success: false,
                message: 'Only mentees can file complaints'
            });
        }

        const complaint = await Complaint.create(req.body);

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private/Admin
exports.getComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find()
            .populate('mentee', 'firstName lastName email profileImage')
            .populate('mentor', 'firstName lastName email profileImage')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (err) {
        next(err);
    }
};
