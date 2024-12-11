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

exports.getListingsByFilters = async (req, res) => {
  try {
    const { title, suburb, country, minPrice, maxPrice, beds, bathrooms } = req.body;

    // Build a dynamic query object based on the provided filters
    const query = {};

    if (title && title.trim()) { // Check if title is not empty or only spaces
      query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
    }
    if (suburb && suburb.trim()) { // Check if suburb is not empty or only spaces
      query.address.suburb = { $regex: suburb, $options: 'i' };
    }
    if (country && country.trim()) { // Check if country is not empty or only spaces
      query.address.country = { $regex: country, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.price = {
        ...(minPrice && { $gte: minPrice }),
        ...(maxPrice && { $lte: maxPrice }),
      };
    }
    if (beds && beds !== 'Any') { // Check if beds is a valid value
      query.beds = { $gte: beds };
    }
    if (bathrooms && bathrooms !== 'Any') { // Check if bathrooms is a valid value
      query.bathrooms = { $gte: bathrooms };
    }

    // Fetch listings from the database
    const listings = await Listing.find(query);

    // Return the filtered listings
    res.status(200).json(listings);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


exports.getSearchedListings = async (req, res) => {
  try {
    const location = req.query.location || {};
    const guests = parseInt(req.query.guests) || 1;

    const suburb = location.suburb || '';
    const country = location.country || '';
    const street = location.street || '';

    //console.log('Location Details:', location);
    //console.log('Guests:', guests);

    const query = {
      $and: [
        {
          $or: [
            { 'address.suburb': { $regex: suburb, $options: 'i' } },
            { 'address.country': { $regex: country, $options: 'i' } },
            { 'address.street': { $regex: street, $options: 'i' } },
          ],
        },
        { maxGuests: { $lte: guests } },
      ],
    };

    const listings = await Listing.find(query).exec();

    if (listings.length === 0) {
      return res.status(404).json({
        message: 'No listings found matching the search criteria',
      });
    }

    res.status(200).json({
      listings,
      totalListings: listings.length,
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
    //console.log(isLiked)
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