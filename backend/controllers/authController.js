const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hash });
    const token = signToken(user);
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update basic profile fields
exports.updateMe = async (req, res) => {
  try{
    if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { name, email, phone, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (typeof phone === 'string') updates.phone = phone;
    if (typeof avatar === 'string') updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ user });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = signToken(user);
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user populated by auth middleware
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.logout = async (_req, res) => {
  res.clearCookie('token', { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out' });
};

// Stubs for reset flows
exports.requestPasswordReset = async (_req, res) => {
  res.json({ message: 'Reset link sent if email exists (stub)' });
};

exports.resetPassword = async (_req, res) => {
  res.json({ message: 'Password reset (stub)' });
};

// Change password for logged-in user
exports.changePassword = async (req, res) => {
  try{
    const { currentPassword, newPassword } = req.body;
    if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if(!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if(!ok) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// End of controller
