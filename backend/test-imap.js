const mongoose = require('mongoose');
const imapService = require('./services/imapService');
require('dotenv').config();

async function runTest() {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("Starting IMAP Sync manually...");
    await imapService.syncEmails();
    
    console.log("IMAP Sync completed. Closing connection.");
    await mongoose.disconnect();
    
    process.exit(0);
}

runTest();
