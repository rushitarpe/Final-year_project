const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    sessionsCompleted: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze',
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
