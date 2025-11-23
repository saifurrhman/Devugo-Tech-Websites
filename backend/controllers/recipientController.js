const EmailRecipient = require('../models/EmailRecipient');
const logger = require('../utils/logger');

exports.getAllRecipients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, verificationStatus, leadStatus } = req.query;

    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (leadStatus) filter.leadStatus = leadStatus;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const recipients = await EmailRecipient.find(filter)
      .populate('lists', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await EmailRecipient.countDocuments(filter);

    res.json({
      success: true,
      data: recipients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    logger.error('Get recipients failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRecipientById = async (req, res) => {
  try {
    const recipient = await EmailRecipient.findById(req.params.id)
      .populate('lists')
      .populate('campaigns.campaign', 'name subject');

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.json({
      success: true,
      data: recipient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createRecipient = async (req, res) => {
  try {
    const recipient = new EmailRecipient(req.body);
    await recipient.save();

    res.status(201).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    logger.error('Create recipient failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateRecipient = async (req, res) => {
  try {
    const recipient = await EmailRecipient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.json({
      success: true,
      data: recipient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteRecipient = async (req, res) => {
  try {
    const recipient = await EmailRecipient.findByIdAndDelete(req.params.id);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadCSV = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'CSV upload feature - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};