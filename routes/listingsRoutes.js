const express = require('express');
const { getListings, getListingById, toggleFavoriteListing } = require('../controllers/listingsController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// GET Listings with Pagination
router.get('/listings', getListings);
router.get('/listings/:id', authenticate, getListingById);
 
router.post('/listings/:listingId/toggle-favorite',authenticate, toggleFavoriteListing);


module.exports = router;
