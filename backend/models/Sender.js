const mongoose = require('mongoose');

const senderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sender name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Sender email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    status: {
        type: String,
        enum: ['verified', 'unverified'],
        default: 'unverified'
    },
    domain: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        default: 'Shared IP'
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    dkimVerified: {
        type: Boolean,
        default: false
    },
    spfVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to extract domain if not present
senderSchema.pre('save', function (next) {
    if (this.email && !this.domain) {
        this.domain = this.email.split('@')[1];
    }
    next();
});

module.exports = mongoose.model('Sender', senderSchema);
