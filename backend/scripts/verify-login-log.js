const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';
const MONGO_URI = process.env.MONGO_URI;

async function verifyLoginLog() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const User = require('../models/User');
        const ActivityLog = require('../models/ActivityLog');

        const TEST_EMAIL = 'verify_log@example.com';
        const TEST_PASS = 'password123';

        // 1. Cleanup previous test user if exists
        const oldUser = await User.findOne({ email: TEST_EMAIL });
        if (oldUser) {
            await User.deleteOne({ _id: oldUser._id });
            await ActivityLog.deleteMany({ user: oldUser._id });
            console.log('🧹 Cleaned up old test user');
        }

        // 2. Create User via Request (to test Signup logging too)
        console.log('🚀 Attempting Signup...');
        // We use axios to hit the running server so it triggers the actual controller logic
        let signupRes;
        try {
            signupRes = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Log Tester',
                email: TEST_EMAIL,
                password: TEST_PASS
            });
            console.log('✅ Signup Successful');
        } catch (e) {
            console.error('❌ Signup Failed:', e.response?.data || e.message);
            process.exit(1);
        }

        const userId = signupRes.data.user._id;

        // 3. Check for Signup Log
        console.log('🔍 Checking for Signup Log...');
        // Wait a sec for async logging
        await new Promise(r => setTimeout(r, 2000));
        const signupLog = await ActivityLog.findOne({ user: userId, action: { $regex: 'signup', $options: 'i' } });

        if (signupLog) {
            console.log('✅ Signup Log FOUND:', signupLog.action);
        } else {
            console.error('❌ Signup Log MISSING');
        }

        // 4. Logout
        console.log('🚀 Attempting Login...');
        let loginRes;
        try {
            loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: TEST_EMAIL,
                password: TEST_PASS
            });
            console.log('✅ Login Successful');

            const debugVersion = loginRes.headers['x-debug-version'];
            if (debugVersion === 'v2-logging-fix') {
                console.log('✅ SERVER STATUS: Updated (v2-logging-fix detected)');
            } else {
                console.error('❌ SERVER STATUS: OLD (Debug header missing)');
                console.error('   User needs to restart the server.');
            }

        } catch (e) {
            console.error('❌ Login Failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 5. Check for Login Log
        console.log('🔍 Checking for Login Log...');
        await new Promise(r => setTimeout(r, 2000));
        const loginLog = await ActivityLog.findOne({ user: userId, action: { $regex: 'login', $options: 'i' } });

        if (loginLog) {
            console.log('✅ Login Log FOUND:', loginLog.action);
        } else {
            console.error('❌ Login Log MISSING - Controller fix is NOT working or Server NOT restarted');
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Script Error:', error);
        await mongoose.disconnect();
    }
}

verifyLoginLog();
