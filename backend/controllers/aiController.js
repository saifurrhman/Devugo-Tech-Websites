const aiService = require('../services/aiService');

exports.generateEmailTemplate = async (req, res) => {
    try {
        const { type, goal, tone, language, prompt } = req.body;

        // Basic validation
        if (!type || !goal) {
            return res.status(400).json({ success: false, message: 'Type and Goal are required' });
        }

        const result = await aiService.generateEmailContent({ type, goal, tone, language, prompt });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
