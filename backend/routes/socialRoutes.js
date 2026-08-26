const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const socialController = require('../controllers/socialController');

// Configure multer for media upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'social-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Protect all social routes
router.use(protect);

// Account Connections
router.get('/accounts', socialController.getAccounts);
router.post('/accounts/connect', socialController.connectAccount);
router.delete('/accounts/:id', socialController.disconnectAccount);
router.post('/accounts/:id/refresh', socialController.refreshToken);

// Posts CRUD & Validation
router.post('/posts/validate', socialController.validatePost);
router.get('/posts', socialController.getPosts);
router.get('/posts/:id', socialController.getPostById);
router.post('/posts', socialController.createPost);
router.put('/posts/:id', socialController.updatePost);
router.delete('/posts/:id', socialController.deletePost);
router.post('/posts/:id/retry-target', socialController.retrySingleTarget);

// Media Library
router.get('/media', socialController.getMediaLibrary);
router.post('/media/upload', upload.single('file'), socialController.uploadMedia);

// Analytics & Audit
router.get('/analytics/overview', socialController.getAnalyticsOverview);
router.get('/audit-logs', socialController.getAuditLogs);

module.exports = router;
