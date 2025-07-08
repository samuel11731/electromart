const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authenticate = require('../middleware/auth');

// POST /api/orders - Save a new order (user must be logged in)
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const newOrder = new Order({
      user: req.user.userId, // ✅ access user ID from decoded token
      items,
      totalAmount
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// GET /api/orders - Get orders for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;