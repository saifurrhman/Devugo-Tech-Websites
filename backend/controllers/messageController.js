const Message = require('../models/Message');

class MessageController {

  async getAllMessages(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const [messages, total] = await Promise.all([
        Message.find()
          .populate('recipient', 'email firstName lastName')
          .sort('-receivedAt')
          .limit(limit * 1)
          .skip((page - 1) * limit),
        Message.countDocuments()
      ]);

      res.json({
        success: true,
        data: messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMessageById(req, res) {
    try {
      const message = await Message.findById(req.params.id)
        .populate('recipient');
      
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      
      res.json({ success: true, data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MessageController();