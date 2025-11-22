const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middlewares/auth');

/**
 * @route   GET /api/messages
 * @desc    Get all messages (inbox)
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { direction, isRead, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (direction) filter.direction = direction;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const messages = await Message.find(filter)
      .populate('recipient', 'email firstName lastName company')
      .populate('campaign', 'name')
      .populate('assignedTo', 'name email')
      .sort('-receivedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Message.countDocuments(filter);

    res.json({
      success: true,
      data: messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/:id
 * @desc    Get single message
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('recipient')
      .populate('campaign')
      .populate('tracking');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/messages/:id/assign
 * @desc    Assign message to user
 * @access  Private
 */
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning message',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete message
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
});

module.exports = router;