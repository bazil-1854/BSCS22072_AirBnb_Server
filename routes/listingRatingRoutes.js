const express = require('express');
const router = express.Router();
const { addRating, getPaginatedReviews } = require('../controllers/listingRatingController'); 
const authenticate  = require('../middleware/authMiddleware'); 


router.post('/add-review', authenticate, addRating); 
router.get('/get-reviews/:listingId', getPaginatedReviews); 

module.exports = router;
