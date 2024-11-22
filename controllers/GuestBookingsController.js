const Booking = require('../models/bookings');
const ListingBooking = require('../models/listing_bookings');
const GuestBooking = require('../models/guest_bookings');

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from middleware
    //console.log(userId);
    const { listingId, checkIn, checkOut, guests, totalAmount, specialRequests } = req.body;

    // Create the new booking
    const newBooking = new Booking({
      listingId,
      userID: userId,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      specialRequests,
    });
    await newBooking.save();

    // Update the ListingBooking document
    const listingBooking = await ListingBooking.findById(listingId);
    if (!listingBooking) {
      return res.status(404).json({ error: 'Listing\'s booking document not found.' });
    }    
    
    // Push the new booking ID into the bookings array
    listingBooking.bookings.push(newBooking._id);
    await listingBooking.save();

    const guestBooking = await GuestBooking.findById(userId);
    if (!guestBooking) {
      return res.status(404).json({ error: 'User guest booking document not found.' });
    }

    guestBooking.bookings.push(newBooking._id);
    await guestBooking.save();

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.getBlockedDates = async (req, res) => {
  try {
    const { listingID } = req.body;

    // Find the ListingBooking document for the listing
    const listingBooking = await ListingBooking.findOne({ listingID });
    if (!listingBooking) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Fetch all bookings for this listing
    const bookings = await Booking.find({ _id: { $in: listingBooking.bookings } });

    // Collect all blocked dates
    let blockedDates = [];
    bookings.forEach((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      // Generate dates between checkIn and checkOut
      for (let date = checkIn; date <= checkOut; date.setDate(date.getDate() + 1)) {
        blockedDates.push(new Date(date)); // Add each date to the blockedDates array
      }
    });

    res.status(200).json({ blockedDates });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Fetch guest bookings
exports.getGuestBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    //console.log(userId); 
    
    const guestBookings = await GuestBooking.findById(userId);

    if (!guestBookings) {
      return res.status(404).json({ message: 'No bookings found for this user.' });
    }

    // Fetch booking details for each booking ID in the array
    const bookingsDetails = await Promise.all(
      guestBookings.bookings.map((bookingId) => Booking.findById(bookingId))
    );

    res.status(200).json({ bookings: bookingsDetails });
  }
  catch (error) {
    console.error('Error fetching guest bookings:', error);
    res.status(500).json({ error: 'Failed to fetch guest bookings.' });
  }
};