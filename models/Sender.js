const mongoose = require('mongoose');

const senderSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
    table: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  }],

  restaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }]
});



module.exports = mongoose.model('Sender', senderSchema);
