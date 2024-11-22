const express = require('express');
const { createBooking } = require('../controllers/GuestBookingsController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a booking
router.post('/create-booking', authenticate, createBooking);

module.exports = router;
