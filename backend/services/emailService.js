const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const EmailCampaign = require('../models/EmailCampaign');
const EmailRecipient = require('../models/EmailRecipient');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

/**
 * Send complete campaign to all recipients
 */
exports.sendCampaign = async (campaign) => {
  try {
    console.log(`📧 Starting campaign: ${campaign.name}`);

    // Update campaign status
    campaign.status = 'sending';
    await campaign.save();

    const recipients = await EmailRecipient.find({
      _id: { $in: campaign.recipients },
      status: 'active'
    });

    if (recipients.length === 0) {
      throw new Error('No active recipients found');
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send emails with delay to avoid rate limiting
    for (const recipient of recipients) {
      try {
        await this.sendSingleEmail({
          to: recipient.email,
          subject: campaign.subject,
          html: this.replaceVariables(campaign.htmlContent, recipient),
          campaignId: campaign._id,
          recipientId: recipient._id
        });

        sentCount++;
        
        // Small delay to avoid rate limiting (100ms between emails)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error.message);
        failedCount++;
      }
    }

    // Update campaign stats
    campaign.status = 'completed';
    campaign.sentAt = new Date();
    campaign.stats.sent = sentCount;
    campaign.stats.failed = failedCount;
    await campaign.save();

    console.log(`✅ Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return {
      success: true,
      sent: sentCount,
      failed: failedCount
    };
  } catch (error) {
    campaign.status = 'failed';
    await campaign.save();
    throw error;
  }
};

/**
 * Send single email
 */
exports.sendSingleEmail = async ({ to, subject, html, text, campaignId, recipientId }) => {
  try {
    // Create email log entry
    const emailLog = await EmailLog.create({
      campaign: campaignId,
      recipient: recipientId,
      recipientEmail: to,
      subject: subject,
      status: 'queued',
      queuedAt: new Date()
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'DevUGo Tech'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text || '',
      html: html,
      headers: {
        'X-Campaign-ID': campaignId ? campaignId.toString() : 'direct',
        'X-Recipient-ID': recipientId ? recipientId.toString() : 'unknown'
      }
    });

    // Update log
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    emailLog.messageId = info.messageId;
    await emailLog.save();

    // Update recipient last emailed
    if (recipientId) {
      await EmailRecipient.findByIdAndUpdate(recipientId, {
        lastEmailedAt: new Date()
      });
    }

    return {
      success: true,
      messageId: info.messageId,
      logId: emailLog._id
    };
  } catch (error) {
    // Log error
    if (recipientId) {
      await EmailLog.create({
        campaign: campaignId,
        recipient: recipientId,
        recipientEmail: to,
        subject: subject,
        status: 'failed',
        error: error.message
      });
    }

    throw error;
  }
};

/**
 * Replace template variables
 */
exports.replaceVariables = (template, recipient) => {
  let content = template;

  // Replace common variables
  content = content.replace(/\{\{name\}\}/g, recipient.name || 'there');
  content = content.replace(/\{\{firstName\}\}/g, recipient.firstName || recipient.name || 'there');
  content = content.replace(/\{\{lastName\}\}/g, recipient.lastName || '');
  content = content.replace(/\{\{email\}\}/g, recipient.email);
  content = content.replace(/\{\{company\}\}/g, recipient.company || '');
  content = content.replace(/\{\{phone\}\}/g, recipient.phone || '');

  // Replace custom fields
  if (recipient.customFields) {
    Object.keys(recipient.customFields).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, recipient.customFields[key] || '');
    });
  }

  return content;
};

/**
 * Send test email
 */
exports.sendTestEmail = async (to, subject, html) => {
  return await this.sendSingleEmail({
    to,
    subject,
    html,
    campaignId: null,
    recipientId: null
  });
};

/**
 * Get email statistics
 */
exports.getEmailStats = async (campaignId) => {
  const logs = await EmailLog.find({ campaign: campaignId });

  return {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent' || l.status === 'delivered').length,
    delivered: logs.filter(l => l.status === 'delivered').length,
    opened: logs.filter(l => l.status === 'opened').length,
    clicked: logs.filter(l => l.status === 'clicked').length,
    bounced: logs.filter(l => l.status === 'bounced').length,
    failed: logs.filter(l => l.status === 'failed').length
  };
};

module.exports = exports;