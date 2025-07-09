const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Admin Creation Route (for first-time setup only)
router.post('/create-admin', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: true
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin user created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;