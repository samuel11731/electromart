const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Logged-in user placing order
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Get orders of logged-in user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ Admin: Get all orders
router.get('/admin', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const allOrders = await Order.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.json(allOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

module.exports = router;