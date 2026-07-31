const mongoose = require('mongoose');
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmails() {
    console.log("Sending to devugo.tech@gmail.com...");
    const res1 = await emailService.sendEmail({
        to: 'devugo.tech@gmail.com',
        subject: 'Test to Admin',
        html: '<p>This is a test email to admin.</p>',
        text: 'This is a test email to admin.'
    });
    console.log("Res1:", res1);

    console.log("Sending to saifriaz34@gmail.com...");
    const res2 = await emailService.sendEmail({
        to: 'saifriaz34@gmail.com',
        subject: 'Test to Customer',
        html: '<p>This is a test email to customer.</p>',
        text: 'This is a test email to customer.'
    });
    console.log("Res2:", res2);

    process.exit(0);
}

testEmails();
