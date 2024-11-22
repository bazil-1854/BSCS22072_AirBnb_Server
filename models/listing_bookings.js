const mongoose = require('mongoose');

const ListingBookingSchema = new mongoose.Schema({ 
  bookings: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('ListingBooking', ListingBookingSchema);
