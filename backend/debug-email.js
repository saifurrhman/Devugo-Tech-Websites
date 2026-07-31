require('dotenv').config();
const mongoose = require('mongoose');
const inboxController = require('./controllers/inboxController');

async function debugEmailFlow() {
    console.log("=== STEP 3: ENVIRONMENT VARIABLES CHECK ===");
    console.log("SMTP_ENABLED:", process.env.SMTP_ENABLED);
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
    console.log("SMTP_FROM_EMAIL:", process.env.SMTP_FROM_EMAIL);
    console.log("BREVO_ENABLED:", process.env.BREVO_ENABLED);

    console.log("\n=== STEP 5: RUNNING TEST REPLY ===");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create mock req and res
    const req = {
        params: { id: 'conv_saifriaz34_gmail_com_support_devugo_com' },
        body: { content: 'This is a test reply from the debug script.' }
    };
    
    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log(`[Response ${this.statusCode || 200}]`, JSON.stringify(data, null, 2));
        }
    };

    try {
        await inboxController.sendReply(req, res);
    } catch (err) {
        console.error("FATAL ERROR IN CONTROLLER:", err);
    }

    mongoose.disconnect();
}

debugEmailFlow();
