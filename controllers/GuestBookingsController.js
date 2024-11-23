const Booking = require('../models/bookings');
const Listing = require('../models/listings');
const ListingBooking = require('../models/listing_bookings');
const GuestBooking = require('../models/guest_bookings');
const HostBooking = require('../models/host_bookings');

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from middleware
    const { listingId, hostId, checkIn, checkOut, guests, totalAmount, specialRequests } = req.body;

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

    // Push the new booking ID into the bookings array of ListingBooking
    listingBooking.bookings.push(newBooking._id);
    await listingBooking.save();

    // Update the GuestBooking document
    const guestBooking = await GuestBooking.findById(userId);
    if (!guestBooking) {
      return res.status(404).json({ error: 'User guest booking document not found.' });
    }

    guestBooking.bookings.push(newBooking._id);
    await guestBooking.save();

    // Update or Create the HostBooking document
    const hostBooking = await HostBooking.findById(hostId);

    if (!hostBooking) {
      // If no document exists, create a new one
      const newHostBooking = new HostBooking({
        _id: hostId,
        bookings: [newBooking._id],
      });
      await newHostBooking.save();
    }
    else {
      // If the document exists, push the booking ID
      hostBooking.bookings.push(newBooking._id);
      await hostBooking.save();
    }

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


exports.finalizeBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    // Step 1: Fetch booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Create the booking object to be stored
    const bookingObject = {
      listingId: booking.listingId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalAmount: booking.totalAmount,
    };

    // Step 2: Update GuestBookings document
    let guestBooking = await GuestBooking.findById(userId);
    if (!guestBooking) {
      // Create a new GuestBooking document if it doesn't exist
      guestBooking = new GuestBooking({
        _id: userId,
        bookingHistory: [bookingObject],
      });
    } else {
      // Push the bookingObject into the bookingHistory array
      guestBooking.bookingHistory.push(bookingObject);
    }
    await guestBooking.save();

    // Step 3: Update ListingBookings document
    let listingBooking = await ListingBooking.findById(booking.listingId);
    if (!listingBooking) {
      // Create a new ListingBooking document if it doesn't exist
      listingBooking = new ListingBooking({
        _id: booking.listingId,
        previousBookings: [bookingObject],
      });
    } else {
      // Push the bookingObject into the previousBookings array
      listingBooking.previousBookings.push(bookingObject);
    }
    await listingBooking.save();

    // Step 4: Update the "bookingsMade" attribute in the Listings collection
    const listing = await Listing.findById(booking.listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (!listing.bookingsMade) {
      listing.bookingsMade = 1; // Initialize bookingsMade if it doesn't exist
    } else {
      listing.bookingsMade += 1; // Increment bookingsMade
    }
    await listing.save();

    // Step 5: Update the "bookingsMade" attribute in the HostBookings collection
    const hostId = listing.hostId; // Host ID from the listing
    let hostBooking = await HostBooking.findById(hostId);
    if (!hostBooking) {
      // Create a new HostBooking document if it doesn't exist
      hostBooking = new HostBooking({
        _id: hostId,
        bookingsMade: 1, // Initialize bookingsMade
      });
    } else {
      // Increment bookingsMade
      if (!hostBooking.bookingsMade) {
        hostBooking.bookingsMade = 1;
      } else {
        hostBooking.bookingsMade += 1;
      }
    }
    await hostBooking.save();

    res.status(200).json({ message: 'Booking finalized successfully.' });
  } catch (error) {
    console.error('Error finalizing booking:', error);
    res.status(500).json({ error: 'Failed to finalize booking. Please try again later.' });
  }
};