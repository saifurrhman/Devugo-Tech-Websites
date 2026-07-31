const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'social'],
    default: 'email'
  },
  subject: {
    type: String,
    trim: true
  },
  body: {
    type: String
  },
  htmlContent: {
    type: String
  },
  smsContent: {
    type: String,
    maxLength: 160
  },
  goal: {
    type: String,
    trim: true
  },
  audience: {
    type: String,
    trim: true
  },
  tone: {
    type: String,
    enum: ['professional', 'friendly', 'urgent', 'casual', 'formal'],
    default: 'professional'
  },
  targetList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailList'
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient'
  }],
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  senderName: String,
  senderEmail: String,
  replyTo: String,
  previewText: String,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'completed', 'failed', 'paused', 'cancelled'],
    default: 'draft'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  agentId: {
    type: String,
    default: null
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
    failed: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 }
  },
  tags: [String],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
campaignSchema.index({ status: 1, scheduledAt: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ type: 1 });
campaignSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
