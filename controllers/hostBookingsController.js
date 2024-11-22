const HostListings = require('../models/hosted_listings');
const Listing = require('../models/listings'); 
const User = require('../models/user');
const Booking = require('../models/bookings'); 

// Get bookings for all host's listings
exports.getHostBookings = async (req, res) => {
    try {
      const userId = req.user.id;
      //console.log(userId)
  
      const hosted_listing_ref = await User.findById(userId).select('hosted_listings');
      //console.log(hosted_listing_ref.hosted_listings.toString())

      // Find the HostListings document by host ID
      const hostListings = await HostListings.findById(hosted_listing_ref.hosted_listings.toString());
  //console.log(hostListings);

      if (!hosted_listing_ref || !hostListings) {
        return res.status(404).json({ message: 'No listings found for this host.' });
      }
  
      // Fetch bookings for all listings in the host's listing array
      const bookings = await Booking.find({ listingID: { $in: hostListings.listings } });
  
      res.status(200).json({ bookings });
    } catch (error) {
      console.error('Error fetching host bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings for host listings.' });
    }
  };
  
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