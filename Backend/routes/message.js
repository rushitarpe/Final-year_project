const express = require('express');
const { protect } = require('../middleware/auth');
const { sendMessage, allMessages, deleteMessage } = require('../controllers/message');

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/:id').delete(protect, deleteMessage);
router.route('/').post(protect, sendMessage);

module.exports = router;
