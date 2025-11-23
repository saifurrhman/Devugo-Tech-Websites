const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, meetingController.getAllMeetings);
router.get('/:id', auth, meetingController.getMeetingById);
router.post('/', auth, meetingController.createMeeting);
router.put('/:id', auth, meetingController.updateMeeting);
router.delete('/:id', auth, meetingController.deleteMeeting);

module.exports = router;