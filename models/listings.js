const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  property_type: {
    type: String,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    suburb: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    placePicture: {
      type: String,
      default: ''
    },
    coverPicture: {
      type: String,
      default: ''
    },
    additionalPictures: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: 'You can add up to 5 additional images only.'
      }
    }
  },
  hostID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Listing', ListingSchema);
