const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const adminController = require('../controllers/adminController');

async function testActivity() {
    console.log('🕵️ Testing Activity Logging...');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // 1. Find a test user
        const user = await User.findOne({ email: { $regex: 'gmail.com', $options: 'i' } });
        if (!user) {
            console.log('❌ No test user found');
            return;
        }
        console.log('👤 Test User:', user.email);

        // 2. Simulate Logs
        console.log('📝 Creating logs...');
        const baseTime = Date.now();

        await ActivityLog.deleteMany({ user: user._id }); // Clear old logs for clean test (optional, but good for stats verification)

        const logs = [
            { user: user._id, action: 'GET /api/test', method: 'GET', path: '/api/test', ip: '127.0.0.1', userAgent: 'TestScript', timestamp: baseTime - 3600000 }, // 1 hour ago
            { user: user._id, action: 'POST /api/test', method: 'POST', path: '/api/test', ip: '127.0.0.1', userAgent: 'TestScript', timestamp: baseTime - 3500000 }, // 58 mins ago (2 mins gap)
            { user: user._id, action: 'GET /api/test', method: 'GET', path: '/api/test', ip: '192.168.1.1', userAgent: 'Chrome', timestamp: baseTime - 100000 }  // 1 min ago (New session due to >30min gap)
        ];

        await ActivityLog.insertMany(logs);
        console.log(`✅ Created ${logs.length} logs`);

        // 3. Test Controller Logic (Mock Req/Res)
        console.log('📊 Fetching Stats...');

        const mockReq = { params: { id: user._id } };
        const mockRes = {
            json: (data) => {
                console.log('Response Success:', data.success);
                console.log('Stats:', data.stats);
                console.log('Logs Count:', data.logs.length);

                // Assertions
                if (data.stats.topIPs.includes('127.0.0.1')) console.log('✅ Top IP Verified');
                if (data.stats.totalActions === 3) console.log('✅ Total Actions Verified');
            },
            status: (code) => ({ json: (d) => console.log(`Error ${code}:`, d) })
        };

        await adminController.getUserActivity(mockReq, mockRes);

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testActivity();
