const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.client = process.env.ANTHROPIC_API_KEY 
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;
  }

  async generatePersonalizedEmail(recipientData, campaignContext) {
    try {
      if (!this.client) {
        logger.warn('Anthropic API key not configured');
        return null;
      }

      const prompt = `Generate a personalized email for:
Name: ${recipientData.firstName} ${recipientData.lastName}
Company: ${recipientData.company || 'N/A'}
Industry: ${recipientData.industry || 'N/A'}
Campaign: ${campaignContext.name}
Context: ${campaignContext.description}

Write a professional, engaging email that:
1. Addresses their specific needs
2. Is personalized based on their profile
3. Has a clear call-to-action
4. Is concise (max 150 words)

Return only the email body, no subject line.`;

      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return message.content[0].text;
    } catch (error) {
      logger.error('AI personalization error:', error.message);
      return null;
    }
  }

  async scoreLeadQuality(leadData) {
    try {
      if (!this.client) return 50; // Default score

      const prompt = `Score this lead from 0-100 based on quality:
Email: ${leadData.email}
Company: ${leadData.company || 'Unknown'}
Industry: ${leadData.industry || 'Unknown'}
Source: ${leadData.source || 'Unknown'}
Engagement: ${leadData.totalOpens || 0} opens, ${leadData.totalClicks || 0} clicks
Lead Status: ${leadData.leadStatus}

Return only a number between 0-100.`;

      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const score = parseInt(message.content[0].text.trim());
      return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (error) {
      logger.error('Lead scoring error:', error.message);
      return 50;
    }
  }

  async summarizeConversation(messages) {
    try {
      if (!this.client) return null;

      const conversationText = messages.map(m => 
        `${m.from}: ${m.text}`
      ).join('\n');

      const prompt = `Summarize this email conversation in 2-3 sentences:

${conversationText}

Focus on key points and action items.`;

      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return message.content[0].text;
    } catch (error) {
      logger.error('Conversation summary error:', error.message);
      return null;
    }
  }

  isConfigured() {
    return this.client !== null;
  }
}

module.exports = new AIService();