const express = require('express');
const router = express.Router();
const { addRating } = require('../controllers/listingRatingController'); 
const authenticate  = require('../middleware/authMiddleware'); 


router.post('/add-review', authenticate, addRating); 

module.exports = router;
