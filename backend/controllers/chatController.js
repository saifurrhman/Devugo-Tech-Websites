const aiService = require('../services/aiService');
const PROMPTS = require('../config/aiPrompts');

exports.handleChatMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        console.log('💬 Chat Request:', message);

        // Use AIService to generate response consistent with other features
        // We use 'general' scope or a specific 'chat' scope if we want to config it later in DB
        const result = await aiService.generateContent(PROMPTS.PUBLIC_CHAT, { question: message }, 'chat');

        // Check if aiService returned a mock response or actual result
        const replyText = result.reply || result.body || "I'm having trouble connecting right now. Please try again later.";

        return res.json({
            success: true,
            reply: replyText
        });

    } catch (error) {
        console.error('❌ Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            reply: "I apologize, but I encountered an error. Please contact us directly at support@devugotechsolution.store."
        });
    }
};
