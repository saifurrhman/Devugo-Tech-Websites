const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');
const emailService = require('../services/emailService');

console.log('✅ Auth controller loaded');

// Generate Access Token (1 hour)
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

// ==========================================
// SIGNUP - Register New User
// ==========================================
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

    // Send Welcome Email
    try {
      await emailService.sendTransactionalEmail('welcome', user.email, {
        name: user.name
      });
      console.log('📨 Welcome email sent to:', user.email);
    } catch (emailErr) {
      console.error('⚠️ Failed to send welcome email:', emailErr.message);
    }

    // Log Activity (Signup)
    ActivityLog.create({
      user: user._id,
      action: 'POST /api/auth/signup',
      method: 'POST',
      path: '/api/auth/signup',
      ip: req.ip || (req.socket && req.socket.remoteAddress) || '0.0.0.0',
      userAgent: req.headers['user-agent']
    }).catch(err => console.error('Log Error:', err));



    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

// ==========================================
// LOGIN - Authenticate User
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login request:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check user status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is blocked. Please contact support.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    // Update last login
    try {
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false }); // Skip validation for efficiency
    } catch (saveErr) {
      console.error('⚠️ User save error (non-fatal):', saveErr.message);
    }

    // Log Activity (Login) - Wrapped in try/catch so it doesn't block login
    try {
      if (ActivityLog) {
        ActivityLog.create({
          user: user._id,
          action: 'POST /api/auth/login',
          method: 'POST',
          path: '/api/auth/login',
          ip: req.ip || (req.socket && req.socket.remoteAddress) || '0.0.0.0',
          userAgent: req.headers['user-agent']
        }).catch(e => console.error('Activity Log Async Error:', e.message));
      } else {
        console.error('ActivityLog model is undefined');
      }
    } catch (logErr) {
      console.error('Activity Log Sync Error:', logErr);
    }

    // Generate tokens
    let accessToken, refreshToken;
    try {
      accessToken = signAccess(user);
      refreshToken = signRefresh(user);
    } catch (tokenErr) {
      console.error('❌ Token generation error:', tokenErr);
      throw new Error('Token generation failed');
    }

    try {
      setAuthCookies(res, { accessToken, refreshToken });
    } catch (cookieErr) {
      console.error('❌ Cookie setting error:', cookieErr);
      // Don't throw, just log
    }

    // DEBUG: Confirm new code is running
    res.set('X-Debug-Version', 'v2-logging-fix');

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

// ==========================================
// REFRESH TOKEN
// ==========================================
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

// ==========================================
// GET ME - Get Current User Profile
// ==========================================
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
// ✅ FIXED: Added phone and avatar support
// ==========================================
exports.updateMe = async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body; // ✅ Added phone and avatar
    const updates = {};

    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone; // ✅ Added phone
    if (avatar !== undefined) updates.avatar = avatar; // ✅ Added avatar

    console.log('📝 Update request:', updates);

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

    console.log('✅ User updated successfully');
    console.log('   Avatar:', userData.avatar);

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

// ==========================================
// CHANGE PASSWORD
// ==========================================
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

// ==========================================
// LOGOUT
// ==========================================
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

// ==========================================
// REQUEST PASSWORD RESET
// ==========================================
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

    console.log('🔑 Password reset token:', resetToken);

    // Send Reset Email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await emailService.sendTransactionalEmail('passwordReset', user.email, {
      resetLink,
      name: user.name
    });

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

// ==========================================
// GOOGLE OAUTH CALLBACK
// ==========================================
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

// ==========================================
// LINKEDIN OAUTH CALLBACK
// ==========================================
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
    res.redirect('/login?error=server_error');
  }
};

// ==========================================
// ACCEPT INVITATION
// ==========================================
exports.acceptInvitation = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      invitationToken: hashedToken,
      invitationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired invitation token' });
    }

    // Activate user and set password
    user.password = password;
    user.isActive = true;
    user.invitationToken = undefined;
    user.invitationExpires = undefined;

    await user.save();

    // Auto login
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    setAuthCookies(res, { accessToken, refreshToken });

    res.json({
      success: true,
      message: 'Account activated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    });

  } catch (err) {
    console.error('❌ Accept invitation error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ==========================================
// SEND RESET OTP
// ==========================================
exports.sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    console.log('🔍 OTP Request - User Found:', !!user, 'Email:', email);

    // Always return success to prevent email enumeration, but log internally
    if (!user) {
      console.log('⚠️ OTP Request for non-existent email:', email);
      return res.json({ success: true, message: 'If your email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving (optional but good practice, here we save plain for simplicity or hash usually)
    // For simplicity and matching user request speed, we'll save simple hash or plain.
    // Let's save plain OTP but encrypted? No, just hash it.
    // Actually, to verify we need to compare.
    // Let's save bcrypt hash of OTP.
    const salt = await require('bcryptjs').genSalt(10);
    const otpHash = await require('bcryptjs').hash(otp, salt);

    user.resetOTP = otpHash;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

    // Send Email
    console.log('📨 Sending OTP email to:', user.email, 'OTP:', otp);
    const result = await emailService.sendTransactionalEmail('otpReset', user.email, { otp });

    if (!result.success) {
      console.error('❌ Failed to send OTP email:', result.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email',
        debug_error: result.message, // Explicitly expose error for Vercel debugging
        details: process.env.NODE_ENV === 'development' ? result.message : undefined
      });
    }

    console.log('✅ Email sent successfully'); // Exact log user requested
    res.json({ success: true, message: 'OTP sent to your email.' });

  } catch (err) {
    console.error('❌ Send OTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================
// RESET PASSWORD WITH OTP
// ==========================================
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user || !user.resetOTP) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Verify OTP
    const isMatch = await require('bcryptjs').compare(otp, user.resetOTP);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // Reset Password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login with your new password.' });

  } catch (err) {
    console.error('❌ Reset with OTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};