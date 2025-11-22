const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectType: {
    type: String,
    enum: ['web_development', 'mobile_app', 'design', 'marketing', 'consulting', 'other'],
    default: 'web_development'
  },

  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient',
    required: true,
    index: true
  },
  clientContact: {
    email: String,
    phone: String,
    whatsapp: String
  },

  // Campaign Reference (if came from campaign)
  sourceCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign'
  },

  // Project Status
  status: {
    type: String,
    enum: ['lead', 'proposal', 'negotiation', 'won', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'lead',
    index: true
  },

  // Timeline
  startDate: Date,
  endDate: Date,
  expectedDelivery: Date,
  actualDelivery: Date,

  // Financial
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  finalAmount: Number,
  paymentTerms: String,
  
  // Invoices
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  totalPaid: {
    type: Number,
    default: 0
  },

  // Project Details
  requirements: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],

  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'delayed'],
      default: 'pending'
    },
    payment: Number
  }],

  deliverables: [{
    title: String,
    description: String,
    fileUrl: String,
    deliveredDate: Date,
    approved: {
      type: Boolean,
      default: false
    }
  }],

  // Team Assignment
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Meetings
  meetings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  }],

  // Communication
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],

  // Files & Documents
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Project Health
  healthStatus: {
    type: String,
    enum: ['on_track', 'at_risk', 'delayed', 'blocked'],
    default: 'on_track'
  },

  // Metadata
  tags: [String],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes
projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ assignedTo: 1 });

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / this.milestones.length) * 100);
});

// Virtual for payment status
projectSchema.virtual('paymentStatus').get(function() {
  if (!this.finalAmount) return 'not_set';
  if (this.totalPaid >= this.finalAmount) return 'paid';
  if (this.totalPaid > 0) return 'partial';
  return 'unpaid';
});

// Method to update health status
projectSchema.methods.updateHealthStatus = function() {
  const now = new Date();
  
  // Check if project is delayed
  if (this.expectedDelivery && now > this.expectedDelivery && this.status === 'in_progress') {
    this.healthStatus = 'delayed';
    return;
  }

  // Check milestones
  const delayedMilestones = this.milestones.filter(m => 
    m.status !== 'completed' && m.dueDate && now > m.dueDate
  );

  if (delayedMilestones.length > 0) {
    this.healthStatus = 'at_risk';
    return;
  }

  this.healthStatus = 'on_track';
};

module.exports = mongoose.model('Project', projectSchema);