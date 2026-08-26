const mongoose = require('mongoose');

const targetResultSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount',
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'pinterest'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  externalPostId: {
    type: String,
    default: ''
  },
  externalUrl: {
    type: String,
    default: ''
  },
  errorCode: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  publishedAt: {
    type: Date
  },
  retriesCount: {
    type: Number,
    default: 0
  }
}, { _id: false });

const socialPostSchema = new mongoose.Schema({
  globalText: {
    type: String,
    required: true,
    trim: true
  },
  platformOverrides: {
    facebook: { text: String, mediaIds: [String] },
    instagram: { text: String, mediaIds: [String] },
    linkedin: { text: String, mediaIds: [String] },
    twitter: { text: String, mediaIds: [String] },
    tiktok: { text: String, mediaIds: [String] },
    youtube: { text: String, title: String, mediaIds: [String] },
    pinterest: { text: String, title: String, link: String, mediaIds: [String] }
  },
  mediaAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialMediaAsset'
  }],
  selectedAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount',
    required: true
  }],
  scheduledAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'partial_failure', 'failed', 'cancelled'],
    default: 'draft'
  },
  targetResults: [targetResultSchema],
  campaign: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  utmParams: {
    utm_source: { type: String, default: '' },
    utm_medium: { type: String, default: 'social' },
    utm_campaign: { type: String, default: '' },
    utm_term: { type: String, default: '' },
    utm_content: { type: String, default: '' },
    autoAppend: { type: Boolean, default: true }
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

socialPostSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('SocialPost', socialPostSchema);
