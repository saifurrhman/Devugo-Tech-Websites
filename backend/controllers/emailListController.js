const EmailList = require('../models/EmailList');
const EmailRecipient = require('../models/EmailRecipient');

class EmailListController {
  
  async getAllLists(req, res) {
    try {
      const lists = await EmailList.find({ createdBy: req.user._id })
        .populate('recipients', 'email firstName lastName company')
        .sort('-createdAt');

      res.json({ success: true, data: lists });
    } catch (error) {
      console.error('Get lists error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getListById(req, res) {
    try {
      const list = await EmailList.findById(req.params.id)
        .populate('recipients')
        .populate('createdBy', 'name email');

      if (!list) {
        return res.status(404).json({ success: false, message: 'List not found' });
      }

      res.json({ success: true, data: list });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createList(req, res) {
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

      if (recipients && recipients.length > 0) {
        await EmailRecipient.updateMany(
          { _id: { $in: recipients } },
          { $addToSet: { lists: list._id } }
        );
      }

      res.status(201).json({ success: true, data: list });
    } catch (error) {
      console.error('Create list error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateList(req, res) {
    try {
      const { name, description, tags } = req.body;

      const list = await EmailList.findByIdAndUpdate(
        req.params.id,
        { name, description, tags },
        { new: true, runValidators: true }
      );

      if (!list) {
        return res.status(404).json({ success: false, message: 'List not found' });
      }

      res.json({ success: true, data: list });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteList(req, res) {
    try {
      const list = await EmailList.findByIdAndDelete(req.params.id);

      if (!list) {
        return res.status(404).json({ success: false, message: 'List not found' });
      }

      await EmailRecipient.updateMany(
        { lists: list._id },
        { $pull: { lists: list._id } }
      );

      res.json({ success: true, message: 'List deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new EmailListController();