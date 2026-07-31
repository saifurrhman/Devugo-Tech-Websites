const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const emailService = require('./services/emailService');

async function testEmail() {
    console.log("Testing EmailService...");
    try {
        const result = await emailService.sendEmail({
            to: 'devugo.tech@gmail.com',
            subject: 'Test Reply from Devugo Inbox',
            html: '<h1>This is a test reply</h1><p>Confirming email delivery works.</p>',
            text: 'This is a test reply. Confirming email delivery works.'
        });
        console.log("Email Result:", result);
    } catch (e) {
        console.error("Test Failed with Exception:", e);
    }
    process.exit(0);
}

testEmail();
