const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the middleware
const { getProfile, updateProfile, getFavoriteListings } = require('../controllers/profileController');

const router = express.Router();

// Apply the `authenticate` middleware to protect these routes
router.get('/user-info', authenticate, getProfile);
router.put('/update-info', authenticate, updateProfile);
router.get('/guest-favourites', authenticate, getFavoriteListings);

module.exports = router;
