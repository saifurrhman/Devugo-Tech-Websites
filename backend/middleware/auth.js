const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect route - verifies JWT and attaches user to req
const protect = async (req, res, next) => {
  const hdr = req.headers.authorization || '';
  let token = null;

  const parts = hdr.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    token = parts[1];
  }

  // Fallback to cookie-based token
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user so we have the role
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorize roles - must be called after protect
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
