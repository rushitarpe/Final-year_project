const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startTime: Date,
    endTime: Date,
    durationMinutes: Number,
    notes: String,
    recordUrl: String,
    aiSummary: String, // from OpenAI API
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    feedback: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
