const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * @route   POST /api/webhooks/n8n
 * @desc    Handle n8n automation webhooks
 * @access  Public (with validation)
 */
router.post('/n8n', 
  webhookController.handleN8NWebhook
);

/**
 * @route   POST /api/webhooks/sendgrid
 * @desc    Handle SendGrid email events
 * @access  Public (SendGrid verified)
 */
router.post('/sendgrid', 
  webhookController.handleSendGridWebhook
);

/**
 * @route   POST /api/webhooks/email/incoming
 * @desc    Handle incoming email replies
 * @access  Public (with validation)
 */
router.post('/email/incoming', 
  webhookController.handleIncomingEmail
);

/**
 * @route   POST /api/webhooks/zoom
 * @desc    Handle Zoom meeting events
 * @access  Public (Zoom verified)
 */
router.post('/zoom', (req, res) => {
  // Zoom webhook handler
  console.log('Zoom webhook:', req.body);
  res.sendStatus(200);
});

/**
 * @route   POST /api/webhooks/google-calendar
 * @desc    Handle Google Calendar events
 * @access  Public (Google verified)
 */
router.post('/google-calendar', (req, res) => {
  // Google Calendar webhook handler
  console.log('Google Calendar webhook:', req.body);
  res.sendStatus(200);
});

/**
 * @route   GET /api/webhooks/health
 * @desc    Webhook health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhooks are operational',
    timestamp: new Date()
  });
});

module.exports = router;