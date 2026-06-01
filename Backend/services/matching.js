/**
 * matching.js — Two-stage AI-powered mentor-mentee matching
 *
 * Stage 1: Fast DB pre-filter (no AI cost) → max 20 mentor candidates
 * Stage 2: Gemini AI scoring + explanations + tags → top 10 results
 *
 * Falls back to cosine-similarity scoring if Gemini call fails.
 * Results are cached per mentee for 30 minutes.
 */

const { generateStructuredContent } = require('./gemini');

// ─── 30-minute in-memory cache ─────────────────────────────────────────────
const matchCache = new Map(); // key: menteeId, value: { data, expiresAt }
const CACHE_TTL  = 30 * 60 * 1000; // 30 minutes in ms

const getCached = (menteeId) => {
    const entry = matchCache.get(menteeId.toString());
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        matchCache.delete(menteeId.toString());
        return null;
    }
    return entry.data;
};

const setCache = (menteeId, data) => {
    matchCache.set(menteeId.toString(), { data, expiresAt: Date.now() + CACHE_TTL });
};

const clearMatchCache = (menteeId) => {
    matchCache.delete(menteeId.toString());
};

// ─── Cosine math helpers (Stage 1 pre-filter + fallback scoring) ────────────
const buildVector = (items = []) => {
    const vec = {};
    items.forEach(item => {
        if (!item) return;
        const key = item.toString().toLowerCase().trim();
        vec[key] = (vec[key] || 0) + 1;
    });
    return vec;
};

const cosineSimilarity = (vecA, vecB) => {
    const terms = [...new Set([...Object.keys(vecA), ...Object.keys(vecB)])];
    let dot = 0, magA = 0, magB = 0;
    for (const t of terms) {
        const a = vecA[t] || 0, b = vecB[t] || 0;
        dot += a * b; magA += a * a; magB += b * b;
    }
    if (!magA || !magB) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const arrayOverlapScore = (arr1 = [], arr2 = []) => {
    if (!arr1.length || !arr2.length) return 0;
    const set1 = new Set(arr1.map(x => x.toLowerCase()));
    const overlap = arr2.filter(x => set1.has(x.toLowerCase())).length;
    return overlap / Math.max(arr1.length, arr2.length);
};

const fallbackScore = (mentee, mentor) => {
    let score = 0;
    score += cosineSimilarity(buildVector(mentee.skills || []), buildVector(mentor.skills || [])) * 30;
    score += arrayOverlapScore(mentee.preferredCategories || [], [mentor.category].filter(Boolean)) * 20;
    score += arrayOverlapScore(mentee.languages || [], mentor.languages || []) * 15;
    const maxBudget = mentee.budgetRange?.max || 5000;
    const price = mentor.sessionPrice || 0;
    if (price === 0 || price <= maxBudget) score += 20;
    else if (price <= maxBudget * 1.2) score += 10;
    score += arrayOverlapScore(mentee.availableDays || [], mentor.availableDays || []) * 15;
    return Math.min(Math.round(score), 100);
};

// ─── Stage 1: DB pre-filter ─────────────────────────────────────────────────
const preFilterMentors = async (mentee) => {
    const Mentor = require('../models/Mentor');

    // Base filter — use $ne: false so mentors without isPublic set are still included
    const baseFilter = { isApproved: true, isPublic: { $ne: false } };

    // Build progressive filters — most restrictive first
    const filterLevels = [
        // Level 0 — all hard filters
        () => {
            const f = { ...baseFilter };
            if (mentee.preferredCategories?.length > 0)
                f.category = { $in: mentee.preferredCategories };
            if (mentee.budgetRange?.max)
                f.sessionPrice = { $lte: mentee.budgetRange.max };
            if (mentee.languages?.length > 0)
                f.languages = { $in: mentee.languages };
            return f;
        },
        // Level 1 — drop language filter
        () => {
            const f = { ...baseFilter };
            if (mentee.preferredCategories?.length > 0)
                f.category = { $in: mentee.preferredCategories };
            if (mentee.budgetRange?.max)
                f.sessionPrice = { $lte: mentee.budgetRange.max };
            return f;
        },
        // Level 2 — drop budget filter
        () => {
            const f = { ...baseFilter };
            if (mentee.preferredCategories?.length > 0)
                f.category = { $in: mentee.preferredCategories };
            return f;
        },
        // Level 3 — no filters at all
        () => ({ ...baseFilter }),
    ];

    for (const buildFilter of filterLevels) {
        const filter = buildFilter();
        const mentors = await Mentor.find(filter)
            .sort({ averageRating: -1, totalSessions: -1 })
            .limit(20)
            .select('-whyMentor');

        if (mentors.length >= 5) return mentors;
    }

    // Absolute fallback
    return Mentor.find(baseFilter)
        .sort({ averageRating: -1 })
        .limit(20)
        .select('-whyMentor');
};

// ─── Stage 2: Gemini AI scoring ─────────────────────────────────────────────
const scoreWithAI = async (mentee, mentors) => {
    const menteeProfile = {
        name: `${mentee.firstName || ''} ${mentee.lastName || ''}`.trim(),
        currentRole: mentee.currentRole || 'Student',
        targetRole: mentee.targetRole || '',
        skills: mentee.skills || [],
        interests: mentee.interests || [],
        goals: mentee.goals || [],
        preferredCategories: mentee.preferredCategories || [],
        experienceLevel: mentee.experienceLevel || 'beginner',
        mentorshipTypes: mentee.mentorshipTypes || [],
        languages: mentee.languages || [],
        budgetMax: mentee.budgetRange?.max || 5000,
        availableDays: mentee.availableDays || [],
        education: mentee.education
            ? `${mentee.education.degree || ''} in ${mentee.education.fieldOfStudy || ''} at ${mentee.education.institution || ''}`
            : 'Not specified',
    };

    const mentorSummaries = mentors.map(m => ({
        mentorId: m._id.toString(),
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        jobTitle: m.jobTitle || '',
        company: m.company || '',
        category: m.category || '',
        skills: (m.skills || []).slice(0, 15),
        languages: m.languages || [],
        yearsOfExperience: m.yearsOfExperience || 0,
        educationSummary: (m.education || []).slice(0, 2).map(e => `${e.degree || ''} ${e.fieldOfStudy || ''}`).join(', '),
        mentorshipTypes: m.mentorshipTypes || [],
        averageRating: m.averageRating || 0,
        totalSessions: m.totalSessions || 0,
        sessionPrice: m.sessionPrice || 0,
        currency: m.currency || 'INR',
        bio: (m.bio || '').substring(0, 200),
        targetMenteeLevel: m.targetMenteeLevel || [],
    }));

    const prompt = `You are an expert career counsellor and mentor matching specialist.

MENTEE PROFILE:
${JSON.stringify(menteeProfile, null, 2)}

MENTOR CANDIDATES:
${JSON.stringify(mentorSummaries, null, 2)}

TASK: Analyse how well each mentor matches this specific mentee. Score each mentor from 0 to 100 based on:
- Skill alignment (how their skills cover mentee's needs and goals)
- Goal compatibility (do their mentorship types match what the mentee needs)
- Experience gap fit (mentor experience level vs mentee experience level)
- Language match
- Budget fit (sessionPrice vs budgetMax in INR)
- Mentorship type match

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.
Each item must have EXACTLY these fields:
- mentorId: string (the mentor's ID from the candidates list)
- score: number 0-100
- matchReasons: array of 2-4 strings, each max 10 words, second person (e.g. "Your Python skills align with their ML expertise")
- tag: one of exactly ["Best Match", "Top Rated", "Budget Friendly", "Same Field", "Highly Experienced", "Career Switcher Friendly"]

JSON array only:`;

    const rawText = await generateStructuredContent(prompt, mentee._id?.toString());

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) throw new Error('Gemini returned non-array');
    return parsed;
};

// ─── Main exported function ─────────────────────────────────────────────────
/**
 * Get top AI-matched mentors for a mentee.
 * Checks 30-min cache first; uses 2-stage AI matching otherwise.
 *
 * Returns array of mentor objects with { matchScore, matchReasons, tag } merged in.
 */
const getTopMatches = async (menteeProfile, limit = 10) => {
    const menteeId = menteeProfile._id;

    // Check cache
    const cached = getCached(menteeId);
    if (cached) {
        console.log(`[Matching] Cache hit for mentee ${menteeId}`);
        return cached.slice(0, limit);
    }

    // Stage 1: pre-filter
    console.log(`[Matching] Stage 1: pre-filtering mentors for mentee ${menteeId}`);
    const shortlist = await preFilterMentors(menteeProfile);

    if (shortlist.length === 0) return [];

    let results;

    try {
        // Stage 2: AI scoring
        console.log(`[Matching] Stage 2: AI scoring ${shortlist.length} mentors via Gemini`);
        const aiScores = await scoreWithAI(menteeProfile, shortlist);

        // Build a lookup map from AI results
        const scoreMap = new Map();
        aiScores.forEach(item => {
            if (item.mentorId && typeof item.score === 'number') {
                scoreMap.set(item.mentorId.toString(), item);
            }
        });

        // Merge AI scores onto mentor objects
        results = shortlist
            .map(mentor => {
                const ai = scoreMap.get(mentor._id.toString());
                return {
                    ...mentor.toObject(),
                    matchScore: ai?.score ?? fallbackScore(menteeProfile, mentor),
                    matchReasons: ai?.matchReasons ?? [],
                    tag: ai?.tag ?? 'Top Rated',
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

    } catch (err) {
        console.error('[Matching] Gemini AI scoring failed, using fallback:', err.message);

        // Fallback: cosine score, empty reasons
        results = shortlist
            .map(mentor => ({
                ...mentor.toObject(),
                matchScore: fallbackScore(menteeProfile, mentor),
                matchReasons: [],
                tag: 'Top Rated',
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    // Cache and return
    setCache(menteeId, results);
    return results;
};

// Keep legacy exports for anything that imports computeMatchScore / getMatchReasons
const computeMatchScore = (mentee, mentor) => ({
    score: fallbackScore(mentee, mentor),
    breakdown: {}
});
const getMatchReasons = () => [];

module.exports = { getTopMatches, computeMatchScore, getMatchReasons, clearMatchCache };
