const SearchRequest = require('../models/SearchRequest');
const Setting = require('../models/Setting');
const axios = require('axios'); // Ensure axios is required if we are using it, or we can use global fetch. We will use global fetch to avoid missing dependencies.

exports.createSearch = async (req, res) => {
    try {
        const { industry, location, sources, max_results } = req.body;
        
        // 1. Save to DB
        const searchRequest = new SearchRequest({
            industry,
            location,
            sources: Array.isArray(sources) ? sources : [sources],
            max_results: max_results || 20,
            status: 'Running',
            requested_by: req.user ? req.user.id : null
        });
        await searchRequest.save();

        // 2. Fetch webhook URL from settings
        let aiSetting = await Setting.findOne({ key: 'ai' });
        let webhookUrl = null;
        if (aiSetting && aiSetting.value && aiSetting.value.agents) {
            // Find the first agent that has the correct scope/name AND has a non-empty webhook
            const agent = aiSetting.value.agents.find(a => 
                (a.scope === 'leads' || a.name.includes('Lead Hunter') || a.name.includes('Leads')) && 
                a.webhook && a.webhook.trim() !== ''
            );
            if (agent) {
                webhookUrl = agent.webhook;
            }
        }

        if (!webhookUrl) {
            // Fallback for demo or if not configured properly
            webhookUrl = process.env.N8N_WEBHOOK_URL;
        }

        if (webhookUrl) {
            // 3. Trigger webhook
            try {
                const resp = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        search_id: searchRequest._id,
                        industry,
                        location,
                        sources,
                        max_results
                    })
                });
                
                if (!resp.ok) {
                    console.error('Webhook returned error status:', resp.status);
                    searchRequest.status = 'Failed';
                    searchRequest.error_message = 'Webhook error: ' + resp.status;
                    await searchRequest.save();
                }
            } catch (err) {
                console.error('Failed to trigger n8n webhook:', err);
                searchRequest.status = 'Failed';
                searchRequest.error_message = err.message;
                await searchRequest.save();
            }
        } else {
            console.warn('No webhook URL found for Lead Hunter agent.');
            // We might still keep it as 'Running' or mark as Failed.
            searchRequest.status = 'Failed';
            searchRequest.error_message = 'No webhook URL configured for Agent 1';
            await searchRequest.save();
        }

        res.status(201).json(searchRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSearchLogs = async (req, res) => {
    try {
        const logs = await SearchRequest.find()
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
