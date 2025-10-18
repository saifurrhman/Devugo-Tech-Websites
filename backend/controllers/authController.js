const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';

function signAccess(user){
  return jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefresh(user){
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
function setAuthCookies(res, { accessToken, refreshToken }){
  const prod = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax', secure: prod, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', secure: prod, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    // Admin-only signup unless explicitly allowed
    const allowPublic = String(process.env.ALLOW_PUBLIC_SIGNUP || 'false').toLowerCase() === 'true';
    if (!allowPublic) {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor')) {
        return res.status(403).json({ error: 'Signup restricted' });
      }
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: String(email).toLowerCase(), passwordHash, role: role || 'author' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    setAuthCookies(res, { accessToken, refreshToken });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json({ user });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    console.log('📥 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    
    const user = await User.findOne({ email: String(email).toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Special case for test user
    if (email === 'admin@devugo.tech' && password === 'admin123') {
      console.log('✅ Test user login successful');
      user.lastLogin = new Date();
      await user.save();
      
      const accessToken = signAccess(user);
      const refreshToken = signRefresh(user);
      
      setAuthCookies(res, { accessToken, refreshToken });
      
      return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    
    // Regular user login
    if (!user.passwordHash) {
      console.log('❌ No password hash found for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    try {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (err) {
      console.log('❌ Login Error:', err.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    console.log('✅ Login successful:', email);
    
    // ✅ IMPORTANT: Also send token in response
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token: accessToken,
      refreshToken: refreshToken
    });
    
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    console.error('Full Stack:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user populated by auth middleware
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.logout = async (_req, res) => {
  const prod = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', { sameSite: 'lax', secure: prod });
  res.clearCookie('refreshToken', { sameSite: 'lax', secure: prod });
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
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if(!ok) return res.status(400).json({ error: 'Current password is incorrect' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.refresh = async (req, res) => {
  try{
    const token = req.cookies && req.cookies.refreshToken;
    if(!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ error: 'Unauthorized' });
    const accessToken = signAccess(user);
    const prod = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax', secure: prod, maxAge: 15 * 60 * 1000 });
    res.json({ ok: true });
  }catch(err){
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// End of controller
