const mongoose = require('mongoose');
const Message = require('./models/Message');
require('dotenv').config();

async function checkBounceDates() {
    await mongoose.connect(process.env.MONGO_URI);
    const bounces = await Message.find({
        'from.email': { $regex: /mailer-daemon/i }
    }).limit(5);

    for (const b of bounces) {
        console.log(`DB CreatedAt: ${b.createdAt} | Subject: ${b.subject}`);
        console.log(`Snippet: ${b.body?.text?.substring(0, 100).replace(/\n/g, ' ')}`);
    }
    mongoose.disconnect();
}

checkBounceDates();
