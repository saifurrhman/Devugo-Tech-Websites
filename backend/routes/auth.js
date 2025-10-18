const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/reset-password', ctrl.requestPasswordReset);
router.post('/reset', ctrl.resetPassword);

// Admin/editor create users (unless ALLOW_PUBLIC_SIGNUP=true)
// Modified to allow public signup
router.post('/register', ctrl.signup);

// Authenticated
router.get('/me', requireAuth, ctrl.getMe);
router.post('/logout', requireAuth, ctrl.logout);
router.patch('/me', requireAuth, ctrl.updateMe);
router.post('/change-password', requireAuth, ctrl.changePassword);

module.exports = router;
