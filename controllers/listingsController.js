const Listing = require('../models/listings');
const FavouriteListings = require('../models/favourite_listings');
const User = require('../models/user');

exports.getListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = req.body.category || req.query.category || 'All';
    const query = category === 'All' ? {} : { category };
    const listings = await Listing.find(query).skip(skip).limit(limit).exec();

    const totalListings = await Listing.countDocuments(query);

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
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const host = await User.findById(listing.hostID, 'createdAt username email');

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    let isLiked = false;
    const favouriteListings = await FavouriteListings.findById(userId);
    if (favouriteListings && favouriteListings.favourites.includes(id)) {
      isLiked = true;
    }

    //console.log(host.username)
    res.status(200).json({
      listing,
      isLiked,
      hostDetails: {
        createdAt: host.createdAt,
        name: host.username,
        email: host.email,
      },
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getListingById_for_users = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const host = await User.findById(listing.hostID, 'createdAt username email');

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    //console.log(host.username)
    res.status(200).json({
      listing,
      hostDetails: {
        createdAt: host.createdAt,
        name: host.username,
        email: host.email,
      },
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleFavoriteListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.listingId;

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
      favouriteListings.favourites = favouriteListings.favourites.filter(
        (id) => id !== listingId
      );
      // Decrement the favorite_count on the listing
      listing.favourite_count = Math.max(0, (listing.favourite_count || 0) - 1);
    }
    else {
      favouriteListings.favourites.push(listingId);
      // Increment the favorite_count on the listing
      listing.favourite_count = (listing.favourite_count || 0) + 1;
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