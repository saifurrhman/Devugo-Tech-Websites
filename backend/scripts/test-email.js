const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('📧 Testing Email Configuration...');

    // check env vars
    console.log('SMTP Config:');
    console.log('  SMTP_ENABLED:', process.env.SMTP_ENABLED);
    console.log('  SMTP_HOST:', process.env.SMTP_HOST);
    console.log('  SMTP_PORT:', process.env.SMTP_PORT);
    console.log('  SMTP_USER:', process.env.SMTP_USER ? '***' : 'MISSING');
    console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'MISSING');
    console.log('  SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);

    if (process.env.SMTP_ENABLED !== 'true') {
        console.log('❌ SMTP is disabled in .env (SMTP_ENABLED is not "true")');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        console.log('🔌 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully');

        const testMessage = {
            from: process.env.SMTP_FROM_EMAIL,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email from Devugo Tech Backend',
            text: 'If you receive this, your SMTP configuration is correct.',
            html: '<h1>Test Email</h1><p>If you receive this, your SMTP configuration is correct.</p>'
        };

        console.log('📨 Sending test email to', testMessage.to);
        const info = await transporter.sendMail(testMessage);

        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Error testing email:');
        console.error(error);
    }
}

testEmail();
