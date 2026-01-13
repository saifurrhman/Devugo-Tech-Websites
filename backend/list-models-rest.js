require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function listModelsRest() {
    const apiKey = process.env.CHATBOT_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const models = response.data.models;
        if (models) {
            const names = models.map(m => m.name.replace('models/', '')).join('\n');
            fs.writeFileSync('models.txt', names);
            console.log('Written to models.txt');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModelsRest();
