const Listing = require('../models/listings');
const User = require('../models/user');
const HostingListings = require('../models/hosted_listings'); 

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
    await newListing.save();
 
    const user = await User.findById(userId).select('role hosted_listings');

    if (user && user.role === 'Host') {
      const hostingListingsId = user.hosted_listings;
 
      const hostingListingsDoc = await HostingListings.findById(hostingListingsId);

      if (hostingListingsDoc) { 
        hostingListingsDoc.listings.push(newListing._id);
        await hostingListingsDoc.save();
      }
 
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


exports.getHostedListings = async (req, res) => {
  try { 
    const userId = req.user.id; 
    const user = await User.findById(userId, 'hosted_listings role');

    if (!user || user.role !== 'Host') {
      return res.status(403).json({ error: 'Access denied. User is not a host.' });
    }
 
    const hostListing = await HostingListings.findById(user.hosted_listings, 'listings');

    if (!hostListing) {
      return res.status(404).json({ error: 'Hosted listings not found.' });
    }
 
    const listings = await Listing.find({ _id: { $in: hostListing.listings } });

    res.status(200).json({ listings });
  } catch (error) {
    console.error('Error fetching hosted listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};