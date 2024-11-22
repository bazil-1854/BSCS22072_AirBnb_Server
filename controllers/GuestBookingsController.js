const Booking = require('../models/bookings');
const ListingBooking = require('../models/listing_bookings');
const GuestBooking = require('../models/guest_bookings');

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from middleware
    console.log(userId);
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
