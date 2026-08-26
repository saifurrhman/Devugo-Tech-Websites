const mongoose = require('mongoose');

const socialAuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['CONNECT_ACCOUNT', 'DISCONNECT_ACCOUNT', 'REFRESH_TOKEN', 'PUBLISH_POST', 'SCHEDULE_POST', 'RETRY_POST', 'UPDATE_POST', 'DELETE_POST'],
    required: true
  },
  platform: {
    type: String,
    default: ''
  },
  targetAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount'
  },
  targetPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialPost'
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING'],
    default: 'SUCCESS'
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SocialAuditLog', socialAuditLogSchema);
