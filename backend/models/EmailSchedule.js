const mongoose = require('mongoose');

const emailScheduleSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'once'
  },
  cronExpression: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  lastRunAt: {
    type: Date,
    default: null
  },
  nextRunAt: {
    type: Date,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  error: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

emailScheduleSchema.index({ scheduledFor: 1, status: 1 });
emailScheduleSchema.index({ campaign: 1 });

module.exports = mongoose.model('EmailSchedule', emailScheduleSchema);