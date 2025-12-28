const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const authController = require('../controllers/authController');
const User = require('../models/User');

// Mock Request and Response
const mockReq = {
    body: {
        email: process.env.SMTP_FROM_EMAIL || 'devugo.tech@gmail.com' // Use sender email as test user
    }
};

const mockRes = {
    json: (data) => console.log('Response JSON:', data),
    status: (code) => {
        console.log('Response Status:', code);
        return { json: (data) => console.log('Response JSON:', data) };
    }
};

async function testOTP() {
    console.log('🧪 Testing OTP Flow...');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Ensure test user exists
        let user = await User.findOne({ email: mockReq.body.email });
        if (!user) {
            console.log('Creating test user:', mockReq.body.email);
            user = await User.create({
                name: 'Test User',
                email: mockReq.body.email,
                password: 'password123',
                role: 'admin'
            });
        }

        console.log('📧 Requesting OTP for:', mockReq.body.email);
        await authController.sendResetOTP(mockReq, mockRes);

        console.log('🏁 Test Completed');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testOTP();
