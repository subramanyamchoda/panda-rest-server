const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  filename: String,
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  images: [imageSchema],
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sender',
  },
  table: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
