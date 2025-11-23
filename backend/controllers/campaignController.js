const EmailCampaign = require('../models/EmailCampaign');
const EmailRecipient = require('../models/EmailRecipient');
const EmailList = require('../models/EmailList');
const logger = require('../utils/logger');

exports.getAllCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const campaigns = await EmailCampaign.find(filter)
      .populate('template', 'name subject')
      .populate('lists', 'name totalRecipients')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await EmailCampaign.countDocuments(filter);

    res.json({
      success: true,
      data: campaigns,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    logger.error('Get campaigns failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id)
      .populate('template')
      .populate('lists')
      .populate('createdBy', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const campaign = new EmailCampaign({
      ...req.body,
      createdBy: req.user._id
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Create campaign failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};