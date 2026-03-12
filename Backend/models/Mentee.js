const mongoose = require('mongoose');
const User = require('./User');

const menteeSchema = new mongoose.Schema({
    educationLevel: {
        type: String,
    },
    institution: String,
    major: String,
    interests: {
        type: [String],
    },
    goals: {
        type: String,
    },
    learningStyle: String,
    experienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
    }
});

const Mentee = User.discriminator('mentee', menteeSchema);

module.exports = Mentee;
