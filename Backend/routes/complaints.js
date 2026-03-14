const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createComplaint, getComplaints } = require('../controllers/complaints');

const router = express.Router();

router.use(protect);

// Mentees create complaints
router.post('/', authorize('mentee'), createComplaint);

// Admins view all complaints
router.get('/', authorize('admin'), getComplaints);

module.exports = router;
