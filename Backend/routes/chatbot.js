const express = require('express');
const { protect } = require('../middleware/auth');
const { askChatbot } = require('../controllers/chatbot');

const router = express.Router();

router.use(protect);

router.post('/ask', askChatbot);

module.exports = router;
