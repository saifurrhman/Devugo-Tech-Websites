const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Organization Details
    organizationName: { type: String, default: 'Devugo Tech' },
    organizationEmail: String,

    // LOGO & BRANDING
    logoUrl: String,
    primaryColor: { type: String, default: '#0f172a' },

    // INTEGRATION CREDENTIALS (Encrypted/Protected in real app, plain for now per request)
    zoom: {
        clientId: String,
        clientSecret: String,
        redirectUri: String
    },
    google: {
        clientId: String,
        clientSecret: String,
        redirectUri: String
    },
    calendly: {
        personalToken: String
    }

}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
