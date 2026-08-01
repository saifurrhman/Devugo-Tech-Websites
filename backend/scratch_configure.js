const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

async function configureCRM() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Setting = require('./models/Setting');
  const ApiKey = require('./models/ApiKey');
  
  // Step 4: Generate CRM API Key
  const existingKey = await ApiKey.findOne({ name: 'n8n Webhook Access' });
  let generatedKey = '';
  if (!existingKey) {
    generatedKey = 'sk_' + crypto.randomBytes(24).toString('hex');
    await ApiKey.create({
      name: 'n8n Webhook Access',
      key: generatedKey,
      scopes: ['contacts:write', 'contacts:read']
    });
    console.log('CRM_API_KEY_GENERATED=' + generatedKey);
  } else {
    console.log('CRM_API_KEY_GENERATED=' + existingKey.key);
    console.log('CRM API Key already exists. Skipping Step 4.');
  }

  // Step 5: Add n8n Agent for Lead Qualification
  let aiSetting = await Setting.findOne({ key: 'ai' });
  if (aiSetting) {
    const agents = aiSetting.value.agents || [];
    const hasLeadAgent = agents.some(a => a.scope === 'leads');
    if (!hasLeadAgent) {
      agents.push({
        id: Date.now(),
        name: 'Lead Hunter & Qualifier',
        platform: 'n8n',
        webhook: '',
        apiKey: '',
        scope: 'leads'
      });
      aiSetting.value.agents = agents;
      await Setting.updateOne({ key: 'ai' }, { $set: { 'value.agents': agents } });
      console.log('Lead Qualification Agent added successfully.');
    } else {
      console.log('Lead Qualification Agent already exists. Skipping Step 5.');
    }
  }

  mongoose.disconnect();
}
configureCRM().catch(console.error);
