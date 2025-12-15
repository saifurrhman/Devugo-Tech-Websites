const fetch = require('node-fetch'); // Ensure node-fetch is available, or use native fetch in Node 18+
const logger = require('../utils/logger');
const smtpConfig = require('../config/smtp');

class SmsService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.senderName = process.env.BREVO_SENDER_NAME || 'Devugo';
    }

    /**
     * Send a transactional SMS
     * @param {Object} options
     * @param {string} options.recipient - Phone number with country code (e.g. +1234567890)
     * @param {string} options.content - Message content (max 160 chars recommended)
     * @param {string} [options.sender] - Sender name (max 11 chars alphanumeric)
     * @param {string} [options.tag] - Tag for tracking
     */
    async sendSms({ recipient, content, sender, tag }) {
        try {
            if (!this.apiKey) {
                throw new Error('BREVO_API_KEY is not configured');
            }

            if (!recipient || !content) {
                throw new Error('Recipient and content are required');
            }

            const payload = {
                sender: sender || this.senderName.substring(0, 11), // Brevo limits sender to 11 chars
                recipient: recipient,
                content: content,
                type: 'transactional',
                tag: tag
            };

            logger.info(`Sending SMS to ${recipient}`);

            const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send SMS via Brevo');
            }

            logger.info('SMS sent successfully', {
                recipient,
                messageId: data.messageId,
                remainingCredits: data.remainingCredits
            });

            return {
                success: true,
                messageId: data.messageId,
                remainingCredits: data.remainingCredits
            };

        } catch (error) {
            logger.error('SMS sending failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get SMS Account Balance/Credits
     */
    async getAccountInfo() {
        try {
            const response = await fetch('https://api.brevo.com/v3/account', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey
                }
            });

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SmsService();
