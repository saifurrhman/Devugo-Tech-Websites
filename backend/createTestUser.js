require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    await User.deleteOne({ email: 'admin@devugo.tech' });
    console.log('🗑️  Deleted old test user (if exists)');
    
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@devugo.tech',
      passwordHash: passwordHash,
      role: 'admin',
      phone: '+92-300-1234567',
      avatar: ''
    });
    
    console.log('\n✅ Test user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@devugo.tech');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:     admin');
    console.log('🆔 ID:       ' + user._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating test user:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createTestUser();