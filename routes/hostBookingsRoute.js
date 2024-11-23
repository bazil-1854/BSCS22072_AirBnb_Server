const express = require('express');
const router = express.Router();
const { getHostBookings, updateBookingStatus, getUserDetailsById } = require('../controllers/hostBookingsController');
const  authenticate  = require('../middleware/authMiddleware'); // Middleware to get req.user

// Fetch listings and bookings for the host
router.get('/host-listings-bookings', authenticate, getHostBookings);
router.put('/update-booking-status', authenticate, updateBookingStatus);

router.get('/get-reservers-details/:userId', getUserDetailsById);


module.exports = router;
