const mongoose = require('mongoose');

const HostBookingSchema = new mongoose.Schema({ 
  bookings: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('hostbookings', HostBookingSchema);
