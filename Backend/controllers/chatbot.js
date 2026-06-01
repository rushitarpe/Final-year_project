/**
 * chatbot.js — AI chatbot controller
 *
 * Endpoints:
 *   POST /api/chatbot/chat          — multi-turn personalised MentorBot chat
 *   POST /api/chatbot/ask           — legacy single-turn (backward compat)
 *   POST /api/chatbot/career-advice — personalised career advice
 *   POST /api/chatbot/summarize/:bookingId — AI session summary
 */

const { chatWithHistory, getAIResponse } = require('../services/gemini');

// ─── In-memory rate limiters ─────────────────────────────────────────────────
// { userId: { count, resetAt } }
const chatRateLimit    = new Map(); // 20 messages / user / hour
const adviceRateLimit  = new Map(); // 5  requests / user / day
const matchRateLimit   = new Map(); // (used in matching controller)

const checkRateLimit = (map, userId, maxCount, windowMs) => {
    const now = Date.now();
    const entry = map.get(userId.toString());

    if (!entry || now > entry.resetAt) {
        map.set(userId.toString(), { count: 1, resetAt: now + windowMs });
        return false; // not limited
    }
    if (entry.count >= maxCount) return true; // limited
    entry.count += 1;
    return false;
};

// ─── Build personalised system prompt ────────────────────────────────────────
const buildSystemPrompt = (user, profile) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'there';

    if (user.role === 'mentee') {
        return `You are MentorBot, the personal AI assistant for the MENTOR CONNECT platform — India's AI-powered mentorship platform connecting students and early-career professionals with experienced mentors.

You are speaking with ${name}, a mentee.

Their Profile:
- Current Role: ${profile.currentRole || 'Student'}
- Target Role: ${profile.targetRole || 'Not specified'}
- Experience Level: ${profile.experienceLevel || 'beginner'}
- Skills: ${(profile.skills || []).join(', ') || 'None listed'}
- Interests: ${(profile.interests || []).join(', ') || 'None listed'}
- Goals: ${(profile.goals || []).join(', ') || 'None listed'}
- Preferred Categories: ${(profile.preferredCategories || []).join(', ') || 'Open to all'}
- Budget: up to ₹${profile.budgetRange?.max || 5000}/session
- Mentorship Types Needed: ${(profile.mentorshipTypes || []).join(', ') || 'Any'}
- Languages: ${(profile.languages || []).join(', ') || 'English'}

Your job:
1. Give career advice, study plans, and session preparation tips tailored to ${name}'s specific goals and skills above.
2. Recommend booking a mentor session when relevant.
3. Help them find the right mentor type for their needs.
4. Answer questions about the MENTOR CONNECT platform features: AI Matching, Video Sessions, Real-time Chat, Leaderboard, Assignments, Resume Upload.
5. Keep responses concise, warm, and actionable — under 200 words unless a longer answer is genuinely needed.
6. Always respond in context of their specific goals and background listed above.
7. Decline questions unrelated to career, mentorship, or learning — politely redirect.`;
    }

    if (user.role === 'mentor') {
        return `You are MentorBot, the AI assistant for the MENTOR CONNECT platform.

You are speaking with ${name}, a mentor.

Their Profile:
- Job Title: ${profile.jobTitle || 'Mentor'}
- Company: ${profile.company || 'Not specified'}
- Category: ${profile.category || 'Not specified'}
- Skills: ${(profile.skills || []).join(', ') || 'None listed'}
- Years of Experience: ${profile.yearsOfExperience || 0}
- Mentorship Types Offered: ${(profile.mentorshipTypes || []).join(', ') || 'General'}

Your job:
1. Help them become a better mentor — session tips, feedback techniques, engagement strategies.
2. Help them understand platform features: Assignments, Bookings, Video Calls, Leaderboard.
3. Give advice on their industry topics when relevant.
4. Keep responses concise, warm, and actionable — under 200 words.`;
    }

    return `You are MentorBot, the AI assistant for MENTOR CONNECT. You are speaking with ${name}. Help them with career advice, mentorship questions, and platform guidance.`;
};

// ─── 1. Multi-turn AI Chat ────────────────────────────────────────────────────
// POST /api/chatbot/chat
// Body: { messages: [{ role, content }], context }
exports.chat = async (req, res) => {
    try {
        const userId = req.user.id;

        // Rate limit: 20 messages per hour
        if (checkRateLimit(chatRateLimit, userId, 20, 60 * 60 * 1000)) {
            return res.status(429).json({
                success: false,
                error: 'You have reached the hourly limit for AI chat. Please try again in an hour.'
            });
        }

        const { messages, context } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, error: 'messages array is required' });
        }

        // Limit to last 10 messages to manage context window
        const trimmedMessages = messages.slice(-10);

        // Fetch full profile from DB
        let profile = {};
        try {
            if (req.user.role === 'mentee') {
                const Mentee = require('../models/Mentee');
                profile = await Mentee.findById(userId) || {};
            } else if (req.user.role === 'mentor') {
                const Mentor = require('../models/Mentor');
                profile = await Mentor.findById(userId) || {};
            }
        } catch (profileErr) {
            console.error('[Chatbot] Profile fetch error:', profileErr.message);
            // Continue with empty profile — AI will still work
        }

        const systemPrompt = buildSystemPrompt(req.user, profile);

        const responseText = await chatWithHistory(trimmedMessages, systemPrompt, userId);

        return res.status(200).json({ success: true, message: responseText });

    } catch (err) {
        console.error('[Chatbot] chat error:', err.message);

        if (err.message === 'GEMINI_AUTH_ERROR') {
            return res.status(500).json({ success: false, error: 'AI service is not configured. Please contact support.' });
        }
        if (err.message === 'GEMINI_RATE_LIMIT') {
            return res.status(429).json({ success: false, error: 'AI assistant is busy. Please try again in a moment.' });
        }
        return res.status(500).json({ success: false, error: 'AI assistant encountered an error. Please try again.' });
    }
};

// ─── 2. Legacy single-turn (backward compat) ──────────────────────────────────
// POST /api/chatbot/ask
// Body: { message, context }
exports.askChatbot = async (req, res, next) => {
    try {
        const { message, context } = req.body;

        const GUIDEME_CONTEXT = `You are MentorBot, the official AI assistant for MENTOR CONNECT — an AI-powered mentorship platform. Help users with mentor discovery, booking sessions, career advice, and platform features. Be warm, concise, and actionable.`;

        const SESSION_SUMMARY_CONTEXT = `You are an assistant on MENTOR CONNECT that summarizes mentorship sessions. Keep summaries concise, structured, and actionable. Highlight key learnings, decisions made, and next steps.`;

        const systemContext = context === 'session_summary' ? SESSION_SUMMARY_CONTEXT : GUIDEME_CONTEXT;

        const reply = await getAIResponse(message, systemContext, 2, req.user?.id);

        res.status(200).json({ success: true, data: reply });
    } catch (err) {
        next(err);
    }
};

// ─── 3. Career Advice ─────────────────────────────────────────────────────────
// POST /api/chatbot/career-advice
// Body: { currentRole, targetRole, skills, experience, goals }
exports.careerAdvice = async (req, res) => {
    try {
        const userId = req.user.id;

        // Rate limit: 5 per day
        if (checkRateLimit(adviceRateLimit, userId, 5, 24 * 60 * 60 * 1000)) {
            return res.status(429).json({
                success: false,
                error: 'You have reached the daily limit for career advice. Please try again tomorrow.'
            });
        }

        const { currentRole, targetRole, skills, experience, goals } = req.body;

        // Fetch full mentee profile to merge
        let profile = {};
        try {
            const Mentee = require('../models/Mentee');
            profile = await Mentee.findById(userId) || {};
        } catch (e) { /* ignore */ }

        const mergedCurrentRole  = currentRole  || profile.currentRole  || 'Student';
        const mergedTargetRole   = targetRole   || profile.targetRole   || 'Not specified';
        const mergedSkills       = skills       || profile.skills       || [];
        const mergedExperience   = experience   !== undefined ? experience : (profile.workExperience || 0);
        const mergedGoals        = goals        || profile.goals        || [];
        const name               = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'there';

        const prompt = `You are a senior career counsellor with 20 years of experience in the Indian job market.

Mentee: ${name}
Current Role: ${mergedCurrentRole}
Target Role: ${mergedTargetRole}
Current Skills: ${mergedSkills.join(', ') || 'Not listed'}
Years of Experience: ${mergedExperience}
Goals: ${mergedGoals.join(', ') || 'Not specified'}

Provide specific, actionable career advice structured in EXACTLY these four sections:

## 1. Skill Gaps to Address
(List 3-5 concrete skills they are missing to reach their target role)

## 2. Recommended Learning Path
(Month-by-month timeline with specific resources, courses, or projects — realistic for the Indian market)

## 3. How Mentorship Can Accelerate This
(Specific ways a mentor on MENTOR CONNECT can fast-track their journey — be specific about what kind of mentor to find)

## 4. Top Three Immediate Action Steps
(Three things they can do THIS WEEK to start)

Rules:
- Make all advice specific to the Indian job market and career landscape
- Mention realistic salary ranges in INR where relevant
- Keep total response under 400 words
- Be warm, specific, and encouraging`;

        const adviceText = await getAIResponse(prompt, null, 2, userId);

        return res.status(200).json({ success: true, data: adviceText });

    } catch (err) {
        console.error('[Chatbot] careerAdvice error:', err.message);
        if (err.message === 'GEMINI_AUTH_ERROR') {
            return res.status(500).json({ success: false, error: 'AI service is not configured. Please contact support.' });
        }
        if (err.message === 'GEMINI_RATE_LIMIT') {
            return res.status(429).json({ success: false, error: 'AI assistant is busy. Please try again in a moment.' });
        }
        return res.status(500).json({ success: false, error: 'AI assistant encountered an error. Please try again.' });
    }
};

// ─── 4. Session Summary ───────────────────────────────────────────────────────
// POST /api/chatbot/summarize/:bookingId
exports.sessionSummary = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const Booking = require('../models/Booking');

        const booking = await Booking.findById(bookingId)
            .populate('mentor', 'firstName lastName jobTitle skills category')
            .populate('mentee', 'firstName lastName goals skills');

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const prompt = `You are an expert at summarizing mentorship sessions.

Session Details:
- Mentor: ${booking.mentor?.firstName || 'Unknown'} ${booking.mentor?.lastName || ''} (${booking.mentor?.jobTitle || 'Mentor'})
- Mentee: ${booking.mentee?.firstName || 'Unknown'} ${booking.mentee?.lastName || ''}
- Date: ${booking.date ? new Date(booking.date).toLocaleDateString('en-IN') : 'Unknown'}
- Session Notes / Agenda: ${booking.notes || booking.agenda || 'No notes provided'}
- Mentor Skills: ${(booking.mentor?.skills || []).join(', ') || 'Not listed'}
- Mentee Goals: ${(booking.mentee?.goals || []).join(', ') || 'Not listed'}

Generate a professional session summary with:
1. Key topics discussed (based on mentor expertise and mentee goals)
2. Main learnings or insights
3. Action items agreed upon
4. Recommended next steps

Keep the summary concise (under 250 words) and actionable.`;

        const summary = await getAIResponse(prompt, null, 2, req.user?.id);

        // Persist the summary to the booking
        try {
            booking.aiSummary = summary;
            await booking.save();
        } catch (saveErr) {
            console.error('[Chatbot] Could not save summary to booking:', saveErr.message);
        }

        return res.status(200).json({ success: true, data: summary });

    } catch (err) {
        console.error('[Chatbot] sessionSummary error:', err.message);
        if (err.message === 'GEMINI_AUTH_ERROR') {
            return res.status(500).json({ success: false, error: 'AI service is not configured. Please contact support.' });
        }
        if (err.message === 'GEMINI_RATE_LIMIT') {
            return res.status(429).json({ success: false, error: 'AI assistant is busy. Please try again in a moment.' });
        }
        return res.status(500).json({ success: false, error: 'AI assistant encountered an error. Please try again.' });
    }
};
