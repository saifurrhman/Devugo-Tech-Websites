const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const logger = require('../utils/logger');
const PROMPTS = require('../config/aiPrompts');
const Setting = require('../models/Setting');

class AIService {
  constructor() {
    // Initial cleanup of constructor
  }

  async getApiKey(scope) {
    // 1. Specific Chatbot Key from Env (Highest Priority for Chat)
    if (scope === 'chat' && process.env.CHATBOT_API_KEY) {
      return process.env.CHATBOT_API_KEY;
    }

    try {
      const setting = await Setting.findOne({ key: 'ai' });

      // 2. Chatbot Key from DB (Second Priority)
      if (scope === 'chat' && setting && setting.value && setting.value.chatbotApiKey) {
        return setting.value.chatbotApiKey;
      }

      if (setting && setting.value && setting.value.geminiApiKey) {
        return setting.value.geminiApiKey;
      }
    } catch (error) {
      logger.error('Failed to fetch AI settings:', error);
    }

    // Fallback to env var if not set in DB
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

    return null;
  }

  async getActionAgent(scope) {
    try {
      const setting = await Setting.findOne({ key: 'ai' });
      if (!setting || !setting.value || !Array.isArray(setting.value.agents)) return null;

      // 1. Try exact scope match
      let agent = setting.value.agents.find(a => a.scope === scope);
      // 2. Try 'all'/fallback if no specific agent
      if (!agent) agent = setting.value.agents.find(a => a.scope === 'all');

      return agent;
    } catch (e) {
      logger.error('Error finding agent:', e);
      return null;
    }
  }

  async callExternalAgent(agent, systemPrompt, userVariables) {
    try {
      logger.info(`Invoking External Agent [${agent.name}] for ${agent.scope || 'general'}`);
      const payload = {
        prompt: systemPrompt,
        variables: userVariables,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(agent.webhook, payload, {
        headers: { 'Content-Type': 'application/json', ...(agent.apiKey ? { 'Authorization': `Bearer ${agent.apiKey}` } : {}) },
        timeout: 30000
      });

      return response.data;
    } catch (e) {
      logger.error(`External Agent [${agent.name}] failed:`, e.message);
      return null;
    }
  }

  // Auto-detect which Gemini model works with this API key
  async getWorkingModel(genAI) {
    // Try newest models first, then fallbacks
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-001',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro-latest',
    ];
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Quick test call
        await model.generateContent('hi');
        logger.info(`✅ Working Gemini model found: ${modelName}`);
        return model;
      } catch (err) {
        if (err.message.includes('403') || err.message.includes('suspended') || err.message.includes('SUSPENDED')) {
          logger.error(`❌ API Key suspended/blocked. Cannot use Gemini.`);
          return null; // Key is bad, stop trying
        }
        // 404 = model not available for this key, try next
        logger.warn(`Model ${modelName} not available, trying next...`);
      }
    }
    return null; // No working model found
  }

  async generateContent(systemPrompt, userVariables, scope = 'general') {
    try {
      console.log(`🔍 generateContent called. Scope: ${scope}`);
      // 1. Check for External Agent
      const agent = await this.getActionAgent(scope);
      if (agent) {
        const agentResult = await this.callExternalAgent(agent, systemPrompt, userVariables);
        if (agentResult) return agentResult;
      }

      const apiKey = await this.getApiKey(scope);

      if (!apiKey) {
        logger.warn('Gemini API Key missing.');
        return {
          reply: "AI is not configured. Please add a Gemini API Key in Admin → Integrations → AI Configuration.",
          isMock: true
        };
      }

      this.genAI = new GoogleGenerativeAI(apiKey);

      // Auto-detect working model instead of hardcoding
      const workingModel = await this.getWorkingModel(this.genAI);

      if (!workingModel) {
        return {
          reply: "The configured API Key is not working (suspended or invalid). Please update it in Admin → Integrations → AI Configuration.",
          isMock: true
        };
      }

      this.model = workingModel;

      // Replace placeholders in the system prompt with user variables
      let finalPrompt = systemPrompt;
      for (const [key, value] of Object.entries(userVariables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalPrompt = finalPrompt.replace(regex, value);
      }

      // Combine Master Prompt with Specific Prompt
      const fullInstruction = `${PROMPTS.MASTER_SYSTEM_PROMPT}\n\n${finalPrompt}`;

      // Retry Logic for Rate Limits (429)
      let result;
      let retries = 3;
      while (retries > 0) {
        try {
          result = await this.model.generateContent(fullInstruction);
          break; // Success, exit loop
        } catch (err) {
          if (err.message.includes('429') && retries > 1) {
            console.warn(`⚠️ AI Rate Limit (429). Retrying in 4s... (${retries - 1} left)`);
            await new Promise(r => setTimeout(r, 4000));
            retries--;
          } else {
            throw err;
          }
        }
      }
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        return JSON.parse(text);
      } catch (e) {
        logger.error('Failed to parse Gemini response as JSON', e);
        throw new Error('AI response format error: ' + text);
      }

    } catch (error) {
      logger.error('AI Service Error:', error.message);
      return {
        reply: `Sorry, I encountered an error. Please contact us at support@devugotechsolution.store`,
        isMock: true
      };
    }
  }

  // 1. Campaign Creation
  async generateCampaign({ goal, audience, tone, service }) {
    return this.generateContent(PROMPTS.CAMPAIGN_CREATION, { goal, audience, tone, service }, 'campaigns');
  }

  // 2. Follow-up Email
  async generateFollowUp({ topic, days, relationship }) {
    return this.generateContent(PROMPTS.FOLLOW_UP, { topic, days, relationship }, 'campaigns');
  }

  // 3. Inbox Reply Assist
  async generateReply({ incoming_message, stage, service }) {
    return this.generateContent(PROMPTS.INBOX_REPLY, { incoming_message, stage, service }, 'replies');
  }

  // 4. Lead Welcome Email
  async generateWelcome({ name, company, service }) {
    return this.generateContent(PROMPTS.LEAD_WELCOME, { name, company, service }, 'campaigns');
  }

  // 5. Sales Qualification
  async classifyLead({ incoming_message }) {
    return this.generateContent(PROMPTS.SALES_QUALIFICATION, { incoming_message }, 'leads');
  }

  // 6. Sender Context
  async rewriteSender({ sender, email_content }) {
    return this.generateContent(PROMPTS.SENDER_CONTEXT, { sender, email_content });
  }

  // 7. Auto Follow-up Sequence
  async generateSequence({ goal, audience }) {
    return this.generateContent(PROMPTS.AUTO_FOLLOWUP_SEQUENCE, { goal, audience });
  }

  // 8. Blog Post Generation
  async generateBlog({ topic, keywords, tone }) {
    return this.generateContent(PROMPTS.BLOG_POST, { topic, keywords, tone }, 'blog');
  }

  // Legacy method support (mapped to Campaign)
  async generateEmailContent({ type, goal, tone, language, prompt }) {
    // Default to campaign creation for legacy calls
    return this.generateCampaign({
      goal: goal,
      audience: 'Target Audience',
      tone: tone,
      service: `Email Type: ${type}. ${prompt || ''}`
    });
  }

  getMockResponse(goal, tone) {
    console.log(`⚠️ getMockResponse called. Goal: ${goal}`);
    return {
      subject: `[Mock] Action for ${goal}`,
      body: `<p>This is a mock response because AI is unavailable. Goal: ${goal}, Tone: ${tone}</p>`,
      isMock: true
    };
  }
}

module.exports = new AIService();