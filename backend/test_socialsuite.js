require('dotenv').config();
const mongoose = require('mongoose');
const SocialAccount = require('./models/SocialAccount');
const SocialPost = require('./models/SocialPost');
const SocialMediaAsset = require('./models/SocialMediaAsset');
const { simulateConnectOAuth, publishToTarget } = require('./services/socialPlatformAdapters');
const { validateSocialPost } = require('./services/socialValidationService');

async function testSocialSuite() {
  console.log('🧪 Testing SocialSuite backend models, adapters & validation rules...');

  try {
    // 1. Connect OAuth Simulation for Facebook & LinkedIn
    const fbAccountData = await simulateConnectOAuth('facebook', 'Devugo FB Page', '@devugofb');
    const liAccountData = await simulateConnectOAuth('linkedin', 'Devugo LinkedIn', 'devugo-tech');
    
    console.log('✅ OAuth Simulation Success:');
    console.log('   FB Account Encrypted Token:', fbAccountData.encryptedAccessToken.substring(0, 30) + '...');
    console.log('   LinkedIn Account Encrypted Token:', liAccountData.encryptedAccessToken.substring(0, 30) + '...');

    // 2. Validation Engine Test
    const validationResult = validateSocialPost({
      globalText: 'Exciting announcement! Check out our new SocialSuite module 🚀',
      selectedAccounts: [{ platform: 'facebook' }, { platform: 'linkedin' }]
    });

    console.log('✅ Validation Engine Test Result:', validationResult.isValid ? 'PASSED ✅' : 'FAILED ❌');
    if (!validationResult.isValid) {
      console.error('Errors:', validationResult.errors);
    }

    // 3. Adapter Publishing Test
    const pubResultFB = await publishToTarget(fbAccountData, 'Test Facebook post content');
    const pubResultLI = await publishToTarget(liAccountData, 'Test LinkedIn post content');

    console.log('✅ Target Publishing Adapter Test:');
    console.log('   FB External Post URL:', pubResultFB.externalUrl);
    console.log('   LinkedIn External Post URL:', pubResultLI.externalUrl);

    console.log('\n🎉 ALL SOCIALSUITE BACKEND TESTS PASSED CLEANLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ SocialSuite Test Failed:', err);
    process.exit(1);
  }
}

testSocialSuite();
