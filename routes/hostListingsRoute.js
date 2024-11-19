const express = require('express');
const router = express.Router();
const { addListing } = require('../controllers/hostListingsController');
const authenticate  = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

// POST route for adding a new listing
router.post('/add-listing', authenticate, addListing);

module.exports = router;
