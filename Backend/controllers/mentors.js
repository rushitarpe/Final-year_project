const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const { getTopMatches } = require('../services/matching');

// @desc    Get all mentors (with optional filters)
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res, next) => {
    try {
        const {
            search, category, skills, language,
            experienceLevel, minBudget, maxBudget,
            sessionDuration, availableDays, page = 1, limit = 20
        } = req.query;

        // Use $ne: false so mentors without the field explicitly set are still included
        let filter = { isApproved: { $ne: false } };

        // Text search
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { firstName: regex },
                { lastName: regex },
                { jobTitle: regex },
                { company: regex },
                { category: regex },
                { bio: regex },
                { skills: regex },
            ];
        }

        // Category filter
        if (category) {
            filter.category = { $regex: new RegExp(category, 'i') };
        }

        // Skills filter (any overlap)
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillList.length) {
                filter.skills = { $in: skillList.map(s => new RegExp(s, 'i')) };
            }
        }

        // Language filter
        if (language) {
            filter.languages = { $in: [new RegExp(language, 'i')] };
        }

        // Experience level (target mentee level)
        if (experienceLevel) {
            filter.targetMenteeLevel = { $in: [experienceLevel] };
        }

        // Budget filter (INR) — only apply if explicitly set below max
        if (maxBudget) {
            filter.sessionPrice = { $lte: parseInt(maxBudget) };
        }

        // Session duration filter
        if (sessionDuration) {
            filter.sessionDuration = parseInt(sessionDuration);
        }

        // Available days filter
        if (availableDays) {
            const days = availableDays.split(',').map(d => d.trim()).filter(Boolean);
            if (days.length) {
                filter.availableDays = { $in: days };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Mentor.find() already scopes to the 'mentor' discriminator — no need for role filter
        const mentors = await Mentor.find(filter)
            .select('-whyMentor')
            .sort({ averageRating: -1, totalSessions: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Mentor.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: mentors.length,
            total,
            page: parseInt(page),
            data: mentors
        });
    } catch (err) {
        next(err);
    }
};

// In-memory rate limit: 3 AI matching requests per user per hour
const matchRateMap = new Map();
const checkMatchRateLimit = (userId) => {
    const now = Date.now();
    const entry = matchRateMap.get(userId.toString());
    if (!entry || now > entry.resetAt) {
        matchRateMap.set(userId.toString(), { count: 1, resetAt: now + 60 * 60 * 1000 });
        return false;
    }
    if (entry.count >= 3) return true;
    entry.count += 1;
    return false;
};

// @desc    Get AI-powered mentor recommendations for mentee
// @route   GET /api/mentors/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (checkMatchRateLimit(userId)) {
            return res.status(429).json({
                success: false,
                error: 'You have reached the hourly limit for AI matching. Please try again in an hour.'
            });
        }

        const mentee = await Mentee.findById(userId);

        if (!mentee || mentee.role !== 'mentee') {
            return res.status(403).json({ success: false, error: 'Only mentees can get recommendations' });
        }

        const matches = await getTopMatches(mentee, 10);

        // matches is already a flat array of mentor objects with matchScore, matchReasons, tag merged in
        res.status(200).json({
            success: true,
            data: matches
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentor = async (req, res, next) => {
    try {
        const mentor = await Mentor.findById(req.params.id).select('-whyMentor');
        if (!mentor) {
            return res.status(404).json({ success: false, error: 'Mentor not found' });
        }
        res.status(200).json({ success: true, data: mentor });
    } catch (err) {
        next(err);
    }
};
