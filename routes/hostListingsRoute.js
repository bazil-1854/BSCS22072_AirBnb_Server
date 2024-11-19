const express = require('express');
const router = express.Router();
const { addListing, getHostedListings, updateListing, deleteListing } = require('../controllers/hostListingsController');
const authenticate  = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

// POST route for adding a new listing
router.post('/add-listing', authenticate, addListing);

router.get('/hosted-listings', authenticate, getHostedListings);

router.put('/update-listing/:id', authenticate, updateListing);


router.delete('/delete-listing/:id', authenticate, deleteListing);

module.exports = router;
