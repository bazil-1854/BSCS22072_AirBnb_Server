const express = require('express');
const { createBooking, getBlockedDates, getGuestBookings } = require('../controllers/GuestBookingsController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a booking
router.post('/create-booking', authenticate, createBooking);

router.get('/get-reserved-bookings', getBlockedDates);

router.get('/made-reservations', authenticate, getGuestBookings);
module.exports = router;
