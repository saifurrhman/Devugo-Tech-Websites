const mongoose = require('mongoose');

const aiPersonalizationSchema = new mongoose.Schema({
  // Campaign Reference
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    required: true,
    index: true
  },
  
  // Recipient Reference
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient',
    required: true,
    index: true
  },

  // AI Provider
  provider: {
    type: String,
    enum: ['openai', 'claude', 'custom'],
    default: 'openai'
  },
  model: {
    type: String,
    default: 'gpt-4'
  },

  // Input Data (what was sent to AI)
  inputData: {
    recipientInfo: {
      name: String,
      company: String,
      jobTitle: String,
      industry: String,
      customFields: mongoose.Schema.Types.Mixed
    },
    templateUsed: String,
    prompt: String,
    context: mongoose.Schema.Types.Mixed
  },

  // Generated Content
  generatedContent: {
    subject: String,
    body: String,
    previewText: String,
    callToAction: String
  },

  // AI Response Metadata
  aiMetadata: {
    tokensUsed: Number,
    processingTime: Number, // in milliseconds
    confidence: Number, // 0-100
    temperature: Number,
    maxTokens: Number
  },

  // Quality Score
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },

  // Personalization Elements
  personalizationTags: [{
    tag: String,
    value: String,
    source: {
      type: String,
      enum: ['recipient_data', 'ai_generated', 'template']
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['pending', 'generated', 'approved', 'rejected', 'sent'],
    default: 'pending',
    index: true
  },

  // Human Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date,

  // Edited version (if human edited AI content)
  editedContent: {
    subject: String,
    body: String,
    changes: [{
      field: String,
      originalValue: String,
      editedValue: String,
      reason: String
    }]
  },

  // Performance (if email was sent)
  performance: {
    sent: Boolean,
    opened: Boolean,
    clicked: Boolean,
    replied: Boolean,
    openedAt: Date,
    clickedAt: Date,
    repliedAt: Date,
    engagementScore: Number
  },

  // Error handling
  error: {
    occurred: {
      type: Boolean,
      default: false
    },
    message: String,
    code: String,
    timestamp: Date
  },

  // Cost tracking
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

// Indexes
aiPersonalizationSchema.index({ campaign: 1, status: 1 });
aiPersonalizationSchema.index({ recipient: 1 });
aiPersonalizationSchema.index({ createdAt: -1 });

// Method to mark as approved
aiPersonalizationSchema.methods.approve = function(userId) {
  this.status = 'approved';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to track performance
aiPersonalizationSchema.methods.updatePerformance = function(eventType) {
  this.performance.sent = true;
  
  if (eventType === 'opened') {
    this.performance.opened = true;
    this.performance.openedAt = new Date();
  } else if (eventType === 'clicked') {
    this.performance.clicked = true;
    this.performance.clickedAt = new Date();
  } else if (eventType === 'replied') {
    this.performance.replied = true;
    this.performance.repliedAt = new Date();
  }
  
  // Calculate engagement score
  let score = 0;
  if (this.performance.sent) score += 25;
  if (this.performance.opened) score += 25;
  if (this.performance.clicked) score += 25;
  if (this.performance.replied) score += 25;
  
  this.performance.engagementScore = score;
  
  return this.save();
};

// Static method to get AI usage stats
aiPersonalizationSchema.statics.getUsageStats = async function(campaignId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        campaign: mongoose.Types.ObjectId(campaignId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalGenerated: { $sum: 1 },
        totalTokens: { $sum: '$aiMetadata.tokensUsed' },
        totalCost: { $sum: '$cost.amount' },
        avgQualityScore: { $avg: '$qualityScore' },
        avgEngagementScore: { $avg: '$performance.engagementScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('AIPersonalization', aiPersonalizationSchema);