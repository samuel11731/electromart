const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { userId: user._id, isAdmin: user.isAdmin || false };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin)
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  next();
};

module.exports = { authenticateUser, requireAdmin };