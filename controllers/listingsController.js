const Listing = require('../models/listings');
const FavouriteListings = require('../models/favourite_listings');


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

exports.toggleFavoriteListing = async (req, res) => {
  try {
    const userId = req.user.id; // User's ID from the authenticated request
    const { listingId } = req.params; // Listing ID from route parameters

    // Check if the listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    // Fetch or create the user's favorites document
    let favouriteListings = await FavouriteListings.findById(userId);
    if (!favouriteListings) {
      favouriteListings = new FavouriteListings({ _id: userId, favourites: [] });
    }

    const isFavorite = favouriteListings.favourites.includes(listingId);

    if (isFavorite) {
      // Remove from favorites
      favouriteListings.favourites = favouriteListings.favourites.filter(
        (id) => id !== listingId
      );

      // Decrement the favorite_count on the listing
      listing.favorite_count = Math.max(0, (listing.favorite_count || 0) - 1);
    } else {
      // Add to favorites
      favouriteListings.favourites.push(listingId);

      // Increment the favorite_count on the listing
      listing.favorite_count = (listing.favorite_count || 0) + 1;
    }

    await favouriteListings.save();
    await listing.save();

    res.status(200).json({
      message: isFavorite
        ? 'Listing removed from favorites.'
        : 'Listing added to favorites.',
      favorites: favouriteListings.favourites,
    });
  } 
  catch (error) {
    console.error('Error toggling favorite listing:', error);
    res.status(500).json({ error: 'Failed to toggle favorite listing. Please try again.' });
  }
};