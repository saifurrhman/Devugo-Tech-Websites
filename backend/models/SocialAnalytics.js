const mongoose = require('mongoose');

const socialAnalyticsSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialPost'
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'pinterest'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  impressions: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  websiteTraffic: { type: Number, default: 0 }
}, {
  timestamps: true
});

socialAnalyticsSchema.index({ account: 1, date: 1 });
socialAnalyticsSchema.index({ post: 1 });

module.exports = mongoose.model('SocialAnalytics', socialAnalyticsSchema);
