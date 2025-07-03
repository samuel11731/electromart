const mongoose = require('mongoose');

// Define the structure of a Product
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Export the Product model
module.exports = mongoose.model('Product', productSchema);
