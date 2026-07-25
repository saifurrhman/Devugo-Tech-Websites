const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, adminAuth } = require('../middleware/authMiddleware');

// All notification routes should be protected and only accessible by admin
router.use(protect, adminAuth);

router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
