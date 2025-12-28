const Setting = require('../models/Setting');

// Get AI Configuration
exports.getAIConfig = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: 'ai' });
        if (!setting) {
            return res.json({
                model: 'GPT-4 Turbo',
                strictFiltering: true,
                provider: 'Gemini',
                apiKey: '' // Do not send back if sensitive? Usually we send back a masked version or just empty if not set
            });
        }
        // Return config but mask API Key for security if needed, 
        // but for this admin panel user might want to see if it's set.
        // We'll return it as is for now since it's an admin route.
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update AI Configuration
exports.updateAIConfig = async (req, res) => {
    try {
        const config = req.body;

        // Validate if needed

        const setting = await Setting.findOneAndUpdate(
            { key: 'ai' },
            {
                $set: {
                    key: 'ai',
                    value: config,
                    updatedAt: Date.now()
                }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: setting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// SMTP SETTINGS
// ==========================================
exports.getSMTP = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: 'smtp' });
        if (!setting) {
            // Return defaults or environment variables if any
            return res.json({
                host: process.env.SMTP_HOST || '',
                port: process.env.SMTP_PORT || 587,
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || ''
                },
                fromName: process.env.EMAIL_FROM_NAME || '',
                fromEmail: process.env.EMAIL_FROM_ADDRESS || ''
            });
        }
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSMTP = async (req, res) => {
    try {
        const config = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key: 'smtp' },
            { $set: { key: 'smtp', value: config, updatedAt: Date.now() } },
            { upsert: true, new: true }
        );
        res.json({ success: true, data: setting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// INTEGRATIONS (Connected Apps)
// ==========================================
exports.getIntegrations = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: 'integrations' });
        res.json(setting ? setting.value : {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateIntegrations = async (req, res) => {
    try {
        const config = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key: 'integrations' },
            { $set: { key: 'integrations', value: config, updatedAt: Date.now() } },
            { upsert: true, new: true }
        );
        res.json({ success: true, data: setting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
