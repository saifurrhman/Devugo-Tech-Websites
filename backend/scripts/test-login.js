const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const authController = require('../controllers/authController');
const User = require('../models/User');

const mockReq = {
    body: {
        email: process.env.SMTP_FROM_EMAIL || 'devugo.tech@gmail.com',
        password: 'wrong-password-test'
    }
};

const mockRes = {
    status: (code) => {
        console.log('Response Status:', code);
        return {
            json: (data) => console.log('Response JSON:', data)
        };
    },
    cookie: () => { }
};

async function testLogin() {
    console.log('🔐 Testing Login Flow...');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // 1. Test Failed Login (Wrong Password)
        console.log('\nTesting Failed Login (Expecting 401)...');
        await authController.login(mockReq, mockRes);

        // 2. Test Success Login (Need valid user)
        // Manual verification required for real password

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testLogin();
