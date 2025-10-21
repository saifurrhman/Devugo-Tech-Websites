const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const passport = require('passport');

console.log('📋 Loading auth routes...');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/reset-password', ctrl.requestPasswordReset);
router.post('/reset', ctrl.resetPassword);

// ============================================
// OAUTH ROUTES
// ============================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }), ctrl.googleCallback);

router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_liteprofile', 'r_emailaddress'] }));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login?error=linkedin_auth_failed' }), ctrl.linkedinCallback);

// ============================================
// SIGNUP ROUTE
// ============================================
// This route checks ALLOW_PUBLIC_SIGNUP environment variable
// If true: Anyone can signup
// If false: Only authenticated admin/editor can create users
router.post('/signup', (req, res, next) => {
  console.log('📝 Signup route hit');
  next();
}, ctrl.signup);

router.post('/register', ctrl.signup); // Alias

// ============================================
// AUTHENTICATED ROUTES
// ============================================
router.get('/me', requireAuth, ctrl.getMe);
router.post('/logout', requireAuth, ctrl.logout);
router.patch('/me', requireAuth, ctrl.updateMe);
router.post('/change-password', requireAuth, ctrl.changePassword);

console.log('✅ Auth routes loaded successfully');

module.exports = router;