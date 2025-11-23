const EmailTracking = require('../models/EmailTracking');
const EmailRecipient = require('../models/EmailRecipient');
const logger = require('../utils/logger');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

class TrackingService {

  async trackOpen(trackingId, ipAddress, userAgent) {
    try {
      const tracking = await EmailTracking.findById(trackingId);

      if (!tracking) {
        logger.warn(`Tracking not found: ${trackingId}`);
        return null;
      }

      // Get location from IP
      const geo = geoip.lookup(ipAddress);
      const parser = new UAParser(userAgent);
      const ua = parser.getResult();

      const eventData = {
        type: 'opened',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        location: geo ? {
          country: geo.country,
          city: geo.city,
          region: geo.region
        } : undefined,
        device: this.getDeviceType(ua),
        os: ua.os.name,
        browser: ua.browser.name
      };

      tracking.addEvent(eventData);
      await tracking.save();

      // Update recipient stats
      await this.updateRecipientStats(tracking.recipient, 'open');

      logger.info(`Email opened: ${trackingId}`);
      return tracking;

    } catch (error) {
      logger.error('Track open error:', error.message);
      return null;
    }
  }

  async trackClick(trackingId, linkUrl, ipAddress, userAgent) {
    try {
      const tracking = await EmailTracking.findById(trackingId);

      if (!tracking) {
        logger.warn(`Tracking not found: ${trackingId}`);
        return null;
      }

      const geo = geoip.lookup(ipAddress);
      const parser = new UAParser(userAgent);
      const ua = parser.getResult();

      const eventData = {
        type: 'clicked',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        linkUrl,
        location: geo ? {
          country: geo.country,
          city: geo.city,
          region: geo.region
        } : undefined,
        device: this.getDeviceType(ua),
        os: ua.os.name,
        browser: ua.browser.name
      };

      tracking.addEvent(eventData);
      await tracking.save();

      // Update recipient stats
      await this.updateRecipientStats(tracking.recipient, 'click');

      logger.info(`Link clicked: ${trackingId} - ${linkUrl}`);
      return tracking;

    } catch (error) {
      logger.error('Track click error:', error.message);
      return null;
    }
  }

  async trackBounce(trackingId, bounceReason, bounceType) {
    try {
      const tracking = await EmailTracking.findById(trackingId);

      if (!tracking) {
        return null;
      }

      const eventData = {
        type: 'bounced',
        timestamp: new Date(),
        bounceReason,
        bounceType
      };

      tracking.addEvent(eventData);
      await tracking.save();

      logger.info(`Email bounced: ${trackingId}`);
      return tracking;

    } catch (error) {
      logger.error('Track bounce error:', error.message);
      return null;
    }
  }

  async updateRecipientStats(recipientId, eventType) {
    try {
      const recipient = await EmailRecipient.findById(recipientId);

      if (!recipient) {
        return;
      }

      if (eventType === 'open') {
        recipient.totalOpens = (recipient.totalOpens || 0) + 1;
        recipient.lastOpenDate = new Date();
      } else if (eventType === 'click') {
        recipient.totalClicks = (recipient.totalClicks || 0) + 1;
        recipient.lastClickDate = new Date();
      }

      // Update engagement score
      const engagementScore = this.calculateEngagementScore(recipient);
      recipient.engagementScore = engagementScore;

      await recipient.save();

    } catch (error) {
      logger.error('Update recipient stats error:', error.message);
    }
  }

  calculateEngagementScore(recipient) {
    let score = 0;

    // Base score for opens
    score += Math.min(recipient.totalOpens || 0, 10) * 5;

    // Higher score for clicks
    score += Math.min(recipient.totalClicks || 0, 10) * 10;

    // Recency bonus
    const daysSinceLastOpen = recipient.lastOpenDate 
      ? Math.floor((Date.now() - recipient.lastOpenDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastOpen < 7) score += 20;
    else if (daysSinceLastOpen < 30) score += 10;

    return Math.min(score, 100);
  }

  getDeviceType(ua) {
    if (ua.device.type === 'mobile') return 'mobile';
    if (ua.device.type === 'tablet') return 'tablet';
    return 'desktop';
  }

  async getTrackingStats(campaignId) {
    try {
      const stats = await EmailTracking.aggregate([
        { $match: { campaign: campaignId } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: 1 },
            totalOpened: { $sum: { $cond: ['$status.opened', 1, 0] } },
            totalClicked: { $sum: { $cond: ['$status.clicked', 1, 0] } },
            totalBounced: { $sum: { $cond: ['$status.bounced', 1, 0] } },
            avgEngagement: { $avg: '$engagementScore' }
          }
        }
      ]);

      return stats[0] || {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        avgEngagement: 0
      };

    } catch (error) {
      logger.error('Get tracking stats error:', error.message);
      return null;
    }
  }
}

module.exports = new TrackingService();