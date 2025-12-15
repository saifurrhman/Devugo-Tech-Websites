const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY is missing. AI features will use mock data.');
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  /**
   * Generate email content using Google Gemini
   * @param {Object} params
   * @param {string} params.type - email type (newsletter, promo, etc)
   * @param {string} params.goal - goal of email
   * @param {string} params.tone - tone (professional, friendly)
   * @param {string} params.language - language
   * @param {string} [params.prompt] - additional instructions
   */
  async generateEmailContent({ type, goal, tone, language, prompt }) {
    try {
      if (!this.apiKey || !this.model) {
        return this.getMockResponse(type, goal, tone);
      }

      const systemInstruction = `
        You are an expert email marketing copywriter. 
        Generate an email template based on the user's request.
        Return ONLY a JSON object with the following structure:
        {
          "subject": "The email subject line",
          "body": "The HTML content of the email body (use inline CSS)",
          "followUp": {
            "subject": "Follow-up email subject",
            "body": "Follow-up email HTML body"
          }
        }
        The response should be valid JSON and nothing else. No markdown blocks.
      `;

      const userPrompt = `
        Type: ${type}
        Goal: ${goal}
        Tone: ${tone}
        Language: ${language}
        Additional Instructions: ${prompt || 'None'}
      `;

      const result = await this.model.generateContent(systemInstruction + "\n\nUser Request:\n" + userPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        return JSON.parse(text);
      } catch (e) {
        logger.error('Failed to parse Gemini response as JSON', e);
        // Attempt to clean more aggressively or fallback
        throw new Error('AI response format error');
      }

    } catch (error) {
      logger.error('AI Service Error:', error.message);
      return this.getMockResponse(type, goal, tone);
    }
  }

  getMockResponse(type, goal, tone) {
    return {
      subject: `[${type}] Unlock Your Potential with Devugo`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #4f46e5;">Hello there!</h1>
          <p>This is a <strong>${tone}</strong> email generated for the goal: <strong>${goal}</strong>.</p>
          <p>We noticed you are interested in <strong>${type}</strong>. Here is what we can offer...</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <p>This content is a placeholder because the AI service is currently unavailable or misconfigured.</p>
          </div>
          <br>
          <p>Best regards,<br>The Devugo Team</p>
        </div>
      `,
      followUp: {
        subject: `Re: [${type}] Just checking in`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <p>Hi again,</p>
            <p>I just wanted to follow up on my previous email regarding <strong>${type}</strong>.</p>
            <p>Let me know if you have any questions!</p>
          </div>
        `
      },
      isMock: true
    };
  }
}

module.exports = new AIService();