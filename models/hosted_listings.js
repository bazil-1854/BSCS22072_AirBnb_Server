const mongoose = require('mongoose');

const hostListingSchema = new mongoose.Schema({
  listings: { 
    type: [String],  // Array to store listing IDs
    default: [] 
  },
  hostID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // This references the User model
    required: true 
  }
});

module.exports = mongoose.model('HostListing', hostListingSchema);
