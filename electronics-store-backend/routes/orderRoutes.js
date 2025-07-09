const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Create a new order
router.post('/', authenticateUser, async (req, res) => {
  const { items, totalAmount } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'Cart is empty.' });

  try {
    const order = new Order({
      user: req.user.userId,
      items,
      totalAmount
    });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully!' });
  } catch {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Get current user's orders
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ Admin: Get all orders with username and email
router.get('/admin/orders', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const allOrders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(allOrders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

module.exports = router;