const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');


exports.requireAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      console.log('🍪 Token from cookie');
    }

    // Check Authorization header as fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token from Authorization header');
    }

    // No token found
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Not authenticated. Please login.'
      });
    }

    console.log('🔍 Token found, verifying...');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'devugo-tech-secret');
      console.log('✅ Token verified for user:', decoded.id);
    } catch (err) {
      console.log('❌ Token verification failed:', err.name);

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'TokenExpired',
          message: 'Token expired. Please refresh your token or login again.',
          expiredAt: err.expiredAt
        });
      }

      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Invalid token. Please login again.'
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found:', decoded.id);
      return res.status(401).json({
        success: false,
        error: 'UserNotFound',
        message: 'User no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User inactive:', user.email);
      return res.status(401).json({
        success: false,
        error: 'UserInactive',
        message: 'Your account has been deactivated.'
      });
    }

    console.log('✅ User authenticated:', user.email);

    // Attach user to request
    req.user = {
      id: user._id,
      _id: user._id, // Add both for compatibility
      email: user.email,
      role: user.role,
      name: user.name
    };

    // 🔍 LOG ACTIVITY (Async)
    if (req.method !== 'OPTIONS' && !req.path.startsWith('/uploads')) {
      ActivityLog.create({
        user: user._id,
        action: `${req.method} ${req.path}`,
        method: req.method,
        path: req.path,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }).catch(err => console.error('Activity Log Error:', err.message));
    }

    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Authentication error'
    });
  }
};

// Check if user has required role
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`❌ Access denied. User role: ${req.user.role}, Required: ${roles.join(' or ')}`);
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    console.log(`✅ Role authorized: ${req.user.role}`);
    next();
  };
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devugo-tech-secret');
        const user = await User.findById(decoded.id);

        if (user && user.isActive) {
          req.user = {
            id: user._id,
            _id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
          };

          // 🔍 LOG ACTIVITY (Async)
          if (req.method !== 'OPTIONS' && !req.path.startsWith('/uploads')) {
            ActivityLog.create({
              user: user._id,
              action: `${req.method} ${req.path}`,
              method: req.method,
              path: req.path,
              ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              userAgent: req.headers['user-agent']
            }).catch(err => console.error('Activity Log Error:', err.message));
          }
        }
      } catch (err) {
        // Token invalid, but continue without user
        console.log('⚠️ Optional auth - invalid token, continuing without user');
      }
    }

    next();
  } catch (err) {
    console.error('❌ Optional auth error:', err);
    next();
  }
};

// ========================================
// ALIASES FOR COMPATIBILITY
// ========================================

// Alias 'auth' to 'requireAuth' for routes that use { auth }
exports.auth = exports.requireAuth;

// Alias 'checkRole' to 'requireRole' for routes that use checkRole
exports.checkRole = exports.requireRole;

console.log('✅ Auth middleware loaded');