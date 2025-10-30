const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('✅ Auth controller loaded');


const signAccess = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'devugo-tech-secret',
    { expiresIn: '1h' }
  );
};

// Generate Refresh Token (7 days)
const signRefresh = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'devugo-tech-refresh-secret',
    { expiresIn: '7d' }
  );
};

// Set Auth Cookies
const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600000 // 1 hour
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800000 // 7 days
  });
};


exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Signup request:', { name, email, hasPassword: !!password });
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use'
      });
    }
    
    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password,
      role: 'admin', // Change to 'user' after creating first admin
      isActive: true
    });
    
    console.log('💾 Saving user...');
    await user.save();
    console.log('✅ User saved successfully');
    
    // Generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Return user data (excluding sensitive fields)
    const userData = user.toObject();
    delete userData.passwordHash;
    delete userData.password;
    delete userData.__v;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userData,
      accessToken: accessToken
    });
    
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};

// ==========================================
// LOGIN - Authenticate User
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, hasPassword: !!password });
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user with password hash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    
    console.log('👤 User found:', !!user);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive. Please contact support.'
      });
    }
    
    console.log('🔍 Has passwordHash:', !!user.passwordHash);
    
    // Verify password
    const isMatch = await user.correctPassword(password);
    
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Return user data
    const userData = user.toObject();
    delete userData.passwordHash;
    delete userData.password;
    delete userData.__v;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken: accessToken
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'devugo-tech-refresh-secret'
    );
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    // Generate new access token
    const accessToken = signAccess(user);
    
    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000
    });
    
    res.json({
      success: true,
      message: 'Token refreshed',
      accessToken: accessToken
    });
    
  } catch (err) {
    console.error('❌ Refresh error:', err);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userData = user.toObject();
    delete userData.passwordHash;
    delete userData.password;
    delete userData.__v;
    
    res.json({
      success: true,
      user: userData
    });
    
  } catch (err) {
    console.error('❌ Get profile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};

// ==========================================
// UPDATE ME - Update Current User Profile
// ==========================================
exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase();
    
    // Check if email is already taken
    if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    const userData = updatedUser.toObject();
    delete userData.passwordHash;
    delete userData.password;
    delete userData.__v;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
    
  } catch (err) {
    console.error('❌ Update profile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // Get user with password hash
    const user = await User.findById(req.user.id).select('+passwordHash');
    
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change password for OAuth accounts'
      });
    }
    
    // Verify current password
    const isMatch = await user.correctPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (err) {
    console.error('❌ Change password error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};


exports.logout = async (req, res) => {
  try {
    // Clear auth cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('❌ Logout error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};


exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If your email exists in our system, you will receive a password reset link'
      });
    }
    
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || 'devugo-tech-reset-secret',
      { expiresIn: '1h' }
    );
    
    console.log('🔑 Password reset token:', resetToken);
    
    // In production, send email here
    
    res.json({
      success: true,
      message: 'Password reset email sent',
      // Only send token in development
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
    
  } catch (err) {
    console.error('❌ Password reset request error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};

// ==========================================
// RESET PASSWORD WITH TOKEN
// ==========================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Verify reset token
    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET || 'devugo-tech-reset-secret'
    );
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    // Set new password
    user.password = password;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
    
  } catch (err) {
    console.error('❌ Password reset error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};


exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    const accessToken = signAccess(req.user);
    const refreshToken = signRefresh(req.user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    res.redirect('/admin');
    
  } catch (err) {
    console.error('❌ Google auth error:', err);
    res.redirect('/login?error=server_error');
  }
};

// LinkedIn OAuth Callback
exports.linkedinCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    const accessToken = signAccess(req.user);
    const refreshToken = signRefresh(req.user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    res.redirect('/admin');
    
  } catch (err) {
    console.error('❌ LinkedIn auth error:', err);
    res.redirect('/login?error=server_error');
  }
};