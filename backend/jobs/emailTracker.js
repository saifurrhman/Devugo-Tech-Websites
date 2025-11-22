const cron = require('node-cron');
const EmailTracking = require('../models/EmailTracking');
const EmailRecipient = require('../models/EmailRecipient');
const EmailCampaign = require('../models/EmailCampaign');
const logger = require('../utils/logger');

class EmailTrackerJob {

  constructor() {
    this.schedule = process.env.EMAIL_TRACKER_SCHEDULE || '*/10 * * * *';
    this.cleanupSchedule = process.env.EMAIL_TRACKER_CLEANUP_SCHEDULE || '0 2 * * *';
    this.cleanupDays = parseInt(process.env.EMAIL_TRACKER_CLEANUP_DAYS) || 90;
    this.enabled = process.env.ENABLE_JOBS !== 'false';
    this.timezone = process.env.JOB_TIMEZONE || 'UTC';
  }

  /**
   * Start email tracking job
   */
  start() {
    if (!this.enabled) {
      logger.info('Email Tracker job is disabled');
      return;
    }

    // Update stats regularly
    cron.schedule(this.schedule, async () => {
      try {
        logger.info('Email Tracker job started');
        await this.updateCampaignStats();
        await this.updateRecipientStats();
      } catch (error) {
        logger.error('Email Tracker job failed', { error: error.message });
      }
    }, {
      timezone: this.timezone
    });

    // Clean old tracking data
    cron.schedule(this.cleanupSchedule, async () => {
      try {
        logger.info('Cleaning old tracking data');
        await this.cleanOldTrackingData();
      } catch (error) {
        logger.error('Tracking cleanup failed', { error: error.message });
      }
    }, {
      timezone: this.timezone
    });

    logger.info(`✅ Email Tracker job scheduled: ${this.schedule} (${this.timezone})`);
    logger.info(`✅ Cleanup scheduled: ${this.cleanupSchedule} (${this.timezone})`);
    logger.info(`   Cleanup after: ${this.cleanupDays} days`);
  }

  /**
   * Update campaign statistics
   */
  async updateCampaignStats() {
    try {
      const campaigns = await EmailCampaign.find({
        status: { $in: ['running', 'completed'] }
      });

      for (const campaign of campaigns) {
        await this.updateSingleCampaignStats(campaign._id);
      }

      logger.info(`Updated stats for ${campaigns.length} campaigns`);

    } catch (error) {
      logger.error('Campaign stats update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update stats for a single campaign
   */
  async updateSingleCampaignStats(campaignId) {
    try {
      const stats = await EmailTracking.aggregate([
        { $match: { campaign: campaignId } },
        {
          $group: {
            _id: null,
            sent: { $sum: { $cond: ['$status.sent', 1, 0] } },
            delivered: { $sum: { $cond: ['$status.delivered', 1, 0] } },
            opened: { $sum: { $cond: ['$status.opened', 1, 0] } },
            clicked: { $sum: { $cond: ['$status.clicked', 1, 0] } },
            replied: { $sum: { $cond: ['$status.replied', 1, 0] } },
            bounced: { $sum: { $cond: ['$status.bounced', 1, 0] } },
            totalOpens: { $sum: '$openCount' },
            totalClicks: { $sum: '$clickCount' }
          }
        }
      ]);

      if (stats.length > 0) {
        const campaignStats = stats[0];

        const openRate = campaignStats.delivered > 0
          ? (campaignStats.opened / campaignStats.delivered) * 100
          : 0;

        const clickRate = campaignStats.delivered > 0
          ? (campaignStats.clicked / campaignStats.delivered) * 100
          : 0;

        const replyRate = campaignStats.delivered > 0
          ? (campaignStats.replied / campaignStats.delivered) * 100
          : 0;

        const bounceRate = campaignStats.sent > 0
          ? (campaignStats.bounced / campaignStats.sent) * 100
          : 0;

        await EmailCampaign.findByIdAndUpdate(campaignId, {
          $set: {
            'stats.sent': campaignStats.sent,
            'stats.delivered': campaignStats.delivered,
            'stats.opened': campaignStats.opened,
            'stats.clicked': campaignStats.clicked,
            'stats.replied': campaignStats.replied,
            'stats.bounced': campaignStats.bounced,
            'stats.openRate': openRate.toFixed(2),
            'stats.clickRate': clickRate.toFixed(2),
            'stats.replyRate': replyRate.toFixed(2),
            'stats.bounceRate': bounceRate.toFixed(2)
          }
        });

        logger.info('Campaign stats updated', {
          campaignId,
          sent: campaignStats.sent,
          opened: campaignStats.opened,
          openRate: openRate.toFixed(2) + '%'
        });
      }

    } catch (error) {
      logger.error('Single campaign stats update failed', {
        campaignId,
        error: error.message
      });
    }
  }

  /**
   * Update recipient engagement stats
   */
  async updateRecipientStats() {
    try {
      const recentTracking = await EmailTracking.find({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).distinct('recipient');

      for (const recipientId of recentTracking) {
        await this.updateSingleRecipientStats(recipientId);
      }

      logger.info(`Updated stats for ${recentTracking.length} recipients`);

    } catch (error) {
      logger.error('Recipient stats update failed', { error: error.message });
    }
  }

  /**
   * Update stats for a single recipient
   */
  async updateSingleRecipientStats(recipientId) {
    try {
      const tracking = await EmailTracking.find({ recipient: recipientId });

      const stats = {
        emailsSent: tracking.filter(t => t.status.sent).length,
        emailsOpened: tracking.filter(t => t.status.opened).length,
        emailsClicked: tracking.filter(t => t.status.clicked).length,
        emailsReplied: tracking.filter(t => t.status.replied).length,
        emailsBounced: tracking.filter(t => t.status.bounced).length
      };

      const lastOpened = tracking
        .filter(t => t.firstOpenedAt)
        .sort((a, b) => b.firstOpenedAt - a.firstOpenedAt)[0];

      const lastClicked = tracking
        .filter(t => t.firstClickedAt)
        .sort((a, b) => b.firstClickedAt - a.firstClickedAt)[0];

      const lastReplied = tracking
        .filter(t => t.repliedAt)
        .sort((a, b) => b.repliedAt - a.repliedAt)[0];

      const engagementScore = this.calculateEngagementScore(stats);

      await EmailRecipient.findByIdAndUpdate(recipientId, {
        $set: {
          'stats.emailsSent': stats.emailsSent,
          'stats.emailsOpened': stats.emailsOpened,
          'stats.emailsClicked': stats.emailsClicked,
          'stats.emailsReplied': stats.emailsReplied,
          'stats.emailsBounced': stats.emailsBounced,
          'stats.lastOpened': lastOpened?.firstOpenedAt,
          'stats.lastClicked': lastClicked?.firstClickedAt,
          'stats.lastReplied': lastReplied?.repliedAt,
          'stats.engagementScore': engagementScore
        }
      });

    } catch (error) {
      logger.error('Single recipient stats update failed', {
        recipientId,
        error: error.message
      });
    }
  }

  /**
   * Calculate engagement score (0-100)
   */
  calculateEngagementScore(stats) {
    let score = 0;

    if (stats.emailsSent === 0) return 0;

    const openRate = (stats.emailsOpened / stats.emailsSent) * 100;
    score += Math.min(openRate, 40);

    const clickRate = (stats.emailsClicked / stats.emailsSent) * 100;
    score += Math.min(clickRate * 3, 30);

    const replyRate = (stats.emailsReplied / stats.emailsSent) * 100;
    score += Math.min(replyRate * 6, 30);

    const bounceRate = (stats.emailsBounced / stats.emailsSent) * 100;
    score -= bounceRate * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Clean old tracking data
   */
  async cleanOldTrackingData() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.cleanupDays);

      const result = await EmailTracking.deleteMany({
        createdAt: { $lt: cutoffDate },
        'status.replied': false,
        'status.bounced': false
      });

      logger.info('Old tracking data cleaned', {
        deletedCount: result.deletedCount,
        cutoffDate,
        daysOld: this.cleanupDays
      });

    } catch (error) {
      logger.error('Tracking data cleanup failed', { error: error.message });
    }
  }

  /**
   * Detect and mark inactive recipients
   */
  async markInactiveRecipients() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const inactiveRecipients = await EmailRecipient.find({
        'stats.lastOpened': { $lt: cutoffDate },
        'stats.emailsSent': { $gte: 5 },
        leadStatus: { $nin: ['do_not_contact', 'unsubscribed'] }
      });

      for (const recipient of inactiveRecipients) {
        recipient.tags = recipient.tags || [];
        if (!recipient.tags.includes('inactive')) {
          recipient.tags.push('inactive');
          await recipient.save();
        }
      }

      logger.info('Marked inactive recipients', { count: inactiveRecipients.length });

    } catch (error) {
      logger.error('Mark inactive failed', { error: error.message });
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      schedule: this.schedule,
      cleanupSchedule: this.cleanupSchedule,
      cleanupDays: this.cleanupDays,
      timezone: this.timezone
    };
  }
}

const emailTrackerJob = new EmailTrackerJob();

if (process.env.NODE_ENV !== 'test') {
  emailTrackerJob.start();
}

module.exports = emailTrackerJob;