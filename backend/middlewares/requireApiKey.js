const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

/**
 * Middleware to protect routes with X-API-KEY header
 * Usage: router.post('/metrics', requireApiKey('metrics:write'), controller.action);
 */
const requireApiKey = (requiredScope) => {
    return async (req, res, next) => {
        try {
            const key = req.header('X-API-KEY');

            if (!key) {
                return res.status(401).json({ success: false, error: 'API Key required' });
            }

            // Find key
            const apiKey = await ApiKey.findOne({ key, isActive: true });

            if (!apiKey) {
                return res.status(401).json({ success: false, error: 'Invalid API Key' });
            }

            // Check Scope (if specified)
            if (requiredScope && !apiKey.scopes.includes(requiredScope) && !apiKey.scopes.includes('admin')) {
                return res.status(403).json({ success: false, error: `Missing scope: ${requiredScope}` });
            }

            // Update last used (async, don't await/block)
            apiKey.lastUsed = Date.now();
            apiKey.save().catch(err => console.error('Error updating API key lastUsed:', err));

            req.apiKey = apiKey; // Make available in controller
            next();

        } catch (err) {
            console.error('API Key Auth Error:', err);
            res.status(500).json({ success: false, error: 'Server error during auth' });
        }
    };
};

module.exports = requireApiKey;
