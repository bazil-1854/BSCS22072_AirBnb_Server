const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware
const { getProfile, updateProfile } = require('../controllers/profileController');

const router = express.Router();

// Apply the `authenticate` middleware to protect these routes
router.get('/user-info', authMiddleware, getProfile);
router.put('/update-info', authMiddleware, updateProfile);

module.exports = router;
