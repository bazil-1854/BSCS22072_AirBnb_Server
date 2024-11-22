const express = require('express');
const { createBooking, getBlockedDates } = require('../controllers/GuestBookingsController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a booking
router.post('/create-booking', authenticate, createBooking);

router.get('/get-reserved-bookings', getBlockedDates);

module.exports = router;
