const express = require('express');
const { getListings, getListingById, toggleFavoriteListing, getListingById_for_users, getSearchedListings, getListingsByFilters } = require('../controllers/listingsController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/listings', getListings);

router.get('/listings/:id', authenticate, getListingById);

router.get('/listing-details/:id', getListingById_for_users);

router.get('/listing-searched', getSearchedListings);

router.get('/filtered-listings', getListingsByFilters);

 
router.post('/listings/:listingId/toggle-favorite',authenticate, toggleFavoriteListing);


module.exports = router;
