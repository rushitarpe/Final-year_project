const Assignment = require('../models/Assignment');
const Mentee = require('../models/Mentee');
const Booking = require('../models/Booking');

// @desc    Create an assignment
// @route   POST /api/assignments
// @access  Private/Mentor
exports.createAssignment = async (req, res, next) => {
    try {
        // Enforce role
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ success: false, message: 'Only mentors can create assignments' });
        }

        req.body.mentor = req.user.id;
        
        // Ensure they have had an accepted/completed booking with this mentee
        const hasSession = await Booking.findOne({ 
            mentor: req.user.id, 
            mentee: req.body.mentee, 
            status: { $in: ['accepted', 'completed'] } 
        });
        
        if (!hasSession) {
             return res.status(403).json({ success: false, message: 'You can only assign tasks to mentees you have an approved relationship with.' });
        }

        const assignment = await Assignment.create(req.body);

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
    try {
        let query;

        console.log("Fetching assignments for User:", req.user.id, "Role:", req.user.role);

        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // If mentor, see assignments they created
        if (req.user.role === 'mentor') {
            query = Assignment.find({ mentor: userId }).populate('mentee', 'firstName lastName profileImage');
        } else {
            // If mentee, see assignments assigned to them
            query = Assignment.find({ mentee: userId }).populate('mentor', 'firstName lastName profileImage');
        }

        const assignments = await query.sort('-createdAt');
        console.log("Found assignments:", assignments.length);

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (err) {
        console.error("Error fetching assignments:", err);
        next(err);
    }
};

// @desc    Submit an assignment
// @route   PUT /api/assignments/:id/submit
// @access  Private/Mentee
exports.submitAssignment = async (req, res, next) => {
    try {
        let assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Make sure it belongs to the mentee
        if (assignment.mentee.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Make sure it's pending
        if (assignment.status !== 'pending') {
             return res.status(400).json({ success: false, message: `Assignment already ${assignment.status}` });
        }

        assignment.submissionDetails = req.body.submissionDetails;
        assignment.status = 'submitted';
        assignment.submissionDate = Date.now();

        assignment = await assignment.save();

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Grade an assignment
// @route   PUT /api/assignments/:id/grade
// @access  Private/Mentor
exports.gradeAssignment = async (req, res, next) => {
    try {
        let assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Make sure mentor is owner
        if (assignment.mentor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (assignment.status === 'pending') {
            return res.status(400).json({ success: false, message: 'Assignment not submitted yet' });
        }

        // Assign score and calculate grade
        const scoreVal = Number(req.body.score);
        assignment.score = scoreVal;
        
        let gradeLetter = 'F';
        if (scoreVal >= 90) gradeLetter = 'A';
        else if (scoreVal >= 80) gradeLetter = 'B';
        else if (scoreVal >= 70) gradeLetter = 'C';
        else if (scoreVal >= 60) gradeLetter = 'D';

        assignment.grade = gradeLetter;
        assignment.feedback = req.body.feedback;
        assignment.status = 'graded';

        await assignment.save();
        
        // Update user's rankScore
        const mentee = await Mentee.findById(assignment.mentee);
        if(mentee) {
             mentee.rankScore += Number(req.body.score) || 0;
             await mentee.save();
        }

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (err) {
        next(err);
    }
};
