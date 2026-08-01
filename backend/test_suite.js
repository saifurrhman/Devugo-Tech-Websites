const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let token = '';

async function runTests() {
  console.log('--- STARTING DEVUGO CRM END-TO-END TESTS ---\n');
  
  // 0. Setup & Auth
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'superadmin' }) || await User.findOne();
    if (!admin) throw new Error('No user found to authenticate');
    
    token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'devugo_secret_key_2024',
      { expiresIn: '1h' }
    );
    console.log(`[AUTH] Successfully authenticated as ${admin.email}`);
  } catch (e) {
    console.error('[AUTH ERROR]', e.message);
    process.exit(1);
  }

  const reqConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 1.1 SMTP Sender Verification
  console.log('\n--- 1.1 SMTP Sender Verification ---');
  try {
    // We will test with a deliberately invalid password first
    const resFail = await axios.post(`${BASE_URL}/settings/senders/verify`, {
      type: 'smtp',
      smtpHost: 'smtp.ethereal.email',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: 'test@ethereal.email',
      smtpPass: 'wrongpassword',
      emailAddress: 'test@ethereal.email',
      displayName: 'Test User'
    }, reqConfig).catch(e => e.response);
    
    console.log(`[TEST 1.1a - Invalid Credentials] Status: ${resFail.status}, Data:`, resFail.data);
  } catch (e) {
    console.error('Error in 1.1:', e.message);
  }

  // 1.2 Actual Email Send
  console.log('\n--- 1.2 Actual Email Send ---');
  try {
    const resSend = await axios.post(`${BASE_URL}/inbox/send`, {
      to: 'test_recipient@ethereal.email',
      subject: 'Test Campaign',
      content: 'Hello World'
    }, reqConfig).catch(e => e.response);
    
    console.log(`[TEST 1.2] Status: ${resSend.status}, Data:`, resSend.data);
  } catch (e) {
    console.error('Error in 1.2:', e.message);
  }

  // 2.1 AI Configuration API Key
  console.log('\n--- 2.1 AI API Key Validation ---');
  try {
    const resAi = await axios.post(`${BASE_URL}/settings/ai`, {
      agents: [],
      system: { apiKey: 'invalid_key_123', provider: 'openai', model: 'gpt-4' },
      chatbot: { enabled: true, apiKey: 'invalid_key', provider: 'gemini' }
    }, reqConfig).catch(e => e.response);
    
    console.log(`[TEST 2.1] Status: ${resAi.status}, Data:`, resAi.data);
  } catch (e) {
    console.error('Error in 2.1:', e.message);
  }

  // 3.1 API Key Generation
  console.log('\n--- 3.1 & 3.2 API Access Key Generation & Usage ---');
  let generatedKey = null;
  try {
    const resKey = await axios.post(`${BASE_URL}/apikeys`, {
      name: 'Test Integration Key ' + Date.now(),
      permissions: ['read', 'write']
    }, reqConfig).catch(e => e.response);
    
    console.log(`[TEST 3.1] Generation Status: ${resKey.status}, Data:`, resKey.data);
    generatedKey = resKey.data?.data?.key;
    
    if (generatedKey) {
      // Test 3.2: Use the key
      const resApi = await axios.post(`${BASE_URL}/contacts`, {
        firstName: 'API',
        lastName: 'Lead',
        email: `api_${Date.now()}@test.com`
      }, { headers: { Authorization: `Bearer ${generatedKey}` } }).catch(e => e.response);
      console.log(`[TEST 3.2] Usage Status: ${resApi.status}, Data:`, resApi.data);
    }
  } catch (e) {
    console.error('Error in 3:', e.message);
  }

  // 4.1 Lead Generation
  console.log('\n--- 4.1 Find New Leads ---');
  try {
    const resSearch = await axios.post(`${BASE_URL}/contact/search`, {
      industry: 'Restaurants',
      location: 'Dubai',
      sources: ['google_maps'],
      max_results: 5
    }, reqConfig).catch(e => e.response);
    
    console.log(`[TEST 4.1] Webhook Trigger Status: ${resSearch.status}, Data:`, resSearch.data);
  } catch (e) {
    console.error('Error in 4.1:', e.message);
  }

  console.log('\n--- TESTS COMPLETED ---');
  mongoose.disconnect();
}

runTests();
