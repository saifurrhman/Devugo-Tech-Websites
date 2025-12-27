const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/auth');

// Protect AI routes
router.use(requireAuth);

router.post('/generate', aiController.generateEmailTemplate);

module.exports = router;
