const { getAIResponse } = require('../services/gemini');

// @desc    Get advice from AI Chatbot
// @route   POST /api/chatbot/ask
// @access  Private
exports.askChatbot = async (req, res, next) => {
    try {
        const { message, context } = req.body;
        let systemContext = 'You are a highly experienced tech mentor on Mentor Connect. Provide actionable, concise career and learning advice.';

        if (context === 'session_summary') {
            systemContext = 'You are an assistant that summarizes mentorship sessions based on provided notes.';
        }

        const reply = await getAIResponse(message, systemContext);

        res.status(200).json({
            success: true,
            data: reply
        });
    } catch (err) {
        next(err);
    }
};
