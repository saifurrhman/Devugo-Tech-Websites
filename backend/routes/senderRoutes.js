const express = require('express');
const router = express.Router();
const senderController = require('../controllers/senderController');

router.get('/', senderController.listSenders);
router.post('/', senderController.createSender);
router.delete('/:id', senderController.deleteSender);
router.get('/verify/:token', senderController.verifySender);
router.post('/resend/:id', senderController.resendVerification);

// Domain Routes
router.get('/domains', senderController.listDomains);
router.post('/domains', senderController.createDomain);
router.delete('/domains/:domain', senderController.deleteDomain);
router.get('/domains/:domain', senderController.getDomain);
router.post('/domains/:domain/verify', senderController.verifyDomain);

module.exports = router;
