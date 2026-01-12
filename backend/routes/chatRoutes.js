const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Public chat route - No authentication required
router.post('/message', chatController.handleChatMessage);

module.exports = router;
