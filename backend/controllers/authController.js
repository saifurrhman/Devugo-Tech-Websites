const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

// Helper functions for JWT
const signAccess = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

const signRefresh = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  // Set HTTP-only cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// OAuth handlers
exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    const accessToken = signAccess(req.user);
    const refreshToken = signRefresh(req.user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Redirect to frontend with success
    res.redirect('/login?success=true');
  } catch (err) {
    console.error('Google auth error:', err);
    res.redirect('/login?error=server_error');
  }
};

exports.linkedinCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    const accessToken = signAccess(req.user);
    const refreshToken = signRefresh(req.user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Redirect to frontend with success
    res.redirect('/login?success=true');
  } catch (err) {
    console.error('LinkedIn auth error:', err);
    res.redirect('/login?error=server_error');
  }
};

// Regular authentication handlers
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      accessToken,
      user
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user' // Default role
    });
    
    // Generate tokens
    const accessToken = signAccess(newUser);
    const refreshToken = signRefresh(newUser);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Remove password from output
    newUser.password = undefined;
    
    res.status(201).json({
      status: 'success',
      accessToken,
      user: newUser
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }
    
    // Generate new tokens
    const newAccessToken = signAccess(user);
    const newRefreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
    
    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken
    });
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
};

exports.logout = (req, res) => {
  // Clear auth cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
};

exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Filter out unwanted fields
    const filteredBody = {};
    if (name) filteredBody.name = name;
    if (email) filteredBody.email = email;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Generate new tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
      accessToken
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save({ validateBeforeSave: false });
    
    // TODO: Send email with reset token
    
    res.status(200).json({
      status: 'success',
      message: 'Reset token sent to email'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Hash token for comparison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }
    
    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
      accessToken
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
