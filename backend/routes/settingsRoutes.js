const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Protect settings routes
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/ai', settingsController.getAIConfig);
router.put('/ai', settingsController.updateAIConfig);

module.exports = router;
