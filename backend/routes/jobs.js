const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');

const aiPersonalizerJob = require('../jobs/aiPersonalizer');
const emailTrackerJob = require('../jobs/emailTracker');
const followUpAutomationJob = require('../jobs/followUpAutomation');

/**
 * Get all jobs status
 */
router.get('/status', auth, checkRole(['admin']), (req, res) => {
  res.json({
    success: true,
    data: {
      aiPersonalizer: aiPersonalizerJob.getStatus(),
      emailTracker: emailTrackerJob.getStatus(),
      followUpAutomation: followUpAutomationJob.getStatus()
    }
  });
});

module.exports = router;