const express = require('express');
const router = express.Router();
const { getHostBookings, updateBookingStatus, getUserDetailsById } = require('../controllers/hostBookingsController');
const  authenticate  = require('../middleware/authMiddleware');  
 
router.get('/host-listings-bookings', authenticate, getHostBookings);

router.put('/update-booking-status', authenticate, updateBookingStatus);

router.get('/get-reservers-details/:userId', getUserDetailsById);


module.exports = router;
