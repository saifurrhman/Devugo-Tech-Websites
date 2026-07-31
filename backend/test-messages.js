const mongoose = require('mongoose');
const Message = require('./models/Message');
require('dotenv').config();

async function checkMessages() {
    await mongoose.connect(process.env.MONGO_URI);
    const messages = await Message.find().sort({ createdAt: -1 }).limit(5);
    console.log("Raw latest 5 messages:");
    messages.forEach(m => {
        console.log(`ID: ${m._id}`);
        console.log(`From:`, m.from);
        console.log(`To:`, m.to);
        console.log(`Subject: ${m.subject}`);
        console.log(`Snippet/Body: ${m.snippet || (m.body && m.body.text ? m.body.text.substring(0,20) : '')}`);
        console.log(`ConvID: ${m.conversationId}`);
        console.log('---');
    });

    // Also let's run the exact aggregation pipeline
    const pipeline = [
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$conversationId",
                latestMessage: { $first: "$$ROOT" }
            }
        },
        { $limit: 2 }
    ];
    const results = await Message.aggregate(pipeline);
    console.log("Aggregation results:");
    console.log(JSON.stringify(results.map(r => ({
        id: r._id,
        user: r.latestMessage.from?.name || r.latestMessage.from?.email || 'Unknown User',
        preview: r.latestMessage.snippet || (r.latestMessage.body?.text ? r.latestMessage.body.text.substring(0, 100) : ''),
        subject: r.latestMessage.subject
    })), null, 2));

    process.exit(0);
}

checkMessages();
