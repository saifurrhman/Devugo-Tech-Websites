const EmailLog = require('../models/EmailLog');

class EmailLogController {

  async getAllLogs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const [logs, total] = await Promise.all([
        EmailLog.find()
          .populate('campaign', 'name')
          .populate('recipient', 'email firstName lastName')
          .sort('-sentAt')
          .limit(limit * 1)
          .skip((page - 1) * limit),
        EmailLog.countDocuments()
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLogById(req, res) {
    try {
      const log = await EmailLog.findById(req.params.id)
        .populate('campaign')
        .populate('recipient');
      
      if (!log) {
        return res.status(404).json({ success: false, message: 'Log not found' });
      }
      
      res.json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EmailLogController();