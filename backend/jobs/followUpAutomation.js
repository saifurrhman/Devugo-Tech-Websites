const cron = require('node-cron');
const EmailCampaign = require('../models/EmailCampaign');
const EmailRecipient = require('../models/EmailRecipient');
const EmailTracking = require('../models/EmailTracking');
const Message = require('../models/Message');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class FollowUpAutomationJob {

  constructor() {
    this.schedule = process.env.FOLLOWUP_AUTOMATION_SCHEDULE || '0 * * * *';
    this.noOpenDays = parseInt(process.env.FOLLOWUP_NO_OPEN_DAYS) || 3;
    this.noClickDays = parseInt(process.env.FOLLOWUP_NO_CLICK_DAYS) || 2;
    this.noReplyDays = parseInt(process.env.FOLLOWUP_NO_REPLY_DAYS) || 5;
    this.inactiveDays = parseInt(process.env.FOLLOWUP_INACTIVE_DAYS) || 30;
    this.enabled = process.env.ENABLE_JOBS !== 'false';
    this.timezone = process.env.JOB_TIMEZONE || 'UTC';
  }

  /**
   * Start follow-up automation job
   */
  start() {
    if (!this.enabled) {
      logger.info('Follow-up Automation job is disabled');
      return;
    }

    cron.schedule(this.schedule, async () => {
      try {
        logger.info('Follow-up Automation job started');
        await this.processFollowUps();
      } catch (error) {
        logger.error('Follow-up Automation job failed', { error: error.message });
      }
    }, {
      timezone: this.timezone
    });

    logger.info(`✅ Follow-up Automation scheduled: ${this.schedule} (${this.timezone})`);
    logger.info(`   No-open follow-up after: ${this.noOpenDays} days`);
    logger.info(`   No-click follow-up after: ${this.noClickDays} days`);
    logger.info(`   No-reply follow-up after: ${this.noReplyDays} days`);
    logger.info(`   Re-engagement after: ${this.inactiveDays} days`);
  }

  /**
   * Process all pending follow-ups
   */
  async processFollowUps() {
    try {
      await this.sendNoOpenFollowUps();
      await this.sendNoClickFollowUps();
      await this.sendNoReplyFollowUps();
      await this.sendReEngagementEmails();

      logger.info('Follow-up automation completed');

    } catch (error) {
      logger.error('Follow-up processing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Send follow-ups to recipients who didn't open
   */
  async sendNoOpenFollowUps() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.noOpenDays);

      const trackingRecords = await EmailTracking.find({
        sentAt: { $lte: cutoffDate },
        'status.opened': false,
        'status.bounced': false,
        followUpSent: { $ne: true }
      })
        .populate('campaign')
        .populate('recipient')
        .limit(50);

      for (const tracking of trackingRecords) {
        if (!tracking.campaign?.followUpSettings?.enableNoOpenFollowUp) {
          continue;
        }

        await this.sendFollowUpEmail(tracking, 'no_open');
        
        tracking.followUpSent = true;
        await tracking.save();
      }

      logger.info('No-open follow-ups sent', { count: trackingRecords.length });

    } catch (error) {
      logger.error('No-open follow-ups failed', { error: error.message });
    }
  }

  /**
   * Send follow-ups to recipients who opened but didn't click
   */
  async sendNoClickFollowUps() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.noClickDays);

      const trackingRecords = await EmailTracking.find({
        firstOpenedAt: { $lte: cutoffDate },
        'status.clicked': false,
        'status.replied': false,
        clickFollowUpSent: { $ne: true }
      })
        .populate('campaign')
        .populate('recipient')
        .limit(50);

      for (const tracking of trackingRecords) {
        if (!tracking.campaign?.followUpSettings?.enableNoClickFollowUp) {
          continue;
        }

        await this.sendFollowUpEmail(tracking, 'no_click');
        
        tracking.clickFollowUpSent = true;
        await tracking.save();
      }

      logger.info('No-click follow-ups sent', { count: trackingRecords.length });

    } catch (error) {
      logger.error('No-click follow-ups failed', { error: error.message });
    }
  }

  /**
   * Send follow-ups to recipients who clicked but didn't reply
   */
  async sendNoReplyFollowUps() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.noReplyDays);

      const trackingRecords = await EmailTracking.find({
        firstClickedAt: { $lte: cutoffDate },
        'status.replied': false,
        replyFollowUpSent: { $ne: true }
      })
        .populate('campaign')
        .populate('recipient')
        .limit(50);

      for (const tracking of trackingRecords) {
        if (!tracking.campaign?.followUpSettings?.enableNoReplyFollowUp) {
          continue;
        }

        await this.sendFollowUpEmail(tracking, 'no_reply');
        
        tracking.replyFollowUpSent = true;
        await tracking.save();
      }

      logger.info('No-reply follow-ups sent', { count: trackingRecords.length });

    } catch (error) {
      logger.error('No-reply follow-ups failed', { error: error.message });
    }
  }

  /**
   * Send re-engagement emails to inactive recipients
   */
  async sendReEngagementEmails() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.inactiveDays);

      const inactiveRecipients = await EmailRecipient.find({
        'stats.lastOpened': { $lt: cutoffDate },
        'stats.emailsSent': { $gte: 3 },
        reEngagementSent: { $ne: true },
        leadStatus: { $nin: ['do_not_contact', 'unsubscribed'] }
      }).limit(50);

      for (const recipient of inactiveRecipients) {
        await this.sendReEngagementEmail(recipient);
        
        recipient.reEngagementSent = true;
        await recipient.save();
      }

      logger.info('Re-engagement emails sent', { count: inactiveRecipients.length });

    } catch (error) {
      logger.error('Re-engagement emails failed', { error: error.message });
    }
  }

  /**
   * Send a follow-up email
   */
  async sendFollowUpEmail(tracking, followUpType) {
    try {
      const { campaign, recipient } = tracking;

      const template = this.getFollowUpTemplate(followUpType, campaign);

      const emailData = {
        to: recipient.email,
        from: campaign.fromEmail || process.env.DEFAULT_FROM_EMAIL,
        subject: this.personalizeContent(template.subject, recipient),
        html: this.personalizeContent(template.body, recipient),
        campaignId: campaign._id,
        recipientId: recipient._id
      };

      await emailService.sendEmail(emailData);

      logger.info('Follow-up email sent', {
        type: followUpType,
        recipient: recipient.email
      });

    } catch (error) {
      logger.error('Follow-up email sending failed', {
        error: error.message,
        recipient: tracking.recipient?.email
      });
    }
  }

  /**
   * Send re-engagement email
   */
  async sendReEngagementEmail(recipient) {
    try {
      const template = {
        subject: 'We miss you, {{firstName}}!',
        body: `
          <h2>Hi {{firstName}},</h2>
          <p>We noticed you haven't engaged with our recent emails.</p>
          <p>We'd love to know if you're still interested in hearing from us.</p>
          <p>Click here to let us know you'd like to stay connected, or unsubscribe below.</p>
          <p>Best regards,<br>The Team</p>
        `
      };

      const emailData = {
        to: recipient.email,
        from: process.env.DEFAULT_FROM_EMAIL,
        subject: this.personalizeContent(template.subject, recipient),
        html: this.personalizeContent(template.body, recipient),
        recipientId: recipient._id
      };

      await emailService.sendEmail(emailData);

      logger.info('Re-engagement email sent', { recipient: recipient.email });

    } catch (error) {
      logger.error('Re-engagement email failed', {
        error: error.message,
        recipient: recipient.email
      });
    }
  }

  /**
   * Get follow-up template based on type
   */
  getFollowUpTemplate(followUpType, campaign) {
    const templates = {
      no_open: {
        subject: 'Following up on: {{campaignName}}',
        body: `
          <p>Hi {{firstName}},</p>
          <p>I wanted to follow up on my previous email about {{campaignName}}.</p>
          <p>I thought this might be of interest to you. Let me know if you'd like to discuss further.</p>
          <p>Best regards</p>
        `
      },
      no_click: {
        subject: 'Quick question about {{campaignName}}',
        body: `
          <p>Hi {{firstName}},</p>
          <p>I noticed you opened my email about {{campaignName}}. Did you have any questions?</p>
          <p>I'm here to help if you need more information.</p>
          <p>Best regards</p>
        `
      },
      no_reply: {
        subject: 'Still interested in {{campaignName}}?',
        body: `
          <p>Hi {{firstName}},</p>
          <p>I saw you checked out the information about {{campaignName}}.</p>
          <p>Would you like to schedule a quick call to discuss how we can help?</p>
          <p>Best regards</p>
        `
      }
    };

    return templates[followUpType] || templates.no_open;
  }

  /**
   * Personalize content with recipient data
   */
  personalizeContent(content, recipient) {
    return content
      .replace(/{{firstName}}/g, recipient.firstName || 'there')
      .replace(/{{lastName}}/g, recipient.lastName || '')
      .replace(/{{company}}/g, recipient.company || '')
      .replace(/{{campaignName}}/g, recipient.campaign?.name || 'our service');
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      schedule: this.schedule,
      noOpenDays: this.noOpenDays,
      noClickDays: this.noClickDays,
      noReplyDays: this.noReplyDays,
      inactiveDays: this.inactiveDays,
      timezone: this.timezone
    };
  }
}

const followUpAutomationJob = new FollowUpAutomationJob();

if (process.env.NODE_ENV !== 'test') {
  followUpAutomationJob.start();
}

module.exports = followUpAutomationJob;