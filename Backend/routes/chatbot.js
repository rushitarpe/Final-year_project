const express = require('express');
const { protect } = require('../middleware/auth');
const {
    chat,
    askChatbot,
    careerAdvice,
    sessionSummary
} = require('../controllers/chatbot');

const router = express.Router();

// All chatbot routes are protected
router.use(protect);

// Multi-turn personalised chat (primary endpoint used by frontend widget)
router.post('/chat', chat);

// Career advice endpoint
router.post('/career-advice', careerAdvice);

// Session summary endpoint
router.post('/summarize/:bookingId', sessionSummary);

// Legacy single-turn endpoint (kept for backward compat)
router.post('/ask', askChatbot);

module.exports = router;
