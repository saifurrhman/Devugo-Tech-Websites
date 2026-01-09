require('dotenv').config();
const mongoose = require('mongoose');
const CompanyInfo = require('../models/CompanyInfo');
const controller = require('../controllers/companyInfoController');

const mockRes = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log('Response Status:', code);
        return {
            json: (data) => console.log('Error JSON:', data)
        };
    }
};

const mockReq = {
    body: {
        companyName: "Debug Tech Update",
        email: "debug@example.com",
        showWhatsappFloat: false
    }
};

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        console.log('--- Testing getPublic ---');
        await controller.getPublic({}, mockRes);

        console.log('\n--- Testing Update ---');
        await controller.update(mockReq, mockRes);

        console.log('\n--- Verifying Update ---');
        const updated = await CompanyInfo.findOne();
        console.log('Updated DB Doc:', updated);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
