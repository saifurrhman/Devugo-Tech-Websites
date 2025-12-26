const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const PROMPTS = require('../config/aiPrompts');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY is missing. AI features will use mock data.');
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }
  }

  async generateContent(systemPrompt, userVariables) {
    try {
      if (!this.apiKey || !this.model) {
        throw new Error('AI Service not configured');
      }

      // Replace placeholders in the system prompt with user variables
      let finalPrompt = systemPrompt;
      for (const [key, value] of Object.entries(userVariables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalPrompt = finalPrompt.replace(regex, value);
      }

      // Combine Master Prompt with Specific Prompt
      const fullInstruction = `${PROMPTS.MASTER_SYSTEM_PROMPT}\n\n${finalPrompt}`;

      const result = await this.model.generateContent(fullInstruction);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        return JSON.parse(text);
      } catch (e) {
        logger.error('Failed to parse Gemini response as JSON', e);
        throw new Error('AI response format error');
      }

    } catch (error) {
      logger.error('AI Service Error:', error.message);
      // Provide basic mock fallbacks if AI fails or is missing, relying on the 'goal' or 'type' if present in variables
      return this.getMockResponse(userVariables.goal || 'General', userVariables.tone || 'Professional');
    }
  }

  // 1. Campaign Creation
  async generateCampaign({ goal, audience, tone, service }) {
    return this.generateContent(PROMPTS.CAMPAIGN_CREATION, { goal, audience, tone, service });
  }

  // 2. Follow-up Email
  async generateFollowUp({ topic, days, relationship }) {
    return this.generateContent(PROMPTS.FOLLOW_UP, { topic, days, relationship });
  }

  // 3. Inbox Reply Assist
  async generateReply({ incoming_message, stage, service }) {
    return this.generateContent(PROMPTS.INBOX_REPLY, { incoming_message, stage, service });
  }

  // 4. Lead Welcome Email
  async generateWelcome({ name, company, service }) {
    return this.generateContent(PROMPTS.LEAD_WELCOME, { name, company, service });
  }

  // 5. Sales Qualification
  async classifyLead({ incoming_message }) {
    return this.generateContent(PROMPTS.SALES_QUALIFICATION, { incoming_message });
  }

  // 6. Sender Context
  async rewriteSender({ sender, email_content }) {
    return this.generateContent(PROMPTS.SENDER_CONTEXT, { sender, email_content });
  }

  // 7. Auto Follow-up Sequence
  async generateSequence({ goal, audience }) {
    return this.generateContent(PROMPTS.AUTO_FOLLOWUP_SEQUENCE, { goal, audience });
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
    return {
      subject: `[Mock] Action for ${goal}`,
      body: `<p>This is a mock response because AI is unavailable. Goal: ${goal}, Tone: ${tone}</p>`,
      isMock: true
    };
  }
}

module.exports = new AIService();