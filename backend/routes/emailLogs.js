const express = require('express');
const router = express.Router();
const EmailLog = require('../models/EmailLog');
const { auth } = require('../middlewares/auth');

/**
 * @route   GET /api/email-logs
 * @desc    Get all email logs with filters
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { campaign, recipient, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (campaign) filter.campaign = campaign;
    if (recipient) filter.recipient = recipient;
    if (status) filter.status = status;

    const logs = await EmailLog.find(filter)
      .populate('campaign', 'name subject')
      .populate('recipient', 'email firstName lastName')
      .sort('-sentAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await EmailLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching logs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/email-logs/:id
 * @desc    Get single email log
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id)
      .populate('campaign')
      .populate('recipient')
      .populate('template');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching log',
      error: error.message
    });
  }
});

module.exports = router;