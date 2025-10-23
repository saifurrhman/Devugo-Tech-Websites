const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper functions for JWT
const signAccess = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'devugo-tech-secret',
    { expiresIn: '1h' }
  );
};

const signRefresh = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'devugo-tech-refresh-secret',
    { expiresIn: '7d' }
  );
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  // Set HTTP-only cookies
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 604800000 // 7 days
  });
};

// Login with email and password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // IMPORTANT: Use select('+passwordHash') to include the password field
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    //
    // ✅ YAHAN SE GOOGLE/LINKEDIN WALA CHECK HATA DIYA GAYA HAI
    //
    
    // Check password
    const isMatch = await user.correctPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Return user data (excluding sensitive fields)
    const userData = user.toObject();
    delete userData.passwordHash;
    
    res.json({
      message: 'Login successful',
      user: userData,
      accessToken: accessToken 
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Register new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // IMPORTANT: Set 'password' field (not passwordHash)
    // This will trigger the pre-save hook to hash it
    const user = new User({
      name,
      email,
      password: password, // Set password (transient field)
      role: 'user' 
    });
    
    await user.save();
    
    // Generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    // Set cookies
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Return user data (excluding sensitive fields)
    const userData = user.toObject();
    delete userData.passwordHash;
    
    //
    // ✅ FIXED: Return accessToken in JSON response
    //
    res.status(201).json({
      message: 'Registration successful',
      user: userData,
      accessToken: accessToken 
    });
    
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Refresh access token
exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'devugo-tech-refresh-secret'
    );
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Generate new access token
    const accessToken = signAccess(user);
    
    // Set new access token cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });
    
    res.json({ message: 'Token refreshed' });
    
  } catch (err) {
    console.error('Refresh error: ', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that the email doesn't exist
      return res.json({
        message: 'If your email exists in our system, you will receive a password reset link'
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || 'devugo-tech-reset-secret',
      { expiresIn: '1h' }
    );
    
    // TODO: In production, send email with reset link
    // Example: sendPasswordResetEmail(user.email, resetToken);
    console.log(' Password reset token:', resetToken);
    
    res.json({
      message: 'Password reset email sent',
      // Remove this in production only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
    
  } catch (err) {
    console.error('Password reset request error: ', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET || 'devugo-tech-reset-secret'
    );
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // IMPORTANT: Set password (transient field) to trigger hashing
    user.password = password;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
    
  } catch (err) {
    console.error('Password reset error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // IMPORTANT: Get user with passwordHash field
    const user = await User.findById(req.user._id).select('+passwordHash');
    
    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Cannot change password for OAuth accounts'
      });
    }
    
    // Verify current password
    const isMatch = await user.correctPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // IMPORTANT: Set password (transient field) to trigger hashing
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = req.user;
    
    // Return user data (excluding sensitive fields)
    const userData = user.toObject();
    delete userData.passwordHash;
    
    res.json({ user: userData });
    
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update current user profile
exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    
    // Check if email is already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    // Return updated user data
    const userData = updatedUser.toObject();
    delete userData.passwordHash;
    
    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
    
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Clear auth cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
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
    res.redirect('/admin'); // Redirect to dashboard
    
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
    res.redirect('/admin'); // Redirect to dashboard
    
  } catch (err) {
    console.error('LinkedIn auth error:', err);
    res.redirect('/login?error=server_error');
  }
};