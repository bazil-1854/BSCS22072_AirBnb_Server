//notifications.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({ 
  notifications: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('notification', NotificationSchema);

