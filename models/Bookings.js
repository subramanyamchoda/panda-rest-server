const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
 
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
   sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sender',
    },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  bookingDate: {
    type: String,
    required: true,
  },
  bookingTime: {
    type: String,
    required: true,
  },
}, {
  timestamps: true // optional: adds createdAt and updatedAt
});

module.exports = mongoose.model('Booking', bookingSchema);
