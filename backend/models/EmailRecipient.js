const mongoose = require('mongoose');

const emailRecipientSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  name: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: { 
    type: String, 
    enum: ['active', 'unsubscribed', 'bounced', 'complained'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailList'
  }],
  source: {
    type: String,
    enum: ['manual', 'csv_upload', 'api', 'form', 'import'],
    default: 'manual'
  },
  lastEmailedAt: {
    type: Date,
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Compound index for email uniqueness
emailRecipientSchema.index({ email: 1 }, { unique: true });
emailRecipientSchema.index({ status: 1 });
emailRecipientSchema.index({ tags: 1 });

module.exports = mongoose.model('EmailRecipient', emailRecipientSchema);