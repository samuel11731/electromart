const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  } catch {
    res.status(500).json({ error: 'Server error checking admin' });
  }
}

module.exports = { authenticateUser, requireAdmin };