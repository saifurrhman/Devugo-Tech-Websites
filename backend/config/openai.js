const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = {
  client: openai,
  
  // Model configurations
  models: {
    gpt4: 'gpt-4-turbo-preview',
    gpt35: 'gpt-3.5-turbo',
    embedding: 'text-embedding-ada-002'
  },
  
  // Default parameters
  defaultParams: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  },
  
  // Email generation settings
  emailGeneration: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.8,
    max_tokens: 1500,
    systemPrompt: `You are an expert email copywriter. Generate personalized, professional emails that are:
- Engaging and conversational
- Personalized based on recipient information
- Clear and concise
- Action-oriented with strong CTAs
- Professional yet friendly tone`
  },
  
  // Reply analysis settings
  replyAnalysis: {
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    max_tokens: 500
  }
};