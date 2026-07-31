const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
require('dotenv').config();

class ImapService {
    constructor() {
        this.client = null;
        this.isProcessing = false;
    }

    async connect() {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('[IMAP] Missing credentials in .env');
            return false;
        }

        this.client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            logger: false
        });

        try {
            await this.client.connect();
            console.log('[IMAP] Connected to Gmail IMAP successfully');
            return true;
        } catch (err) {
            console.error('[IMAP] Connection failed:', err);
            return false;
        }
    }

    async syncEmails() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            let connected = false;
            if (!this.client || !this.client.usable) {
                connected = await this.connect();
            } else {
                connected = true;
            }

            if (!connected) return;

            // Select INBOX
            let lock = await this.client.getMailboxLock('INBOX');
            try {
                // Search for unseen emails from the last 24 hours
                let sinceDate = new Date();
                sinceDate.setDate(sinceDate.getDate() - 1);
                
                let searchResult = await this.client.search({ seen: false, since: sinceDate });
                if (!searchResult || searchResult.length === 0) {
                    return; // No new emails
                }

                console.log(`[IMAP] Found ${searchResult.length} new unseen emails (last 24h). Processing max 20.`);

                let count = 0;
                for (let seq of searchResult) {
                    if (count >= 20) break;
                    count++;
                    // Fetch the entire message
                    let message = await this.client.fetchOne(seq, { source: true });
                    if (!message || !message.source) continue;

                    // Parse raw source
                    let parsed = await simpleParser(message.source);
                    
                    const fromEmail = parsed.from?.value?.[0]?.address;
                    const fromName = parsed.from?.value?.[0]?.name || fromEmail;
                    const subject = parsed.subject || '(No Subject)';
                    const text = parsed.text || '';
                    const html = parsed.html || text;
                    const messageId = parsed.messageId;
                    
                    if (!fromEmail) continue;

                    // Skip emails from ourselves (agent's own replies)
                    if (fromEmail.toLowerCase() === process.env.SMTP_USER.toLowerCase()) {
                        await this.client.messageFlagsAdd(seq, ['\\Seen']);
                        continue;
                    }

                    // --- ISSUE 2: Filter System/Bounce Emails ---
                    const settings = await Settings.getSettings();
                    const inboxSettings = settings.inbox || {};
                    
                    if (inboxSettings.filterSystemEmails !== false) {
                        const patterns = inboxSettings.systemEmailPatterns || [
                            'mailer-daemon@', 'postmaster@', 'mail-delivery-subsystem@', 
                            'no-reply@', 'noreply@', 'bounce@', 'system@'
                        ];
                        
                        const isSystemSender = patterns.some(pattern => 
                            fromEmail.toLowerCase().includes(pattern.toLowerCase())
                        );
                        
                        const isBounceSubject = [
                            'delivery status notification',
                            'undelivered mail returned to sender',
                            'mail delivery failed',
                            'delivery failure'
                        ].some(term => subject.toLowerCase().includes(term));
                        
                        if (isSystemSender || isBounceSubject) {
                            console.log(`[IMAP] Skipping system/bounce email from ${fromEmail}`);
                            await this.client.messageFlagsAdd(seq, ['\\Seen']);
                            continue;
                        }
                    }
                    // ---------------------------------------------

                    // Create Conversation ID
                    const conversationId = Message.generateConversationId(fromEmail, process.env.SMTP_USER);

                    // Look for ANY existing message with this user
                    const lastMessage = await Message.findOne({ conversationId }).sort({ createdAt: -1 });

                    // Save message to DB
                    const newMsg = new Message({
                        type: 'email',
                        direction: 'inbound',
                        conversationId: conversationId,
                        isReply: !!lastMessage,
                        replyTo: lastMessage ? lastMessage._id : undefined,
                        from: { email: fromEmail, name: fromName },
                        to: [{ email: process.env.SMTP_USER, name: 'Support' }],
                        subject: subject,
                        body: { text: text, html: html },
                        isRead: false,
                        status: 'delivered'
                    });

                    await newMsg.save();
                    console.log(`[IMAP] Saved inbound email from ${fromEmail} to DB.`);

                    // Mark as read in Gmail so we don't fetch it again
                    await this.client.messageFlagsAdd(seq, ['\\Seen']);
                }
            } finally {
                lock.release();
            }
        } catch (err) {
            console.error('[IMAP] Error fetching emails:', err);
        } finally {
            this.isProcessing = false;
        }
    }
}

module.exports = new ImapService();
