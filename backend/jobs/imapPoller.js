const cron = require('node-cron');
const imapService = require('../services/imapService');

class ImapPoller {
    constructor() {
        // Run every 1 minute
        this.schedule = '* * * * *';
        this.init();
    }

    init() {
        console.log(`✅ IMAP Poller scheduled: ${this.schedule}`);
        
        cron.schedule(this.schedule, async () => {
            // console.log('IMAP Poller job started');
            try {
                await imapService.syncEmails();
            } catch (error) {
                console.error('Error in IMAP Poller:', error);
            }
        });
    }
}

module.exports = new ImapPoller();
