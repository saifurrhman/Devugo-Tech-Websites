const mongoose = require('mongoose');

const emailListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'List name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

emailListSchema.index({ name: 1 });

module.exports = mongoose.model('EmailList', emailListSchema);