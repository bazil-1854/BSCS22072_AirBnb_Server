const mongoose = require('mongoose');

const GuestListingBookingSchema = new mongoose.Schema({ 
  bookings: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('guestlistings', GuestListingBookingSchema);
