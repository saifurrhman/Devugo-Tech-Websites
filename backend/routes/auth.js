const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/reset-password', ctrl.requestPasswordReset);
router.post('/reset', ctrl.resetPassword);

// Protected
router.get('/me', auth, ctrl.getMe);
router.post('/logout', auth, ctrl.logout);
router.patch('/me', auth, ctrl.updateMe);
router.post('/change-password', auth, ctrl.changePassword);

module.exports = router;
