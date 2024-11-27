const express = require('express');
const router = express.Router();
const { addListing, getHostedListings, updateListing, deleteListing } = require('../controllers/hostListingsController');
const authenticate  = require('../middleware/authMiddleware');

const multer = require('multer'); 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });


router.post('/add-listing', authenticate, addListing);
router.post('/add-listing-with-images', authenticate, upload.array('images', 2), addListing);


router.get('/hosted-listings', authenticate, getHostedListings);

router.put('/update-listing/:id', authenticate, updateListing);

router.delete('/delete-listing/:id', authenticate, deleteListing);

module.exports = router;
