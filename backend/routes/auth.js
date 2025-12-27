const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const User = require('../models/User'); // ✅ FIXED: Added missing import

console.log('📋 Loading auth routes...');

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', ctrl.signup);

// @route   POST /api/auth/register (alias)
router.post('/register', ctrl.signup);

// @route   POST /api/auth/login
// @desc    Login with email and password
// @access  Public
router.post('/login', ctrl.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', ctrl.refresh);

// @route   POST /api/auth/reset-password
// @desc    Request password reset
// @access  Public
router.post('/reset-password', ctrl.requestPasswordReset);

// @route   POST /api/auth/reset-password-confirm
// @desc    Reset password with token
// @access  Public
// @route   POST /api/auth/reset-password-confirm
// @desc    Reset password with token
// @access  Public
router.post('/reset-password-confirm', ctrl.resetPassword);

// @route   POST /api/auth/invite/accept
// @desc    Accept invitation and set password
// @access  Public
router.post('/invite/accept', ctrl.acceptInvitation);

// ============================================
// PROTECTED ROUTES
// ============================================

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', requireAuth, ctrl.getMe);

// @route   PATCH /api/auth/me
// @desc    Update profile
// @access  Private
router.patch('/me', requireAuth, ctrl.updateMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', requireAuth, ctrl.logout);

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', requireAuth, ctrl.changePassword);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort('-createdAt');
    res.json({
      success: true,
      data: { users, count: users.length }
    });
  } catch (err) {
    console.error('❌ Get users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

console.log('✅ Auth routes loaded');

console.log('🔍 Checking Controller Exports:', Object.keys(ctrl));

router.get('/test-otp', (req, res) => res.json({ message: 'OTP Route Reachable' }));
router.post('/send-otp', ctrl.sendResetOTP);
router.post('/reset-password-otp', ctrl.resetPasswordWithOTP);

module.exports = router;