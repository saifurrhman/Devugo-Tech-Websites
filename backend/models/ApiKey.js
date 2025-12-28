const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    scopes: [{
        type: String,
        enum: ['metrics:write', 'blog:write', 'contacts:write', 'contacts:read'],
        default: ['metrics:write']
    }],
    lastUsed: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
