const express = require('express');
const { protect } = require('../middleware/auth');
const { getStreamToken, createCall } = require('../controllers/stream');

const router = express.Router();

router.use(protect);

router.get('/token', getStreamToken);
router.post('/call', createCall);

module.exports = router;
