const mongoose = require('mongoose');

const externalMetricSchema = new mongoose.Schema({
    metric: {
        type: String,
        required: true,
        index: true // e.g., 'traffic_density', 'server_load'
    },
    value: {
        type: Number,
        required: true
    },
    meta: {
        type: mongoose.Schema.Types.Mixed, // flexible for traffic location, etc.
        default: {}
    },
    source: {
        type: String, // e.g., 'n8n', 'zapier'
        default: 'n8n'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ExternalMetric', externalMetricSchema);
