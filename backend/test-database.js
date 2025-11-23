const mongoose = require('mongoose');
const User = require('./models/User');
const EmailRecipient = require('./models/EmailRecipient');
const EmailCampaign = require('./models/EmailCampaign');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('🧪 Testing Database...\n');

    // Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Test Models
    console.log('📊 Database Statistics:');
    
    const userCount = await User.countDocuments();
    console.log(`   Users: ${userCount}`);

    const recipientCount = await EmailRecipient.countDocuments();
    console.log(`   Recipients: ${recipientCount}`);

    const campaignCount = await EmailCampaign.countDocuments();
    console.log(`   Campaigns: ${campaignCount}`);

    // Test Model Operations
    console.log('\n🔧 Testing Model Operations:');
    
    // Find one user
    const oneUser = await User.findOne();
    if (oneUser) {
      console.log(`   ✅ Found user: ${oneUser.email}`);
    } else {
      console.log(`   ℹ️  No users in database`);
    }

    console.log('\n✅ Database test complete!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();