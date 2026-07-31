/**
 * ✅ ADMIN SETUP SCRIPT
 * Run: node create-admin.js
 * 
 * Yeh script devugo.tech@gmail.com ke liye admin account
 * create ya update karti hai with the password you set below.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// ============================================
// 👇 YAHAN APNA PASSWORD CHANGE KARO
const ADMIN_EMAIL    = 'devugo.tech@gmail.com';
const ADMIN_NAME     = 'Devugo Admin';
const ADMIN_PASSWORD = 'DevugoAdmin@2024'; // ← apna password yahan set karo
// ============================================

async function setupAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check karo ke user exists hai ya nahi
    let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (user) {
      console.log(`📋 User already exists: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Active: ${user.isActive}`);
      console.log('\n🔄 Updating password and ensuring admin access...');

      // Password update karo
      user.password = ADMIN_PASSWORD;
      user.isActive = true;
      user.role = 'admin';
      user.name = ADMIN_NAME;
      await user.save();

      console.log('\n✅ Admin account updated successfully!');
    } else {
      console.log(`📋 User not found. Creating new admin account...`);

      // Naya admin create karo
      user = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
      });
      await user.save();

      console.log('\n✅ Admin account created successfully!');
    }

    // Verify kar lo ke sab theek hai
    const savedUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select('+passwordHash');
    console.log('\n📊 Final Verification:');
    console.log(`   Email:     ${savedUser.email}`);
    console.log(`   Name:      ${savedUser.name}`);
    console.log(`   Role:      ${savedUser.role}`);
    console.log(`   Active:    ${savedUser.isActive}`);
    console.log(`   Has Hash:  ${!!savedUser.passwordHash}`);
    console.log(`\n🎉 LOGIN CREDENTIALS:`);
    console.log(`   📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`   🌐 URL:      http://localhost:3000/admin/login`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupAdmin();
