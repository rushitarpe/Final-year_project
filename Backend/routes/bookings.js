const express = require('express');
const {
    createBooking,
    getMentorAvailability,
    cancelBooking,
    respondToBooking,
    rescheduleBooking,
    getSessionHistory,
    getUserBookings
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All booking routes are protected

router.get('/upcoming', getUserBookings);
router.post('/', createBooking);
router.get('/availability/:mentorId', getMentorAvailability);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/respond', respondToBooking);
router.put('/:id/reschedule', rescheduleBooking);
router.get('/history', getSessionHistory);

module.exports = router;
