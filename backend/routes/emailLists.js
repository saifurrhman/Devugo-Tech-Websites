const express = require('express');
const router = express.Router();
const EmailList = require('../models/EmailList');
const EmailRecipient = require('../models/EmailRecipient');
const { auth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

/**
 * @route   GET /api/lists
 * @desc    Get all email lists
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const lists = await EmailList.find({ createdBy: req.user._id })
      .populate('recipients', 'email firstName lastName company')
      .sort('-createdAt');

    res.json({
      success: true,
      data: lists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lists',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/lists/:id
 * @desc    Get single list
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await EmailList.findById(req.params.id)
      .populate('recipients')
      .populate('createdBy', 'name email');

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching list',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lists
 * @desc    Create new list
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, tags, recipients } = req.body;

    const list = new EmailList({
      name,
      description,
      tags,
      recipients: recipients || [],
      createdBy: req.user._id
    });

    await list.save();

    // Update recipients
    if (recipients && recipients.length > 0) {
      await EmailRecipient.updateMany(
        { _id: { $in: recipients } },
        { $addToSet: { lists: list._id } }
      );
    }

    res.status(201).json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating list',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/lists/:id
 * @desc    Update list
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, tags } = req.body;

    const list = await EmailList.findByIdAndUpdate(
      req.params.id,
      { name, description, tags },
      { new: true, runValidators: true }
    );

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating list',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/lists/:id/recipients
 * @desc    Add recipients to list
 * @access  Private
 */
router.post('/:id/recipients', auth, async (req, res) => {
  try {
    const { recipientIds } = req.body;

    const list = await EmailList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Add recipients to list
    list.recipients = [...new Set([...list.recipients.map(String), ...recipientIds])];
    await list.save();

    // Update recipients
    await EmailRecipient.updateMany(
      { _id: { $in: recipientIds } },
      { $addToSet: { lists: list._id } }
    );

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding recipients',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/lists/:id/recipients/:recipientId
 * @desc    Remove recipient from list
 * @access  Private
 */
router.delete('/:id/recipients/:recipientId', auth, async (req, res) => {
  try {
    const list = await EmailList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    list.recipients = list.recipients.filter(
      r => r.toString() !== req.params.recipientId
    );

    await list.save();

    // Update recipient
    await EmailRecipient.findByIdAndUpdate(
      req.params.recipientId,
      { $pull: { lists: list._id } }
    );

    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing recipient',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/lists/:id
 * @desc    Delete list
 * @access  Private (Admin)
 */
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const list = await EmailList.findByIdAndDelete(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Remove list from recipients
    await EmailRecipient.updateMany(
      { lists: list._id },
      { $pull: { lists: list._id } }
    );

    res.json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting list',
      error: error.message
    });
  }
});

module.exports = router;