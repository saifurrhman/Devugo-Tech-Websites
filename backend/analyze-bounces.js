const mongoose = require('mongoose');
const Message = require('./models/Message');
require('dotenv').config();

async function analyzeBounces() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find recent messages from mailer-daemon
    const bounces = await Message.find({
        'from.email': { $regex: /mailer-daemon/i }
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`Found ${bounces.length} bounce messages.`);
    
    for (const b of bounces) {
        console.log("\n==============================");
        console.log(`Subject: ${b.subject}`);
        console.log(`Time: ${b.createdAt}`);
        // Extract the failed recipient from the text body
        const text = b.body?.text || '';
        const failedToMatch = text.match(/To:\s*([^\n\r]+)/i) || text.match(/failed to deliver to:\s*([^\n\r]+)/i) || text.match(/<([^>]+)>:\s*user unknown/i) || text.match(/delivery to ([\w.-]+@[\w.-]+) failed/i);
        
        console.log("Failed Recipient (extracted):", failedToMatch ? failedToMatch[1] : 'Could not extract');
        console.log("Snippet:", text.substring(0, 300).replace(/\n/g, ' '));
    }
    
    // Check recent outbound messages
    const outbounds = await Message.find({ direction: 'outbound' }).sort({ createdAt: -1 }).limit(5);
    console.log("\n\n=== RECENT OUTBOUND MESSAGES ===");
    for (const o of outbounds) {
        console.log(`To: ${JSON.stringify(o.to)} | Subject: ${o.subject} | Time: ${o.createdAt}`);
    }

    mongoose.disconnect();
}

analyzeBounces();
