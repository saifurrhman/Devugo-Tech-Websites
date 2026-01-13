require('dotenv').config();
const aiService = require('./services/aiService');
const PROMPTS = require('./config/aiPrompts');

async function testAI() {
    console.log('--- STARTING AI DEBUG TEST ---');
    try {
        const result = await aiService.generateContent(
            PROMPTS.PUBLIC_CHAT || "You are a helpful assistant.",
            { question: "Hello test" },
            'chat'
        );
        console.log('--- RESULT ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('--- ERROR ---', error);
    }
}

testAI();
