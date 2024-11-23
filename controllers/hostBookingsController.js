const HostListings = require('../models/hosted_listings');
const Listing = require('../models/listings');
const HostBookings = require('../models/host_bookings');
const Booking = require('../models/bookings');
const User = require('../models/user');

// Get bookings for all host's listings with listing details
exports.getHostBookings = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Find the host's booking document
      const hostedBookings = await HostBookings.findById(userId);
  
      if (!hostedBookings) {
        return res.status(404).json({ message: 'No bookings found for this host.' });
      }
  
      // Fetch each booking and enrich it with listing details
      const enrichedBookings = await Promise.all(
        hostedBookings.bookings.map(async (bookingId) => {
          // Find the booking by ID
          const booking = await Booking.findById(bookingId);
          if (!booking) return null;
  
          // Fetch the associated listing's name and property_type
          const listing = await Listing.findById(booking.listingId).select('name property_type');
          
          return {
            ...booking.toObject(), // Convert the booking document to plain JS object
            listingDetails: listing, // Attach the listing details
          };
        })
      );
  
      // Remove any null values from bookings where either booking or listing wasn't found
      const filteredBookings = enrichedBookings.filter((booking) => booking !== null);
  
      res.status(200).json({ bookings: filteredBookings });
    } catch (error) {
      console.error('Error fetching host bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings for host listings.' });
    }
  };
  

// Get bookings for all host's listings
/*exports.getHostBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the host's booking document
        const hostedBookings = await HostBookings.findById(userId);

        if (!hostedBookings) {
            return res.status(404).json({ message: 'No bookings found for this host.' });
        }

        // Fetch each booking document by its ID
        const bookings = await Promise.all(
            hostedBookings.bookings.map(async (bookingId) => {
                const booking = await Booking.findById(bookingId);
                return booking;
            })
        );

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Error fetching host bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings for host listings.' });
    }
};
*/

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingID, status } = req.body;

        // Find the booking and update its status
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingID,
            { status },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        res.status(200).json({ message: 'Booking status updated.', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status.' });
    }
};

// Get user details by ID
exports.getUserDetailsById = async (req, res) => {
  try {
    const  userId  = req.params.userId;
    //console.log(userId)
    const user = await User.findById(userId).select('location username email bio socialLinks');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      message: 'User details fetched successfully.',
      user: {
        location: user.location,
        username: user.username,
        email: user.email,
        bio: user.bio,
        socialLinks: user.socialLinks,
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details. Please try again later.' });
  }
};
