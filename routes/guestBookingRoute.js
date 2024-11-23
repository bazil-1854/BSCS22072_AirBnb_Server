const express = require('express');
const { createBooking, getBlockedDates, getGuestBookings, finalizeBooking } = require('../controllers/GuestBookingsController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a booking
router.post('/create-booking', authenticate, createBooking);

router.get('/get-reserved-bookings', getBlockedDates);

router.get('/made-reservations', authenticate, getGuestBookings);
router.post('/finalize-booking', authenticate, finalizeBooking);

module.exports = router;
