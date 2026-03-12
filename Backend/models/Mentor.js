const mongoose = require('mongoose');
const User = require('./User');

const mentorSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    resume: {
        type: String, // Cloudinary URL
    },
    companyId: {
        type: String, // Optional verification ID
    },
    education: [{
        degree: String,
        institution: String,
        year: String
    }],
    employment: [{
        title: String,
        company: String,
        current: Boolean,
        startDate: Date,
        endDate: Date,
        description: String
    }],
    category: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    linkedinUrl: String,
    twitterHandle: String,
    website: String,
    introVideo: String, // Cloudinary URL
    featuredArticle: String,
    whyMentor: {
        type: String,
        select: false, // Private field
    },
    greatestAchievement: String,
    isApproved: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    },
    hourlyRate: {
        type: Number,
        default: 0
    }
});

const Mentor = User.discriminator('mentor', mentorSchema);

module.exports = Mentor;
