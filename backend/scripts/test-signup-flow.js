const axios = require('axios');

async function testSignup() {
    const email = `test.signup.${Date.now()}@devugo.com`;
    const password = 'Password@123';
    const name = 'Test User';

    console.log('🚀 Testing Signup Flow...');
    console.log(`📧 Email: ${email}`);

    try {
        const res = await axios.post('http://localhost:5000/api/auth/signup', {
            name,
            email,
            password
        });

        console.log('✅ Response Status:', res.status);
        console.log('📦 Response Data:', JSON.stringify(res.data, null, 2));

        if (res.data.step === 'verification') {
            console.log('🎉 SUCCESS: Backend is returning verification step.');
        } else if (res.data.accessToken) {
            console.log('⚠️ WARNING: Backend returned Access Token directly (OLD LOGIC).');
        } else {
            console.log('❓ UNKNOWN RESPONSE.');
        }

    } catch (err) {
        if (err.response) {
            console.error('❌ Error Response:', err.response.status, err.response.data);
        } else {
            console.error('❌ Request Failed:', err.message);
        }
    }
}

testSignup();
