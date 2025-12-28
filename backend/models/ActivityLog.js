const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true // e.g., 'GET /api/projects'
    },
    method: String,
    path: String,
    ip: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Auto-delete logs after 30 days
    }
}, {
    timestamps: true
});

// Index for fast querying by user and time
activityLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
