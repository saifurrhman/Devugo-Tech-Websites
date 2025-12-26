require('dotenv').config({ path: './backend/.env' });
const aiService = require('./services/aiService');

async function testAI() {
    console.log('🧪 Testing Enterprise AI CRM Features...\n');

    try {
        console.log('1. Testing Campaign Creation...');
        const campaign = await aiService.generateCampaign({
            goal: 'Winter Sale',
            audience: 'Existing Customers',
            tone: 'Exciting',
            service: 'Premium CRM'
        });
        console.log('✅ Campaign Result:', JSON.stringify(campaign, null, 2));

        console.log('\n2. Testing Follow-up...');
        const followUp = await aiService.generateFollowUp({
            topic: 'Winter Sale',
            days: '3',
            relationship: 'warm'
        });
        console.log('✅ Follow-up Result:', JSON.stringify(followUp, null, 2));

        console.log('\n3. Testing Lead Welcome...');
        const welcome = await aiService.generateWelcome({
            name: 'John Doe',
            company: 'Acme Corp',
            service: 'Enterprise Plan'
        });
        console.log('✅ Welcome Result:', JSON.stringify(welcome, null, 2));

        console.log('\n4. Testing Sales Qualification...');
        const qualification = await aiService.classifyLead({
            incoming_message: 'Hi, I am interested in your enterprise plan. What is the pricing?'
        });
        console.log('✅ Qualification Result:', JSON.stringify(qualification, null, 2));

        console.log('\n5. Testing Legacy Method...');
        const legacy = await aiService.generateEmailContent({
            type: 'newsletter',
            goal: 'Monthly Update',
            tone: 'Professional',
            language: 'English'
        });
        console.log('✅ Legacy Result:', JSON.stringify(legacy, null, 2));

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testAI();
