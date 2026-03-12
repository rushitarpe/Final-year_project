const express = require('express');
const { protect } = require('../middleware/auth');
const { accessChat, fetchChats, createGroupChat } = require('../controllers/chat');

const router = express.Router();

router.use(protect);

router.post('/', accessChat);
router.get('/', fetchChats);
router.post('/group', createGroupChat);

module.exports = router;
