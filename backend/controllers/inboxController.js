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

        // Use aggregation to group by conversationId and get the latest message for each thread
        const skip = (page - 1) * limit;
        
        const pipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    latestMessage: { $first: "$$ROOT" },
                    unreadCount: { 
                        $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } 
                    }
                }
            },
            { $sort: { "latestMessage.createdAt": -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: parseInt(limit) }
                    ]
                }
            }
        ];

        const results = await Message.aggregate(pipeline);
        const total = results[0].metadata[0]?.total || 0;
        
        // Map the results to match frontend expectations
        const messages = results[0].data.map(item => {
            const msg = item.latestMessage;
            return {
                id: msg.conversationId,
                _id: msg.conversationId, // Fallback for frontend
                user: msg.from?.name || msg.from?.email || 'Unknown User',
                email: msg.from?.email,
                subject: msg.subject,
                preview: msg.snippet || (msg.body?.text ? msg.body.text.substring(0, 100) : ''),
                time: msg.createdAt, // Frontend will format this
                status: item.unreadCount > 0 ? 'unread' : 'read',
                direction: msg.direction
            };
        });

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
        const mongoose = require('mongoose');
        let thread;
        let mainMessage;

        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            mainMessage = await Message.findById(req.params.id);
            if (!mainMessage) {
                return res.status(404).json({ success: false, message: 'Message not found' });
            }
            if (mainMessage.conversationId) {
                thread = await Message.find({ conversationId: mainMessage.conversationId }).sort({ createdAt: 1 });
            } else {
                thread = [mainMessage];
            }
        } else {
            // It's a conversationId
            thread = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
            if (!thread || thread.length === 0) {
                return res.status(404).json({ success: false, message: 'Conversation not found' });
            }
            mainMessage = thread[0];
        }
            
        // Return in a format the frontend expects: { subject: '...', messages: [...] }
        res.json({ 
            success: true, 
            subject: mainMessage.subject || '(No Subject)',
            messages: thread.map(msg => ({
                id: msg._id,
                sender: msg.direction === 'outbound' ? 'agent' : 'user',
                name: msg.from.name || msg.from.email,
                content: msg.body?.html || msg.body?.text || '',
                time: new Date(msg.createdAt).toLocaleString(),
                direction: msg.direction,
                status: msg.status
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send a reply
exports.sendReply = async (req, res) => {
    try {
        const { id } = req.params; // Changed from messageId to id to match route parameter typical naming, but let's check route. Usually it's :id.
        const { content } = req.body;
        
        const mongoose = require('mongoose');
        
        let originalMessage;
        if (mongoose.Types.ObjectId.isValid(id)) {
            originalMessage = await Message.findById(id);
        } else {
            originalMessage = await Message.findOne({ conversationId: id }).sort({ createdAt: -1 });
        }

        if (!originalMessage) {
            return res.status(404).json({ success: false, message: 'Original conversation/message not found' });
        }

        const Sender = require('../models/Sender');
        let customSender = null;
        let senderEmail = process.env.DEFAULT_FROM_EMAIL || 'support@devugotechsolution.store';
        let senderName = 'Support';

        if (req.body.senderId) {
            customSender = await Sender.findById(req.body.senderId);
            if (customSender) {
                senderEmail = customSender.emailAddress;
                senderName = customSender.displayName;
            }
        } else if (originalMessage.direction === 'inbound' && originalMessage.to && originalMessage.to[0]) {
            // Try to find if the 'to' address matches one of our senders
            customSender = await Sender.findOne({ emailAddress: originalMessage.to[0].email });
            if (customSender) {
                senderEmail = customSender.emailAddress;
                senderName = customSender.displayName;
            }
        }

        const emailService = require('../services/emailService');

        // Determine recipient
        const recipient = originalMessage.direction === 'inbound' ? originalMessage.from : originalMessage.to[0];
        if (!recipient || !recipient.email) {
            return res.status(400).json({ success: false, message: 'Recipient email address not found in original message' });
        }

        const subject = `Re: ${originalMessage.subject || '(No Subject)'}`;
        
        // Beautiful HTML Template
        const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1e293b; padding: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0;">Devugo Tech Solutions</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6; font-size: 15px;">
                ${content.replace(/\n/g, '<br>')}
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; color: #64748b; font-size: 13px;">
                    Need more help? Reply directly to this email.<br>
                    &copy; ${new Date().getFullYear()} Devugo Tech Solutions
                </p>
            </div>
        </div>
        `;

        // Validate recipient email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient.email)) {
            return res.status(400).json({ success: false, message: `Invalid recipient email address format: ${recipient.email}` });
        }

        console.log(`[Send Reply] Validated recipient. Preparing to send email to exactly: "${recipient.email}"`);

        // Send the actual email
        const emailResult = await emailService.sendEmail({
            to: recipient.email,
            subject: subject,
            html: htmlTemplate,
            text: content.replace(/<[^>]*>/g, '')
        }, customSender);

        if (!emailResult || !emailResult.success) {
            console.error("Email sending failed:", emailResult);
            return res.status(500).json({ 
                success: false, 
                message: emailResult?.message || 'Failed to send email to customer. Check email service configuration.' 
            });
        }
        
        const reply = new Message({
            type: 'email',
            direction: 'outbound',
            conversationId: originalMessage.conversationId,
            isReply: true,
            replyTo: originalMessage._id,
            from: { email: senderEmail, name: senderName },
            to: [recipient],
            subject: subject,
            body: {
                html: htmlTemplate,
                text: content.replace(/<[^>]*>/g, '')
            },
            status: 'sent',
            source: 'manual',
            createdBy: req.user ? req.user._id : null
        });

        await reply.save();

        res.json({ success: true, message: 'Reply sent successfully', data: reply });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { to, subject, content, senderId } = req.body;
        let senderEmail = process.env.DEFAULT_FROM_EMAIL || 'support@devugotechsolution.store';
        let senderName = 'Support';
        let customSender = null;
        
        const Sender = require('../models/Sender');
        if (senderId) {
            customSender = await Sender.findById(senderId);
            if (customSender) {
                senderEmail = customSender.emailAddress;
                senderName = customSender.displayName;
            }
        }

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
        }, customSender);

        if (!sendResult.success) {
            throw new Error(sendResult.message || 'Failed to send email');
        }

        // 2. Save to Database
        const message = new Message({
            type: 'email',
            direction: 'outbound',
            from: { email: senderEmail, name: senderName },
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
