const express = require('express');
const { getListings } = require('../controllers/listingsController');

const router = express.Router();

// GET Listings with Pagination
router.get('/listings', getListings);

module.exports = router;
