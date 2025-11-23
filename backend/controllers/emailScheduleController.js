const EmailSchedule = require('../models/EmailSchedule');

class EmailScheduleController {

  async getAllSchedules(req, res) {
    try {
      const schedules = await EmailSchedule.find()
        .populate('campaign', 'name subject')
        .sort('-scheduledFor');
      
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Get schedules error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getScheduleById(req, res) {
    try {
      const schedule = await EmailSchedule.findById(req.params.id)
        .populate('campaign');
      
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createSchedule(req, res) {
    try {
      const schedule = new EmailSchedule(req.body);
      await schedule.save();
      
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateSchedule(req, res) {
    try {
      const schedule = await EmailSchedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteSchedule(req, res) {
    try {
      const schedule = await EmailSchedule.findByIdAndDelete(req.params.id);
      
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EmailScheduleController();