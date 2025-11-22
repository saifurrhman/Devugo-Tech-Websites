const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  campaign: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailCampaign',
    required: false
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailRecipient',
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'complained'],
    default: 'queued'
  },
  queuedAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  openedAt: {
    type: Date,
    default: null
  },
  clickedAt: {
    type: Date,
    default: null
  },
  bouncedAt: {
    type: Date,
    default: null
  },
  openCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: null
  },
  emailProvider: {
    type: String,
    default: 'smtp'
  },
  messageId: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// Indexes for performance
emailLogSchema.index({ campaign: 1, status: 1 });
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ recipientEmail: 1 });
emailLogSchema.index({ status: 1, sentAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);