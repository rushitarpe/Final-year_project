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
    skills: {
        type: [String],
        default: []
    },
    languages: {
        type: [String],
        default: []
    },
    resume: {
        type: String, // Cloudinary URL or local path
    },
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    goals: {
        type: String,
    },
    experienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    rankScore: {
        type: Number,
        default: 0
    }
});

const Mentee = User.discriminator('mentee', menteeSchema);

module.exports = Mentee;
