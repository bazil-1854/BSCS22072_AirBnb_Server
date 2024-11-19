const express = require('express');
const { getListings, getListingById } = require('../controllers/listingsController');

const router = express.Router();

// GET Listings with Pagination
router.get('/listings', getListings);
router.get('/listings/:id', getListingById);

module.exports = router;
