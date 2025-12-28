const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

// List Keys
exports.listKeys = async (req, res) => {
    try {
        const keys = await ApiKey.find({ isActive: true }).select('-key').sort('-createdAt');
        res.json({ success: true, keys });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Generate Key
exports.generateKey = async (req, res) => {
    try {
        const { name, scopes } = req.body;

        if (!name) return res.status(400).json({ success: false, error: 'Key name is required' });

        // Generate secure key
        const key = 'sk_' + crypto.randomBytes(24).toString('hex');

        const newKey = await ApiKey.create({
            name,
            key, // Store plain for now (in prod, store hash and show once)
            scopes: scopes || ['metrics:write']
        });

        // Return key ONLY ONCE
        res.status(201).json({
            success: true,
            apiKey: newKey,
            secret: key // The client needs this one time
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Revoke Key
exports.revokeKey = async (req, res) => {
    try {
        await ApiKey.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Key revoked' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
