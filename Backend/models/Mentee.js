const mongoose = require('mongoose');
const User = require('./User');

const ObjectId = mongoose.Schema.Types.ObjectId;

const menteeSchema = new mongoose.Schema({

    // ── Identity & Bio ──────────────────────────────────────────
    bio:          { type: String, maxlength: 500 },
    profileImage: { type: String, default: '' },
    gender:       { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
    dateOfBirth:  Date,
    phone:        String,

    location: {
        city:    String,
        state:   String,
        country: { type: String, default: 'India' }
    },

    // ── Education ─────────────────────────────────────────────
    education: {
        degree:            String,  // from DEGREE_TYPES constant
        fieldOfStudy:      String,  // from EDUCATION_STREAMS constant
        institution:       String,
        university:        String,
        boardOrBody:       String,
        yearOfGraduation:  Number,
        currentlyStudying: { type: Boolean, default: true },
        grade:             String,  // "8.5 CGPA", "75%", "First Class"
        achievements:      [String] // academic achievements
    },

    // ── Career Profile ─────────────────────────────────────────
    currentRole:     String,  // "Final Year Student", "Junior Dev", "Career Switcher"
    currentCompany:  String,
    targetRole:      String,  // "ML Engineer at a startup"
    targetCompanies: [String],// from COMPANY_TYPES constant
    workExperience:  { type: Number, default: 0 }, // years
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },

    // ── Skills, Interests, Goals ───────────────────────────────
    skills:              [String], // from SKILL_OPTIONS
    interests:           [String], // from INTEREST_OPTIONS
    goals:               [String], // from GOAL_OPTIONS
    preferredCategories: [String], // from MENTOR_CATEGORIES — KEY FOR MATCHING
    mentorshipTypes:     [String], // from MENTORSHIP_TYPES — what kind of help needed
    languages:           [String], // from LANGUAGES

    // ── Social Links ───────────────────────────────────────────
    linkedinUrl:  String,
    githubUrl:    String,
    portfolioUrl: String,
    resume:       String,  // Cloudinary URL

    // ── Session Preferences ────────────────────────────────────
    preferredSessionDuration: { type: Number, default: 60 },   // minutes
    sessionFrequency: { type: String, enum: ['once', 'weekly', 'biweekly', 'monthly'], default: 'biweekly' },
    availableDays:      [String], // from AVAILABLE_DAYS
    availableTimeSlots: [String], // from AVAILABLE_TIMES
    budgetRange: {
        min:      { type: Number, default: 0 },
        max:      { type: Number, default: 5000 },
        currency: { type: String, default: 'INR' }
    },
    preferOnlineSessions: { type: Boolean, default: true },

    // ── Gamification ───────────────────────────────────────────
    xpPoints:          { type: Number, default: 0 },
    level:             { type: Number, default: 1 },
    streak:            { type: Number, default: 0 },
    lastActivityDate:  Date,
    completedSessions: { type: Number, default: 0 },
    totalSessions:     { type: Number, default: 0 },
    badges: [{
        name:        String,
        icon:        String,
        description: String,
        earnedAt:    { type: Date, default: Date.now }
    }],
    achievements: [{
        title:      String,
        description: String,
        unlockedAt: { type: Date, default: Date.now }
    }],

    // ── Platform Data ──────────────────────────────────────────
    savedMentors:    [{ type: ObjectId, ref: 'User' }],
    enrolledPaths:   [{ type: ObjectId, ref: 'Resource' }],
    profileComplete: { type: Boolean, default: false },
    onboardingStep:  { type: Number, default: 0 },

    // ── Legacy fields kept for backward compatibility ──────────
    educationLevel: { type: String },
    institution:    { type: String },
    major:          { type: String },
    experience: [{
        title:       String,
        company:     String,
        duration:    String,
        description: String
    }],
    rankScore: { type: Number, default: 0 },

}, { timestamps: true });

const Mentee = User.discriminator('mentee', menteeSchema);

module.exports = Mentee;
