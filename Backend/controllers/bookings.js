const Booking = require('../models/Booking');
const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { mentorId, date, time, notes } = req.body;

        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({ success: false, error: 'Mentor not found' });
        }

        const booking = await Booking.create({
            mentee: req.user.id,
            mentor: mentorId,
            date,
            time,
            notes
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get mentor availability (Mocked)
// @route   GET /api/bookings/availability/:mentorId
// @access  Private
exports.getMentorAvailability = async (req, res, next) => {
    try {
        // In a real app this would query the mentor's scheduled blocks
        // Mocking an array of available time slots
        const availableSlots = [
            { date: '2026-03-10', times: ['10:00 AM', '02:00 PM', '04:00 PM'] },
            { date: '2026-03-11', times: ['09:00 AM', '01:00 PM'] }
        ];

        res.status(200).json({
            success: true,
            data: availableSlots
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Make sure user is booking owner or admin
        if (booking.mentee.toString() !== req.user.id && booking.mentor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to update this booking' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Respond to booking (Accept/Reject)
// @route   PUT /api/bookings/:id/respond
// @access  Private
exports.respondToBooking = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        if (booking.mentor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to respond to this booking' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res, next) => {
    try {
        const { date, time } = req.body;
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        if (booking.mentee.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to reschedule this booking' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, { date, time, status: 'pending' }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get session history
// @route   GET /api/bookings/history
// @access  Private
exports.getSessionHistory = async (req, res, next) => {
    try {
        const query = req.user.role === 'mentor' ? { mentor: req.user.id } : { mentee: req.user.id };

        const sessions = await Session.find(query).populate({
            path: 'booking',
            select: 'date time'
        }).populate({
            path: req.user.role === 'mentor' ? 'mentee' : 'mentor',
            select: 'firstName lastName profileImage'
        });

        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user's upcoming bookings
// @route   GET /api/bookings/upcoming
// @access  Private
exports.getUserBookings = async (req, res, next) => {
    try {
        const query = req.user.role === 'mentor' ? { mentor: req.user.id } : { mentee: req.user.id };
        // We want bookings that are upcoming
        query.status = { $in: ['pending', 'accepted'] };

        const bookings = await Booking.find(query)
            .populate('mentor', 'firstName lastName profileImage')
            .populate('mentee', 'firstName lastName profileImage')
            .sort('date time');

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};
