const Listing = require('../models/listings');
const User = require('../models/user');
const HostingListings = require('../models/hosted_listings'); // Assuming this is the correct schema


exports.addListing = async (req, res) => {
  try {
    const { name, summary, property_type, bedrooms, bathrooms, price, address, amenities, images } = req.body;
    const userId = req.user.id;

    // Create a new Listing
    const newListing = new Listing({
      name,
      summary,
      property_type,
      bedrooms,
      bathrooms,
      price,
      address,
      amenities,
      images,
      hostID: userId,
    });

    // Save the new Listing
    await newListing.save();

    // Retrieve the user's role and hosted_listings
    const user = await User.findById(userId).select('role hosted_listings');

    if (user && user.role === 'Host') {
      const hostingListingsId = user.hosted_listings;

      // Find the relevant hosting listings document
      const hostingListingsDoc = await HostingListings.findById(hostingListingsId);

      if (hostingListingsDoc) {
        // Append the new listing ID to the listings array
        hostingListingsDoc.listings.push(newListing._id);
        await hostingListingsDoc.save();
      }

      // Optionally, update the user's hosted_listings array with the new listing
      user.hosted_listings = hostingListingsId;
      await user.save();
    }

    res.status(201).json({
      message: 'Listing added successfully!',
      listing: newListing,
    });
  } catch (error) {
    console.error('Error adding listing:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};