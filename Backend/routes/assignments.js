const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    createAssignment,
    getAssignments,
    submitAssignment,
    gradeAssignment
} = require('../controllers/assignments');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAssignments)
    .post(authorize('mentor'), createAssignment);

router.put('/:id/submit', authorize('mentee'), submitAssignment);
router.put('/:id/grade', authorize('mentor'), gradeAssignment);

module.exports = router;
