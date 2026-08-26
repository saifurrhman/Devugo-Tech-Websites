const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'pinterest'],
    required: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  accountHandle: {
    type: String,
    trim: true
  },
  accountId: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  profileUrl: {
    type: String,
    default: ''
  },
  encryptedAccessToken: {
    type: String,
    required: true
  },
  encryptedRefreshToken: {
    type: String,
    default: ''
  },
  tokenExpiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['connected', 'needs_reconnect', 'error', 'expired'],
    default: 'connected'
  },
  statusMessage: {
    type: String,
    default: ''
  },
  lastRefreshedAt: {
    type: Date,
    default: Date.now
  },
  followersCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

socialAccountSchema.index({ platform: 1, accountId: 1 }, { unique: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
