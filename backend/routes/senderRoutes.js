const express = require('express');
const router = express.Router();
const senderController = require('../controllers/senderController');
const gmailService = require('../services/gmailService');

// Gmail OAuth Routes
router.get('/gmail/auth', (req, res) => {
  const url = gmailService.getAuthUrl();
  res.redirect(url);
});

router.get('/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('Authorization code missing');
    
    await gmailService.handleCallback(code);
    
    // Redirect back to frontend settings page with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/settings/senders?verified=true`);
  } catch (error) {
    console.error('Gmail OAuth Callback Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/settings/senders?error=auth_failed`);
  }
});

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
