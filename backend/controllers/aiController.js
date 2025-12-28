const aiService = require('../services/aiService');

exports.generateEmailTemplate = async (req, res) => {
    try {
        console.log('🤖 AI Request Received:', JSON.stringify(req.body, null, 2));
        const { action, ...params } = req.body;

        let result;

        switch (action) {
            case 'campaign':
                console.log('👉 Action: Campaign');
                result = await aiService.generateCampaign(params);
                break;
            case 'follow-up':
                console.log('👉 Action: Follow-up');
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
            case 'blog':
                result = await aiService.generateBlog(params);
                break;
            default:
                // Fallback to legacy logic if action is missing or generic
                // If the client sends type/goal without action, this handles it.
                if (params.type || params.goal) {
                    console.log('👉 Action: Legacy/Default');
                    result = await aiService.generateEmailContent(params);
                } else {
                    return res.status(400).json({ success: false, message: 'Invalid action or missing parameters' });
                }
        }

        console.log('✅ AI Generation Success');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ AI Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
