require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.env.CHATBOT_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No API Key found in env');
        return;
    }
    console.log('Using API Key:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Note: accessing the internal model listing if available or just trying a standard one
        // The SDK wrapping makes listing a bit implicit, usually done via the model manager if exposed.
        // However, Node SDK setup doesn't always expose listModels directly on the main class in older versions, 
        // but 0.24.x might. 
        // Actually, checking standard usage, likely need to use fetching via REST or check docs.
        // Let's try to just use the one that usually works: gemini-1.5-flash

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('Attempting generation with gemini-1.5-flash...');
        const result = await model.generateContent("Test");
        console.log('Success with gemini-1.5-flash!');
        console.log(result.response.text());
    } catch (error) {
        console.error('Error with gemini-1.5-flash:', error.message);
    }

    try {
        console.log('Attempting generation with gemini-pro...');
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Test");
        console.log('Success with gemini-pro!');
        console.log(result2.response.text());
    } catch (error) {
        console.error('Error with gemini-pro:', error.message);
    }

}

listModels();
