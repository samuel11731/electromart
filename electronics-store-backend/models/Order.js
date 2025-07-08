const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: String, // later change to ObjectId if using login users
    required: true
  },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
