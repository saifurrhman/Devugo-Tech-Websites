const mongoose = require('mongoose');
require('dotenv').config();

async function checkCRMState() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- DB CONNECTED ---');

    // 1) EMAIL SERVICE
    const Settings = require('./models/Settings');
    const settings = await Settings.findOne() || {};
    console.log('\n--- 1) EMAIL SERVICE TAB ---');
    console.log('SMTP Configured:', settings && settings.smtpHost ? 'Yes' : 'No');
    if (settings.smtpHost) {
      console.log('Host/Provider:', settings.smtpHost);
      console.log('From Email:', settings.smtpFromEmail);
    }

    // 2) AI CONFIGURATION
    const aiConfig = settings;
    console.log('\n--- 2) AI CONFIGURATION TAB ---');
    console.log('System AI Key Exists:', aiConfig.geminiApiKey ? 'Yes' : 'No');
    console.log('System AI Key Preview:', aiConfig.geminiApiKey ? aiConfig.geminiApiKey.substring(0, 10) + '...' : 'N/A');
    console.log('Primary Model:', aiConfig.model || 'Not set');
    
    console.log('Chatbot API Key Exists:', aiConfig.chatbotApiKey ? 'Yes' : 'No');
    console.log('Chatbot API Key Preview:', aiConfig.chatbotApiKey ? aiConfig.chatbotApiKey.substring(0, 10) + '...' : 'N/A');
    
    console.log('External AI Agents:', aiConfig.agents ? aiConfig.agents.length : 0);
    if (aiConfig.agents && aiConfig.agents.length > 0) {
      aiConfig.agents.forEach(agent => {
        console.log(` - Agent: ${agent.name} (Tool: ${agent.tool}, Webhook: ${agent.webhook})`);
      });
    }

    // 3) CONNECTED APPS
    console.log('\n--- 3) CONNECTED APPS TAB ---');
    console.log('Zoom Connected:', aiConfig.zoomConnected ? 'Yes' : 'No');
    console.log('Google Connected:', aiConfig.googleConnected ? 'Yes' : 'No');
    console.log('Calendly Connected:', aiConfig.calendlyConnected ? 'Yes' : 'No');

    // 4) API ACCESS
    const ApiKey = require('./models/ApiKey');
    const apiKeys = await ApiKey.find() || [];
    console.log('\n--- 4) API ACCESS TAB ---');
    console.log('Total API Keys:', apiKeys.length);
    apiKeys.forEach(k => {
      console.log(` - Key Name: ${k.name}, Created: ${k.createdAt}`);
    });

    // 5) SENDERS & DOMAINS
    const Sender = require('./models/Sender');
    const senders = await Sender.find() || [];
    const Domain = require('./models/Domain');
    const domains = await Domain.find() || [];
    
    console.log('\n--- 5) SENDERS & DOMAINS ---');
    console.log('Total Senders:', senders.length);
    senders.forEach(s => {
      console.log(` - Sender: ${s.emailAddress} (Type: ${s.type}, Verified: ${s.isVerified})`);
    });
    
    console.log('Total Domains:', domains.length);
    domains.forEach(d => {
      console.log(` - Domain: ${d.name} (Verified: ${d.isVerified})`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

checkCRMState();
