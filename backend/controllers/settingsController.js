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
