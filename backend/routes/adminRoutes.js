const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Protect all admin routes - Only Admin (Super Admin) can access
router.use(requireAuth);
router.use(requireRole('admin'));

// User Invitation
router.post('/invite', adminController.inviteUser);
router.post('/invite/:id/resend', adminController.resendInvitation);

// User Management
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.get('/users/:id/activity', adminController.getUserActivity);

module.exports = router;
