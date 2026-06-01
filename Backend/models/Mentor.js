const mongoose = require('mongoose');
const User = require('./User');

const ObjectId = mongoose.Schema.Types.ObjectId;

const mentorSchema = new mongoose.Schema({

    // ── Identity ───────────────────────────────────────────────
    profileImage: String,
    gender:       { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
    dateOfBirth:  Date,
    phone:        String,
    bio:          { type: String, maxlength: 1000 },

    location: {
        city:    String,
        state:   String,
        country: { type: String, default: 'India' }
    },

    // ── Professional Info ──────────────────────────────────────
    jobTitle:          { type: String },
    company:           String,
    companyType:       String,    // from COMPANY_TYPES
    companyWebsite:    String,
    companyId:         String,
    yearsOfExperience: { type: Number, default: 0 },
    currentlyWorking:  { type: Boolean, default: true },

    // ── Education — COMPREHENSIVE ──────────────────────────────
    education: [{
        degree:            String,    // from DEGREE_TYPES
        fieldOfStudy:      String,    // from EDUCATION_STREAMS
        specialization:    String,
        institution:       String,
        university:        String,
        boardOrBody:       String,    // "CBSE", "ICAI", "UGC"
        country:           { type: String, default: 'India' },
        startYear:         Number,
        endYear:           Number,
        currentlyEnrolled: { type: Boolean, default: false },
        grade:             String,
        thesisTitle:       String,
        achievements:      [String],
        isHighestDegree:   { type: Boolean, default: false }
    }],

    // ── Certifications & Licenses ──────────────────────────────
    certifications: [{
        name:          String,
        issuingBody:   String,
        issueDate:     Date,
        expiryDate:    Date,
        credentialId:  String,
        credentialUrl: String,
        neverExpires:  { type: Boolean, default: false }
    }],

    // ── Employment History ─────────────────────────────────────
    employment: [{
        title:          String,
        company:        String,
        companyType:    String,
        location:       String,
        employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] },
        startDate:      Date,
        endDate:        Date,
        current:        { type: Boolean, default: false },
        description:    String,
        achievements:   [String]
    }],

    // ── Research & Publications ────────────────────────────────
    publications: [{
        title:     String,
        journal:   String,
        year:      Number,
        url:       String,
        doi:       String,
        coAuthors: [String]
    }],

    // ── Awards & Recognition ───────────────────────────────────
    awards: [{
        title:        String,
        organization: String,
        year:         Number,
        description:  String
    }],

    // ── Expertise ─────────────────────────────────────────────
    category:         { type: String, required: true }, // from MENTOR_CATEGORIES
    subCategories:    [String],
    skills:           [String],  // from SKILL_OPTIONS
    languages:        [String],  // from LANGUAGES
    mentorshipTypes:  [String],  // from MENTORSHIP_TYPES
    targetMenteeLevel:[String],  // ['beginner','intermediate']

    // ── Profile Content ────────────────────────────────────────
    featuredArticle:     String,
    introVideoUrl:       String,
    introVideoPublicId:  String,
    introVideo:          String, // legacy alias
    resumeUrl:           String,
    resumePublicId:      String,
    resume:              String, // legacy alias
    greatestAchievement: String,
    whyMentor:           { type: String, select: false }, // PRIVATE

    // ── Social ─────────────────────────────────────────────────
    linkedinUrl:   String,
    twitterHandle: String,
    githubUrl:     String,
    website:       String,

    // ── Availability ──────────────────────────────────────────
    availability: [{
        dayOfWeek: { type: Number, min: 0, max: 6 },
        startTime: String,
        endTime:   String,
        isBooked:  { type: Boolean, default: false }
    }],
    availableDays:      [String], // from AVAILABLE_DAYS
    availableTimeSlots: [String], // from AVAILABLE_TIMES

    // ── Pricing (INR) ─────────────────────────────────────────
    sessionPrice:     { type: Number, default: 0 },
    hourlyRate:       { type: Number, default: 0 }, // legacy alias
    currency:         { type: String, default: 'INR' },
    sessionDuration:  { type: Number, default: 60 },
    offersFreeSession:{ type: Boolean, default: true },

    // ── Stats & Ratings ───────────────────────────────────────
    totalSessions: { type: Number, default: 0 },
    totalMentees:  { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    rating:        { type: Number, default: 0 }, // legacy alias
    reviews: [{
        mentee:    { type: ObjectId, ref: 'User' },
        rating:    { type: Number, min: 1, max: 5 },
        comment:   String,
        createdAt: { type: Date, default: Date.now }
    }],

    // ── Gamification ──────────────────────────────────────────
    xpPoints:          { type: Number, default: 0 },
    level:             { type: Number, default: 1 },
    streak:            { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    badges: [{
        name:        String,
        icon:        String,
        description: String,
        earnedAt:    Date
    }],
    points: { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────
    isApproved:      { type: Boolean, default: true },
    isPublic:        { type: Boolean, default: true },
    isFeatured:      { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    onboardingStep:  { type: Number, default: 0 },

    // ── Legacy fields ─────────────────────────────────────────
    warnings: [{
        message: String,
        date:    { type: Date, default: Date.now }
    }],

}, { timestamps: true });

// Virtual: keep hourlyRate in sync with sessionPrice
mentorSchema.pre('save', function (next) {
    if (this.isModified('sessionPrice') && !this.isModified('hourlyRate')) {
        this.hourlyRate = this.sessionPrice;
    } else if (this.isModified('hourlyRate') && !this.isModified('sessionPrice')) {
        this.sessionPrice = this.hourlyRate;
    }
    // Keep introVideo in sync with introVideoUrl
    if (this.isModified('introVideoUrl')) this.introVideo = this.introVideoUrl;
    if (this.isModified('introVideo') && !this.isModified('introVideoUrl')) this.introVideoUrl = this.introVideo;
    // Keep resume in sync with resumeUrl
    if (this.isModified('resumeUrl')) this.resume = this.resumeUrl;
    if (this.isModified('resume') && !this.isModified('resumeUrl')) this.resumeUrl = this.resume;
    // Keep rating in sync with averageRating
    if (this.isModified('averageRating')) this.rating = this.averageRating;
    next();
});

const Mentor = User.discriminator('mentor', mentorSchema);

module.exports = Mentor;
