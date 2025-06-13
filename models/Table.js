const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  filename: String,
}, { _id: false });

const tableSchema = new mongoose.Schema({
  tableno: {
    type: String,
    required: true,
  },
  sittingtype: {
    type: String,
    required: true,
  },
  sittingnos: {
    type: String,
    required: true,
  },
  image: [imageSchema],
 restaurant: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Restaurant',
  required: true,
},


  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sender',
    required: true,
  },
});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;
