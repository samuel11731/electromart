const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders - Save a new order
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save order" });
  }
});

// GET /api/orders - Get all orders (later: for admin or user)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
