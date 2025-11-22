const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Template name is required'],
    unique: true,
    trim: true 
  },
  subject: { 
    type: String, 
    required: [true, 'Template subject is required'],
    trim: true 
  },
  htmlContent: { 
    type: String, 
    required: [true, 'HTML content is required']
  },
  textContent: {
    type: String,
    required: false
  },
  variables: [{
    type: String,
    trim: true
  }], // e.g., ['{{name}}', '{{company}}', '{{customField}}']
  category: {
    type: String,
    enum: ['newsletter', 'promotional', 'transactional', 'followup', 'other'],
    default: 'other'
  },
  thumbnail: {
    type: String,
    required: false
  },
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

// Index for search
emailTemplateSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);