const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { auth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings
 * @access  Private
 */
router.get('/', 
  auth, 
  meetingController.getAllMeetings
);

/**
 * @route   GET /api/meetings/upcoming
 * @desc    Get upcoming meetings
 * @access  Private
 */
router.get('/upcoming', 
  auth, 
  meetingController.getUpcomingMeetings
);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get single meeting
 * @access  Private
 */
router.get('/:id', 
  auth, 
  meetingController.getMeetingById
);

/**
 * @route   POST /api/meetings
 * @desc    Create new meeting
 * @access  Private
 */
router.post('/', 
  auth, 
  meetingController.createMeeting
);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting
 * @access  Private
 */
router.put('/:id', 
  auth, 
  meetingController.updateMeeting
);

/**
 * @route   POST /api/meetings/:id/notes
 * @desc    Add note to meeting
 * @access  Private
 */
router.post('/:id/notes', 
  auth, 
  meetingController.addNote
);

/**
 * @route   POST /api/meetings/:id/action-items
 * @desc    Add action item to meeting
 * @access  Private
 */
router.post('/:id/action-items', 
  auth, 
  meetingController.addActionItem
);

/**
 * @route   PUT /api/meetings/:id/action-items/:actionItemId
 * @desc    Update action item status
 * @access  Private
 */
router.put('/:id/action-items/:actionItemId', 
  auth, 
  meetingController.updateActionItem
);

/**
 * @route   POST /api/meetings/:id/complete
 * @desc    Mark meeting as completed
 * @access  Private
 */
router.post('/:id/complete', 
  auth, 
  meetingController.markCompleted
);

/**
 * @route   POST /api/meetings/:id/cancel
 * @desc    Cancel meeting
 * @access  Private
 */
router.post('/:id/cancel', 
  auth, 
  meetingController.cancelMeeting
);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting
 * @access  Private (Admin)
 */
router.delete('/:id', 
  auth, 
  checkRole(['admin']),
  meetingController.deleteMeeting
);

module.exports = router;