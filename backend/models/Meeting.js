const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  // Meeting Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  agenda: String,

  // Type & Platform
  type: {
    type: String,
    enum: ['discovery', 'proposal', 'kickoff', 'review', 'demo', 'followup', 'other'],
    default: 'discovery'
  },
  platform: {
    type: String,
    enum: ['zoom', 'google_meet', 'microsoft_teams', 'in_person', 'phone', 'other'],
    default: 'zoom'
  },

  // Schedule
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  endTime: Date,

  // Meeting Link
  meetingLink: String,
  meetingId: String,
  meetingPassword: String,

  // Participants
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    name: String,
    role: {
      type: String,
      enum: ['host', 'participant', 'optional']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending'
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],

  // Client/Project Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign'
  },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
    index: true
  },

  // Meeting Notes
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Action Items
  actionItems: [{
    task: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completedAt: Date
  }],

  // Recording
  recordingUrl: String,
  recordingDuration: Number,

  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Reminders
  reminders: [{
    sentAt: Date,
    type: {
      type: String,
      enum: ['24h_before', '1h_before', '15m_before', 'custom']
    },
    recipients: [String]
  }],

  // Calendar Integration
  googleCalendarEventId: String,
  zoomMeetingId: String,
  
  // Metadata
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

// Indexes
meetingSchema.index({ scheduledDate: 1, status: 1 });
meetingSchema.index({ host: 1 });
meetingSchema.index({ client: 1 });
meetingSchema.index({ project: 1 });

// Virtual for meeting end time
meetingSchema.virtual('calculatedEndTime').get(function() {
  if (this.scheduledDate && this.duration) {
    return new Date(this.scheduledDate.getTime() + this.duration * 60000);
  }
  return null;
});

// Method to mark as completed
meetingSchema.methods.markCompleted = function(recordingUrl = null) {
  this.status = 'completed';
  if (recordingUrl) {
    this.recordingUrl = recordingUrl;
  }
  return this.save();
};

// Method to add action item
meetingSchema.methods.addActionItem = function(actionItemData) {
  this.actionItems.push(actionItemData);
  return this.save();
};

module.exports = mongoose.model('Meeting', meetingSchema);