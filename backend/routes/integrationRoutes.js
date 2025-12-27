const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');

// Public/Redirect routes (if needed, but mostly we use API calls)
// router.get('/zoom/auth', integrationController.zoomAuth); 
// router.get('/zoom/callback', integrationController.zoomCallback);

// Protected Routes (User actions)
router.post('/zoom/connect', protect, integrationController.connectZoom);
router.get('/zoom/auth-url', protect, integrationController.zoomAuth); // New: Get URL dynamically
router.get('/google/get-url', protect, integrationController.googleAuth);
router.post('/google/connect', protect, integrationController.connectGoogle);
router.post('/calendly', protect, integrationController.saveCalendly);
router.post('/create-meeting', protect, integrationController.createExternalMeeting);
router.get('/status', protect, integrationController.getStatus);

// Configuration Routes
router.post('/config', protect, integrationController.updateCredentials);
router.get('/config-status', protect, integrationController.getCredentialsStatus);

module.exports = router;
