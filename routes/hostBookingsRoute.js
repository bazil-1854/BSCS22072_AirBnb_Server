const express = require('express');
const router = express.Router();
const { getHostBookings, updateBookingStatus } = require('../controllers/hostBookingsController');
const  authenticate  = require('../middleware/authMiddleware'); // Middleware to get req.user

// Fetch listings and bookings for the host
router.get('/host-listings-bookings', authenticate, getHostBookings);
router.put('/update-booking-status', authenticate, updateBookingStatus);

module.exports = router;
