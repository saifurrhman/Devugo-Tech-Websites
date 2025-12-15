const express = require('express');
const router = express.Router();
const inboxController = require('../controllers/inboxController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, inboxController.getMessages);
router.get('/:id', auth, inboxController.getMessage);
router.post('/:id/reply', auth, inboxController.sendReply);

module.exports = router;
