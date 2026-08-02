const express = require('express');
const router = express.Router();
const inboxController = require('../controllers/inboxController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, inboxController.getMessages);
router.post('/send', auth, inboxController.sendMessage);
router.get('/:id', auth, inboxController.getMessage);
router.post('/:id/reply', auth, inboxController.sendReply);

// Webhook for n8n AI Agent 2 to push classification back
router.put('/:id/classify', inboxController.classifyMessage);

module.exports = router;
