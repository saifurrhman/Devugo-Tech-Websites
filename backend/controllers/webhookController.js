const EmailTracking = require('../models/EmailTracking');
const EmailRecipient = require('../models/EmailRecipient');
const Message = require('../models/Message');
const AIPersonalization = require('../models/AIPersonalization');
const aiService = require('../services/aiService');

class WebhookController {

  /**
   * Handle n8n webhook for email events
   */
  async handleN8NWebhook(req, res) {
    try {
      const { event, data } = req.body;

      console.log('n8n webhook received:', event);

      switch (event) {
        case 'email_sent':
          await this.handleEmailSent(data);
          break;
        case 'email_delivered':
          await this.handleEmailDelivered(data);
          break;
        case 'email_bounced':
          await this.handleEmailBounced(data);
          break;
        case 'email_opened':
          await this.handleEmailOpened(data);
          break;
        case 'email_clicked':
          await this.handleEmailClicked(data);
          break;
        case 'email_replied':
          await this.handleEmailReplied(data);
          break;
        default:
          console.log('Unknown event type:', event);
      }

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });

    } catch (error) {
      console.error('n8n webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing webhook',
        error: error.message
      });
    }
  }

  /**
   * Handle SendGrid webhook
   */
  async handleSendGridWebhook(req, res) {
    try {
      const events = req.body;

      for (const event of events) {
        const { event: eventType, email, sg_message_id, timestamp } = event;

        const tracking = await EmailTracking.findOne({ 
          messageId: sg_message_id 
        });

        if (!tracking) continue;

        switch (eventType) {
          case 'delivered':
            tracking.addEvent({
              type: 'delivered',
              timestamp: new Date(timestamp * 1000)
            });
            break;
          case 'open':
            tracking.addEvent({
              type: 'opened',
              timestamp: new Date(timestamp * 1000),
              ipAddress: event.ip,
              userAgent: event.useragent
            });
            break;
          case 'click':
            tracking.addEvent({
              type: 'clicked',
              timestamp: new Date(timestamp * 1000),
              linkUrl: event.url,
              ipAddress: event.ip,
              userAgent: event.useragent
            });
            break;
          case 'bounce':
            tracking.addEvent({
              type: 'bounced',
              timestamp: new Date(timestamp * 1000),
              bounceReason: event.reason,
              bounceType: event.type === 'bounce' ? 'hard' : 'soft'
            });
            break;
        }

        await tracking.save();
      }

      res.sendStatus(200);

    } catch (error) {
      console.error('SendGrid webhook error:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Handle incoming email reply (via webhook)
   */
  async handleIncomingEmail(req, res) {
    try {
      const { from, to, subject, body, messageId, inReplyTo } = req.body;

      // Find original tracking
      const originalTracking = await EmailTracking.findOne({
        toEmail: from
      }).sort({ createdAt: -1 });

      if (!originalTracking) {
        return res.json({ success: true, message: 'No matching campaign found' });
      }

      // Create reply message
      const message = new Message({
        type: 'email',
        direction: 'inbound',
        conversationId: Message.generateConversationId(from, to),
        from: {
          email: from
        },
        to: [{
          email: to
        }],
        subject,
        body: {
          text: body
        },
        messageId,
        inReplyTo,
        campaign: originalTracking.campaign,
        recipient: originalTracking.recipient,
        isReply: true,
        source: 'reply'
      });

      await message.save();

      // Update tracking
      originalTracking.addEvent({
        type: 'replied',
        timestamp: new Date()
      });
      await originalTracking.save();

      // Update recipient stats
      await EmailRecipient.findByIdAndUpdate(originalTracking.recipient, {
        $inc: { 'stats.emailsReplied': 1 },
        'stats.lastReplied': new Date()
      });

      // AI analysis of reply
      if (body) {
        const analysis = await aiService.analyzeEmailReply(body);
        
        message.aiAnalysis = {
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          intent: analysis.intent,
          topics: analysis.topics,
          priority: analysis.priority,
          requiresAction: analysis.requiresAction
        };

        await message.save();

        // Update recipient based on intent
        if (analysis.intent === 'interested') {
          await EmailRecipient.findByIdAndUpdate(originalTracking.recipient, {
            leadStatus: 'interested'
          });
        } else if (analysis.intent === 'not_interested') {
          await EmailRecipient.findByIdAndUpdate(originalTracking.recipient, {
            leadStatus: 'not_interested'
          });
        }
      }

      res.json({
        success: true,
        message: 'Reply processed successfully',
        data: message
      });

    } catch (error) {
      console.error('Incoming email error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing incoming email',
        error: error.message
      });
    }
  }

  /**
   * Helper: Handle email sent event
   */
  async handleEmailSent(data) {
    const { messageId, recipientId, campaignId } = data;

    await EmailTracking.findOneAndUpdate(
      { messageId },
      {
        $set: {
          'status.sent': true,
          sentAt: new Date()
        }
      }
    );
  }

  /**
   * Helper: Handle email delivered event
   */
  async handleEmailDelivered(data) {
    const { messageId } = data;

    const tracking = await EmailTracking.findOne({ messageId });
    if (tracking) {
      tracking.addEvent({
        type: 'delivered',
        timestamp: new Date()
      });
      await tracking.save();
    }
  }

  /**
   * Helper: Handle email bounced event
   */
  async handleEmailBounced(data) {
    const { messageId, bounceType, bounceReason } = data;

    const tracking = await EmailTracking.findOne({ messageId });
    if (tracking) {
      tracking.addEvent({
        type: 'bounced',
        timestamp: new Date(),
        bounceType: bounceType || 'hard',
        bounceReason
      });
      await tracking.save();

      // Mark recipient email as invalid if hard bounce
      if (bounceType === 'hard') {
        await EmailRecipient.findByIdAndUpdate(tracking.recipient, {
          verificationStatus: 'invalid'
        });
      }
    }
  }

  /**
   * Helper: Handle email opened event
   */
  async handleEmailOpened(data) {
    const { messageId, ipAddress, userAgent } = data;

    const tracking = await EmailTracking.findOne({ messageId });
    if (tracking) {
      tracking.addEvent({
        type: 'opened',
        timestamp: new Date(),
        ipAddress,
        userAgent
      });
      await tracking.save();
    }
  }

  /**
   * Helper: Handle email clicked event
   */
  async handleEmailClicked(data) {
    const { messageId, linkUrl, ipAddress, userAgent } = data;

    const tracking = await EmailTracking.findOne({ messageId });
    if (tracking) {
      tracking.addEvent({
        type: 'clicked',
        timestamp: new Date(),
        linkUrl,
        ipAddress,
        userAgent
      });
      await tracking.save();
    }
  }

  /**
   * Helper: Handle email replied event
   */
  async handleEmailReplied(data) {
    const { messageId, replyText } = data;

    const tracking = await EmailTracking.findOne({ messageId });
    if (tracking) {
      tracking.addEvent({
        type: 'replied',
        timestamp: new Date()
      });
      await tracking.save();
    }
  }
}

module.exports = new WebhookController();