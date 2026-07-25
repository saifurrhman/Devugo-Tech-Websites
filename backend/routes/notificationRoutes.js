const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// All notification routes should be protected and only accessible by admin/website_manager
router.use(protect, authorize('admin', 'website_manager'));

router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
