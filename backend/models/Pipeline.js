const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema({
  // Pipeline Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Pipeline Type
  type: {
    type: String,
    enum: ['sales', 'project', 'support', 'hiring', 'custom'],
    default: 'sales'
  },

  // Stages
  stages: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    order: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      default: '#3B82F6' // Tailwind blue-500
    },
    
    // Stage Settings
    isActive: {
      type: Boolean,
      default: true
    },
    isFinal: {
      type: Boolean,
      default: false
    },
    isWon: {
      type: Boolean,
      default: false
    },
    isLost: {
      type: Boolean,
      default: false
    },
    
    // Automation
    autoAssign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    autoTaskTemplate: String,
    
    // Time tracking
    averageTimeInStage: Number, // in days
    
    // Stats
    totalLeads: {
      type: Number,
      default: 0
    },
    convertedLeads: {
      type: Number,
      default: 0
    }
  }],

  // Pipeline Settings
  settings: {
    allowDuplicates: {
      type: Boolean,
      default: false
    },
    requireNotes: {
      type: Boolean,
      default: false
    },
    notifyOnStageChange: {
      type: Boolean,
      default: true
    }
  },

  // Default pipeline
  isDefault: {
    type: Boolean,
    default: false
  },

  // Active status
  isActive: {
    type: Boolean,
    default: true
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

// Index
pipelineSchema.index({ type: 1, isActive: 1 });

// Ensure only one default pipeline per type
pipelineSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { type: this.type, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Method to add stage
pipelineSchema.methods.addStage = function(stageData) {
  const maxOrder = this.stages.reduce((max, stage) => Math.max(max, stage.order), 0);
  stageData.order = maxOrder + 1;
  this.stages.push(stageData);
  return this.save();
};

// Method to reorder stages
pipelineSchema.methods.reorderStages = function(stageOrders) {
  stageOrders.forEach(({ stageId, newOrder }) => {
    const stage = this.stages.id(stageId);
    if (stage) {
      stage.order = newOrder;
    }
  });
  this.stages.sort((a, b) => a.order - b.order);
  return this.save();
};

module.exports = mongoose.model('Pipeline', pipelineSchema);