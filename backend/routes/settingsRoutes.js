const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Protect settings routes
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/ai', settingsController.getAIConfig);
router.put('/ai', settingsController.updateAIConfig);

// SMTP / Email Settings
router.get('/smtp', settingsController.getSMTP);
router.put('/smtp', settingsController.updateSMTP);
router.get('/email', settingsController.getSMTP); // Alias
router.put('/email', settingsController.updateSMTP); // Alias

// Integrations
router.get('/integrations', settingsController.getIntegrations);
router.put('/integrations', settingsController.updateIntegrations);

module.exports = router;
