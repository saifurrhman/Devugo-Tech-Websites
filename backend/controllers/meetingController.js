const Meeting = require('../models/Meeting');
const EmailRecipient = require('../models/EmailRecipient');
const Project = require('../models/Project');
const calendarService = require('../services/calendarService');

class MeetingController {

  /**
   * Get all meetings
   */
  async getAllMeetings(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        platform,
        startDate,
        endDate,
        client,
        project
      } = req.query;

      const query = {};

      // Filters
      if (status) query.status = status;
      if (platform) query.platform = platform;
      if (client) query.client = client;
      if (project) query.project = project;

      // Date range
      if (startDate || endDate) {
        query.scheduledDate = {};
        if (startDate) query.scheduledDate.$gte = new Date(startDate);
        if (endDate) query.scheduledDate.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [meetings, total] = await Promise.all([
        Meeting.find(query)
          .populate('host', 'name email')
          .populate('client', 'email name company firstName lastName')
          .populate('project', 'title status')
          .populate('participants.user', 'name email')
          .sort({ scheduledDate: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Meeting.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: meetings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching meetings',
        error: error.message
      });
    }
  }

  /**
   * Get single meeting
   */
  async getMeetingById(req, res) {
    try {
      const { id } = req.params;

      const meeting = await Meeting.findById(id)
        .populate('host', 'name email')
        .populate('client')
        .populate('project')
        .populate('participants.user', 'name email')
        .populate('actionItems.assignedTo', 'name email')
        .populate('notes.createdBy', 'name email');

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      res.json({
        success: true,
        data: meeting
      });

    } catch (error) {
      console.error('Get meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching meeting',
        error: error.message
      });
    }
  }

  /**
   * Create new meeting
   */
  async createMeeting(req, res) {
    try {
      const {
        title,
        description,
        agenda,
        type,
        platform,
        scheduledDate,
        duration,
        timezone,
        participants,
        client,
        project
      } = req.body;

      // Create meeting
      const meeting = new Meeting({
        title,
        description,
        agenda,
        type,
        platform,
        scheduledDate,
        duration: duration || 30,
        timezone: timezone || 'UTC',
        participants: participants || [],
        client,
        project,
        host: req.user._id,
        createdBy: req.user._id
      });

      // Generate meeting link based on platform
      if (platform === 'zoom') {
        const zoomMeeting = await calendarService.createZoomMeeting({
          topic: title,
          start_time: scheduledDate,
          duration: duration || 30,
          timezone: timezone || 'UTC'
        });

        meeting.meetingLink = zoomMeeting.join_url;
        meeting.meetingId = zoomMeeting.id.toString();
        meeting.meetingPassword = zoomMeeting.password;
        meeting.zoomMeetingId = zoomMeeting.id.toString();

      } else if (platform === 'google_meet') {
        const googleMeet = await calendarService.createGoogleMeet({
          summary: title,
          description: description,
          start: scheduledDate,
          duration: duration || 30,
          attendees: participants.map(p => p.email)
        });

        meeting.meetingLink = googleMeet.hangoutLink;
        meeting.googleCalendarEventId = googleMeet.id;
      }

      await meeting.save();

      // Update project if provided
      if (project) {
        await Project.findByIdAndUpdate(project, {
          $push: { meetings: meeting._id }
        });
      }

      // Send calendar invites
      // await emailService.sendMeetingInvite(meeting);

      const populatedMeeting = await Meeting.findById(meeting._id)
        .populate('host', 'name email')
        .populate('client')
        .populate('project');

      res.status(201).json({
        success: true,
        message: 'Meeting created successfully',
        data: populatedMeeting
      });

    } catch (error) {
      console.error('Create meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating meeting',
        error: error.message
      });
    }
  }

  /**
   * Update meeting
   */
  async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Don't allow updates to completed meetings
      if (meeting.status === 'completed' && !req.body.allowCompletedUpdate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update completed meeting'
        });
      }

      Object.assign(meeting, updateData);
      await meeting.save();

      // Update calendar if needed
      if (updateData.scheduledDate || updateData.duration) {
        if (meeting.platform === 'google_meet' && meeting.googleCalendarEventId) {
          await calendarService.updateGoogleMeetEvent(
            meeting.googleCalendarEventId,
            {
              start: meeting.scheduledDate,
              duration: meeting.duration
            }
          );
        }
      }

      const updatedMeeting = await Meeting.findById(id)
        .populate('host', 'name email')
        .populate('client')
        .populate('project');

      res.json({
        success: true,
        message: 'Meeting updated successfully',
        data: updatedMeeting
      });

    } catch (error) {
      console.error('Update meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating meeting',
        error: error.message
      });
    }
  }

  /**
   * Add meeting note
   */
  async addNote(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      meeting.notes.push({
        text,
        createdBy: req.user._id
      });

      await meeting.save();

      const updatedMeeting = await Meeting.findById(id)
        .populate('notes.createdBy', 'name email');

      res.json({
        success: true,
        message: 'Note added successfully',
        data: updatedMeeting
      });

    } catch (error) {
      console.error('Add note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding note',
        error: error.message
      });
    }
  }

  /**
   * Add action item
   */
  async addActionItem(req, res) {
    try {
      const { id } = req.params;
      const { task, assignedTo, dueDate } = req.body;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      await meeting.addActionItem({
        task,
        assignedTo,
        dueDate
      });

      const updatedMeeting = await Meeting.findById(id)
        .populate('actionItems.assignedTo', 'name email');

      res.json({
        success: true,
        message: 'Action item added successfully',
        data: updatedMeeting
      });

    } catch (error) {
      console.error('Add action item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding action item',
        error: error.message
      });
    }
  }

  /**
   * Update action item status
   */
  async updateActionItem(req, res) {
    try {
      const { id, actionItemId } = req.params;
      const { status } = req.body;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      const actionItem = meeting.actionItems.id(actionItemId);
      if (!actionItem) {
        return res.status(404).json({
          success: false,
          message: 'Action item not found'
        });
      }

      actionItem.status = status;
      if (status === 'completed') {
        actionItem.completedAt = new Date();
      }

      await meeting.save();

      res.json({
        success: true,
        message: 'Action item updated successfully',
        data: meeting
      });

    } catch (error) {
      console.error('Update action item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating action item',
        error: error.message
      });
    }
  }

  /**
   * Mark meeting as completed
   */
  async markCompleted(req, res) {
    try {
      const { id } = req.params;
      const { recordingUrl } = req.body;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      await meeting.markCompleted(recordingUrl);

      res.json({
        success: true,
        message: 'Meeting marked as completed',
        data: meeting
      });

    } catch (error) {
      console.error('Mark completed error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking meeting as completed',
        error: error.message
      });
    }
  }

  /**
   * Cancel meeting
   */
  async cancelMeeting(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      meeting.status = 'cancelled';

      if (reason) {
        meeting.notes.push({
          text: `Meeting cancelled: ${reason}`,
          createdBy: req.user._id
        });
      }

      await meeting.save();

      // Cancel calendar events
      if (meeting.googleCalendarEventId) {
        await calendarService.cancelGoogleMeetEvent(meeting.googleCalendarEventId);
      }

      res.json({
        success: true,
        message: 'Meeting cancelled successfully',
        data: meeting
      });

    } catch (error) {
      console.error('Cancel meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling meeting',
        error: error.message
      });
    }
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(req, res) {
    try {
      const { id } = req.params;

      const meeting = await Meeting.findById(id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      await meeting.remove();

      res.json({
        success: true,
        message: 'Meeting deleted successfully'
      });

    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting meeting',
        error: error.message
      });
    }
  }

  /**
   * Get upcoming meetings
   */
  async getUpcomingMeetings(req, res) {
    try {
      const { limit = 10 } = req.query;

      const meetings = await Meeting.find({
        scheduledDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate('host', 'name email')
        .populate('client', 'email name firstName lastName company')
        .populate('project', 'title')
        .sort({ scheduledDate: 1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: meetings
      });

    } catch (error) {
      console.error('Get upcoming meetings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming meetings',
        error: error.message
      });
    }
  }
}

module.exports = new MeetingController();