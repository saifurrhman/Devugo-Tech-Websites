const mongoose = require('mongoose');

const emailTrackingSchema = new mongoose.Schema({
  // Email Reference
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    required: true,
    index: true
  },
 recipient: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'EmailRecipient',
  required: true
},
  emailLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailLog'
  },

  // Email Details
  messageId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  subject: String,
  fromEmail: String,
  toEmail: {
    type: String,
    required: true
  },

  // Tracking Events
  events: [{
    type: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'complained', 'unsubscribed'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      region: String
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown']
    },
    os: String,
    browser: String,
    
    // For click events
    linkUrl: String,
    linkText: String,
    
    // For bounce/complaint
    bounceReason: String,
    bounceType: {
      type: String,
      enum: ['hard', 'soft', 'complaint']
    }
  }],

  // Quick Status (for fast queries)
  status: {
    sent: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    opened: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
    bounced: { type: Boolean, default: false },
    complained: { type: Boolean, default: false },
    unsubscribed: { type: Boolean, default: false }
  },

  // Timestamps (first occurrence)
  sentAt: Date,
  deliveredAt: Date,
  firstOpenedAt: Date,
  firstClickedAt: Date,
  repliedAt: Date,
  bouncedAt: Date,

  // Counts
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  
  // Last activity
  lastOpenedAt: Date,
  lastClickedAt: Date,

  // Engagement Score (0-100)
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }

}, {
  timestamps: true
});

// Indexes for performance
emailTrackingSchema.index({ campaign: 1, status: 1 });
// emailTrackingSchema.index({ recipient: 1, createdAt: -1 });
emailTrackingSchema.index({ toEmail: 1 });
emailTrackingSchema.index({ 'status.opened': 1 });
emailTrackingSchema.index({ 'status.clicked': 1 });

// Method to add tracking event
emailTrackingSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  
  const eventType = eventData.type;
  this.status[eventType] = true;

  // Update first occurrence timestamps
  const timestampField = `${eventType}At`;
  if (eventType === 'opened') {
    this.openCount += 1;
    if (!this.firstOpenedAt) this.firstOpenedAt = eventData.timestamp;
    this.lastOpenedAt = eventData.timestamp;
  } else if (eventType === 'clicked') {
    this.clickCount += 1;
    if (!this.firstClickedAt) this.firstClickedAt = eventData.timestamp;
    this.lastClickedAt = eventData.timestamp;
  } else if (!this[timestampField]) {
    this[timestampField] = eventData.timestamp;
  }

  // Calculate engagement score
  this.calculateEngagementScore();
};

// Calculate engagement score
emailTrackingSchema.methods.calculateEngagementScore = function() {
  let score = 0;
  
  if (this.status.delivered) score += 10;
  if (this.status.opened) score += 30;
  if (this.status.clicked) score += 40;
  if (this.status.replied) score += 50;
  
  // Bonus for multiple opens/clicks
  score += Math.min(this.openCount * 2, 10);
  score += Math.min(this.clickCount * 5, 20);
  
  // Penalties
  if (this.status.bounced) score = 0;
  if (this.status.complained) score = 0;
  if (this.status.unsubscribed) score -= 20;
  
  this.engagementScore = Math.max(0, Math.min(100, score));
};

module.exports = mongoose.model('EmailTracking', emailTrackingSchema);