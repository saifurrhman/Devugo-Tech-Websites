const aiService = require('../services/aiService');

exports.generateEmailTemplate = async (req, res) => {
    try {
        const { action, ...params } = req.body;

        let result;

        switch (action) {
            case 'campaign':
                result = await aiService.generateCampaign(params);
                break;
            case 'follow-up':
                result = await aiService.generateFollowUp(params);
                break;
            case 'reply':
                result = await aiService.generateReply(params);
                break;
            case 'welcome':
                result = await aiService.generateWelcome(params);
                break;
            case 'classify':
                result = await aiService.classifyLead(params);
                break;
            case 'rewrite-sender':
                result = await aiService.rewriteSender(params);
                break;
            case 'sequence':
                result = await aiService.generateSequence(params);
                break;
            default:
                // Fallback to legacy logic if action is missing or generic
                // If the client sends type/goal without action, this handles it.
                if (params.type || params.goal) {
                    result = await aiService.generateEmailContent(params);
                } else {
                    return res.status(400).json({ success: false, message: 'Invalid action or missing parameters' });
                }
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
