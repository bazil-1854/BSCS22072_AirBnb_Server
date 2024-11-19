const Listing = require('../models/listings');

exports.getListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const listings = await Listing.find().skip(skip).limit(limit).exec();
    const totalListings = await Listing.countDocuments();

    res.status(200).json({
      listings,
      totalPages: Math.ceil(totalListings / limit),
      currentPage: page,
    });
  } 
  catch (error) {
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
 
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }
 
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json(listing);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};