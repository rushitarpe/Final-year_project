const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String, // HH:mm format
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
        default: 'pending',
    },
    meetingLink: {
        type: String,
    },
    notes: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
