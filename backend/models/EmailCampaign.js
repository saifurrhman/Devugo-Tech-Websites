const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Campaign name is required'],
    trim: true 
  },
  subject: { 
    type: String, 
    required: [true, 'Email subject is required'],
    trim: true 
  },
  template: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailTemplate',
    required: false
  },
  htmlContent: {
    type: String,
    required: false
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