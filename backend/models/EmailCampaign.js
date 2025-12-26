const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    default: 'email'
  },
  subject: {
    type: String,
    required: function () { return this.type === 'email'; },
    trim: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: false
  },
  senderName: String,
  senderEmail: String,
  replyTo: String,
  previewText: String,
  audience: [String],
  contentHtml: String,
  htmlContent: {
    type: String,
    required: false
  },
  smsContent: {
    type: String,
    required: function () { return this.type === 'sms'; },
    maxLength: 160 // Standard SMS length recommendation
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient'
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'completed', 'failed', 'paused'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
emailCampaignSchema.index({ status: 1, scheduledAt: 1 });
emailCampaignSchema.index({ createdBy: 1 });

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);