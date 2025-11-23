const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipientController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, recipientController.getAllRecipients);
router.get('/:id', auth, recipientController.getRecipientById);
router.post('/', auth, recipientController.createRecipient);
router.put('/:id', auth, recipientController.updateRecipient);
router.delete('/:id', auth, recipientController.deleteRecipient);

module.exports = router;