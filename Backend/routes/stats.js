const express = require('express');
const { getPlatformStats } = require('../controllers/stats');

const router = express.Router();

router.get('/', getPlatformStats);

module.exports = router;
