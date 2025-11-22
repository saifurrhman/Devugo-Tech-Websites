const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message Type
  type: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'internal_note', 'system'],
    default: 'email',
    index: true
  },

  // Conversation Thread
  conversationId: {
    type: String,
    index: true,
    required: true
  },
  threadId: String, // For email threading
  inReplyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Direction
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true,
    index: true
  },

  // Sender/Recipient Info
  from: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: String
  },
  
  to: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: String
  }],
  
  cc: [{
    email: String,
    name: String
  }],
  
  bcc: [{
    email: String,
    name: String
  }],

  // Message Content
  subject: {
    type: String,
    trim: true
  },
  body: {
    html: String,
    text: String
  },
  snippet: String, // First 150 chars for preview

  // Email Headers
  messageId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  references: [String], // Email references for threading
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    contentId: String // For inline images
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'sent',
    index: true
  },
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  
  // Important/Flagged
  isImportant: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },

  // Campaign Reference (if part of campaign)
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    index: true
  },
  
  // Recipient Reference
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient',
    index: true
  },

  // Tracking Reference
  tracking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTracking'
  },

  // AI Analysis (for replies)
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral'
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    intent: {
      type: String,
      enum: ['interested', 'not_interested', 'request_info', 'meeting_request', 'question', 'complaint', 'other'],
    },
    topics: [String],
    keyPhrases: [String],
    suggestedResponse: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    requiresAction: {
      type: Boolean,
      default: false
    },
    analyzedAt: Date,
    confidence: Number // 0-100
  },

  // Auto-categorization
  category: {
    type: String,
    enum: ['lead', 'support', 'sales', 'billing', 'feedback', 'other'],
    index: true
  },
  
  tags: [String],

  // Spam/Security
  isSpam: {
    type: Boolean,
    default: false
  },
  spamScore: Number,
  
  // Bounce Info (for bounced emails)
  bounceDetails: {
    bounceType: {
      type: String,
      enum: ['hard', 'soft', 'complaint', 'suppression']
    },
    bounceReason: String,
    diagnosticCode: String,
    bouncedAt: Date
  },

  // Delivery Info
  deliveryStatus: {
    attempts: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    delivered: Boolean,
    deliveredAt: Date,
    failureReason: String
  },

  // SMTP Info
  smtpInfo: {
    server: String,
    messageId: String,
    response: String
  },

  // Scheduled Send
  scheduledFor: Date,

  // Response/Reply Info
  isReply: {
    type: Boolean,
    default: false
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  hasReplies: {
    type: Boolean,
    default: false
  },
  replyCount: {
    type: Number,
    default: 0
  },

  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,

  // Internal Notes
  internalNotes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpStatus: {
    type: String,
    enum: ['pending', 'completed', 'cancelled']
  },

  // Source
  source: {
    type: String,
    enum: ['campaign', 'manual', 'api', 'webhook', 'integration', 'reply'],
    default: 'campaign'
  },
  sourceDetails: mongoose.Schema.Types.Mixed,

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // User tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ 'from.email': 1 });
messageSchema.index({ 'to.email': 1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ campaign: 1, status: 1 });
messageSchema.index({ isRead: 1, direction: 1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ assignedTo: 1, isRead: 1 });

// Text index for search
messageSchema.index({ 
  subject: 'text', 
  'body.text': 'text',
  snippet: 'text'
});

// Virtual for display name
messageSchema.virtual('fromName').get(function() {
  return this.from.name || this.from.email.split('@')[0];
});

messageSchema.virtual('primaryRecipient').get(function() {
  if (this.to && this.to.length > 0) {
    return this.to[0].name || this.to[0].email;
  }
  return null;
});

// Method to mark as read
messageSchema.methods.markAsRead = function(userId = null) {
  this.isRead = true;
  this.readAt = new Date();
  if (userId) {
    this.lastModifiedBy = userId;
  }
  return this.save();
};

// Method to add internal note
messageSchema.methods.addNote = function(noteText, userId) {
  this.internalNotes.push({
    text: noteText,
    createdBy: userId,
    createdAt: new Date()
  });
  return this.save();
};

// Method to assign to user
messageSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  return this.save();
};

// Static method to create conversation ID
messageSchema.statics.generateConversationId = function(email1, email2) {
  const emails = [email1, email2].sort();
  return `conv_${emails.join('_').replace(/[^a-zA-Z0-9]/g, '_')}`;
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = async function(userId = null, filters = {}) {
  const query = { 
    isRead: false, 
    direction: 'inbound',
    ...filters 
  };
  
  if (userId) {
    query.assignedTo = userId;
  }
  
  return this.countDocuments(query);
};

// Static method to get conversation thread
messageSchema.statics.getConversationThread = async function(conversationId) {
  return this.find({ conversationId })
    .sort({ createdAt: 1 })
    .populate('from.email to.email')
    .populate('createdBy', 'name email')
    .exec();
};

// Pre-save hook
messageSchema.pre('save', function(next) {
  // Generate snippet if not provided
  if (!this.snippet && this.body && this.body.text) {
    this.snippet = this.body.text.substring(0, 150);
  }
  
  // Set conversation ID if not set
  if (!this.conversationId && this.from && this.to && this.to[0]) {
    this.conversationId = this.constructor.generateConversationId(
      this.from.email, 
      this.to[0].email
    );
  }
  
  next();
});

// Post-save hook to update parent message reply count
messageSchema.post('save', async function(doc) {
  if (doc.isReply && doc.replyTo) {
    await this.constructor.findByIdAndUpdate(doc.replyTo, {
      hasReplies: true,
      $inc: { replyCount: 1 }
    });
  }
});

module.exports = mongoose.model('Message', messageSchema);