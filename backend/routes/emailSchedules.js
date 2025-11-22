const express = require('express');
const router = express.Router();
const EmailSchedule = require('../models/EmailSchedule');
const { auth } = require('../middlewares/auth');

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await EmailSchedule.find()
      .populate('campaign', 'name subject')
      .sort('-scheduledFor');

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/schedules/:id
 * @desc    Get single schedule
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await EmailSchedule.findById(req.params.id)
      .populate('campaign');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/schedules
 * @desc    Create schedule
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const schedule = new EmailSchedule(req.body);
    await schedule.save();

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating schedule',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/schedules/:id
 * @desc    Update schedule
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const schedule = await EmailSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/schedules/:id
 * @desc    Delete schedule
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await EmailSchedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
});

module.exports = router;