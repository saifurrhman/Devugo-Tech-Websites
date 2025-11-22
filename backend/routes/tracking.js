const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { auth } = require('../middlewares/auth');

/**
 * @route   GET /api/tracking/pixel/:trackingId
 * @desc    Track email open (pixel)
 * @access  Public
 */
router.get('/pixel/:trackingId', 
  trackingController.trackOpen
);

/**
 * @route   GET /api/tracking/click/:trackingId
 * @desc    Track email click and redirect
 * @access  Public
 */
router.get('/click/:trackingId', 
  trackingController.trackClick
);

/**
 * @route   POST /api/tracking/open/:trackingId
 * @desc    Track email open (webhook)
 * @access  Public
 */
router.post('/open/:trackingId', 
  trackingController.trackOpen
);

/**
 * @route   POST /api/tracking/click/:trackingId
 * @desc    Track email click (webhook)
 * @access  Public
 */
router.post('/click/:trackingId', 
  trackingController.trackClick
);

/**
 * @route   GET /api/tracking/campaign/:campaignId
 * @desc    Get tracking data for campaign
 * @access  Private
 */
router.get('/campaign/:campaignId', 
  auth, 
  trackingController.getCampaignTracking
);

/**
 * @route   GET /api/tracking/recipient/:recipientId
 * @desc    Get tracking data for recipient
 * @access  Private
 */
router.get('/recipient/:recipientId', 
  auth, 
  trackingController.getRecipientTracking
);

/**
 * @route   GET /api/tracking/analytics
 * @desc    Get tracking analytics with grouping
 * @access  Private
 */
router.get('/analytics', 
  auth, 
  trackingController.getTrackingAnalytics
);

module.exports = router;