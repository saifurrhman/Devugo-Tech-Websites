const Message = require('../models/Message');

// Get all messages (Inbox)
exports.getMessages = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 20 } = req.query;
        const query = {};

        // Filter by type if provided (email, sms, etc.)
        if (type) query.type = type;

        // Search functionality
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Filter by user assignment or visibility rules if needed
        // query.assignedTo = req.user._id; // Example

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Message.countDocuments(query);

        res.json({
            success: true,
            data: messages,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single message/thread
exports.getMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send a reply (Stub - connects to EmailService/SmsService)
exports.sendReply = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content, type } = req.body;

        // logic to send email/sms via services

        res.json({ success: true, message: 'Reply sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { to, subject, content } = req.body;
        const senderEmail = process.env.DEFAULT_FROM_EMAIL || 'support@devugo.com';

        if (!to || !content) {
            return res.status(400).json({ success: false, message: 'Recipient and content are required' });
        }

        const emailService = require('../services/emailService');

        // 1. Send via Email Service
        const sendResult = await emailService.sendEmail({
            to,
            subject: subject || '(No Subject)',
            html: content,
            text: content.replace(/<[^>]*>/g, '')
        });

        if (!sendResult.success) {
            throw new Error(sendResult.message || 'Failed to send email');
        }

        // 2. Save to Database
        const message = new Message({
            type: 'email',
            direction: 'outbound',
            from: { email: senderEmail, name: 'Support' },
            to: [{ email: to }],
            subject: subject || '(No Subject)',
            body: {
                html: content,
                text: content.replace(/<[^>]*>/g, '')
            },
            status: 'sent',
            deliveryStatus: {
                delivered: true,
                deliveredAt: new Date()
            },
            source: 'manual',
            createdBy: req.user._id
        });

        await message.save();

        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
