const EmailTracking = require('../models/EmailTracking');
const EmailRecipient = require('../models/EmailRecipient');
const EmailCampaign = require('../models/EmailCampaign');
const Message = require('../models/Message');

class TrackingController {

  /**
   * Track email open event
   */
  async trackOpen(req, res) {
    try {
      const { trackingId } = req.params;
      const { ip, userAgent } = req.body;

      const tracking = await EmailTracking.findOne({ messageId: trackingId });
      
      if (!tracking) {
        // Return transparent 1x1 pixel
        return this.sendTrackingPixel(res);
      }

      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(userAgent);

      tracking.addEvent({
        type: 'opened',
        timestamp: new Date(),
        ipAddress: ip,
        userAgent: userAgent,
        device: deviceInfo.device,
        os: deviceInfo.os,
        browser: deviceInfo.browser
      });

      await tracking.save();

      // Update recipient stats
      await EmailRecipient.findByIdAndUpdate(tracking.recipient, {
        $inc: { 'stats.emailsOpened': 1 },
        'stats.lastOpened': new Date()
      });

      // Return transparent pixel
      this.sendTrackingPixel(res);

    } catch (error) {
      console.error('Track open error:', error);
      this.sendTrackingPixel(res);
    }
  }

  /**
   * Track email click event
   */
  async trackClick(req, res) {
    try {
      const { trackingId } = req.params;
      const { url, ip, userAgent } = req.body;

      const tracking = await EmailTracking.findOne({ messageId: trackingId });
      
      if (!tracking) {
        return res.redirect(url || '/');
      }

      const deviceInfo = this.parseUserAgent(userAgent);

      tracking.addEvent({
        type: 'clicked',
        timestamp: new Date(),
        ipAddress: ip,
        userAgent: userAgent,
        linkUrl: url,
        device: deviceInfo.device,
        os: deviceInfo.os,
        browser: deviceInfo.browser
      });

      await tracking.save();

      // Update recipient stats
      await EmailRecipient.findByIdAndUpdate(tracking.recipient, {
        $inc: { 'stats.emailsClicked': 1 },
        'stats.lastClicked': new Date()
      });

      // Redirect to actual URL
      res.redirect(url || '/');

    } catch (error) {
      console.error('Track click error:', error);
      res.redirect('/');
    }
  }

  /**
   * Get tracking data for campaign
   */
  async getCampaignTracking(req, res) {
    try {
      const { campaignId } = req.params;
      const { startDate, endDate } = req.query;

      const query = { campaign: campaignId };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const trackingData = await EmailTracking.find(query)
        .populate('recipient', 'email fullName company')
        .sort({ createdAt: -1 });

      // Calculate statistics
      const stats = {
        total: trackingData.length,
        sent: trackingData.filter(t => t.status.sent).length,
        delivered: trackingData.filter(t => t.status.delivered).length,
        opened: trackingData.filter(t => t.status.opened).length,
        clicked: trackingData.filter(t => t.status.clicked).length,
        replied: trackingData.filter(t => t.status.replied).length,
        bounced: trackingData.filter(t => t.status.bounced).length,
        totalOpens: trackingData.reduce((sum, t) => sum + t.openCount, 0),
        totalClicks: trackingData.reduce((sum, t) => sum + t.clickCount, 0)
      };

      // Calculate rates
      if (stats.delivered > 0) {
        stats.openRate = ((stats.opened / stats.delivered) * 100).toFixed(2);
        stats.clickRate = ((stats.clicked / stats.delivered) * 100).toFixed(2);
      }

      if (stats.opened > 0) {
        stats.clickToOpenRate = ((stats.clicked / stats.opened) * 100).toFixed(2);
      }

      res.json({
        success: true,
        data: {
          stats,
          tracking: trackingData
        }
      });

    } catch (error) {
      console.error('Get campaign tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tracking data',
        error: error.message
      });
    }
  }

  /**
   * Get tracking data for recipient
   */
  async getRecipientTracking(req, res) {
    try {
      const { recipientId } = req.params;

      const trackingData = await EmailTracking.find({ recipient: recipientId })
        .populate('campaign', 'name')
        .sort({ createdAt: -1 });

      const stats = {
        totalEmails: trackingData.length,
        opened: trackingData.filter(t => t.status.opened).length,
        clicked: trackingData.filter(t => t.status.clicked).length,
        replied: trackingData.filter(t => t.status.replied).length,
        avgEngagementScore: trackingData.reduce((sum, t) => sum + t.engagementScore, 0) / trackingData.length || 0
      };

      res.json({
        success: true,
        data: {
          stats,
          tracking: trackingData
        }
      });

    } catch (error) {
      console.error('Get recipient tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tracking data',
        error: error.message
      });
    }
  }

  /**
   * Get tracking analytics
   */
  async getTrackingAnalytics(req, res) {
    try {
      const { campaignId, startDate, endDate, groupBy = 'day' } = req.query;

      const matchQuery = {};
      if (campaignId) matchQuery.campaign = campaignId;
      if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
      }

      // Group by time period
      const dateFormat = groupBy === 'hour' ? '%Y-%m-%d-%H' : 
                        groupBy === 'week' ? '%Y-%U' :
                        groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

      const analytics = await EmailTracking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            sent: { $sum: { $cond: ['$status.sent', 1, 0] } },
            delivered: { $sum: { $cond: ['$status.delivered', 1, 0] } },
            opened: { $sum: { $cond: ['$status.opened', 1, 0] } },
            clicked: { $sum: { $cond: ['$status.clicked', 1, 0] } },
            replied: { $sum: { $cond: ['$status.replied', 1, 0] } },
            bounced: { $sum: { $cond: ['$status.bounced', 1, 0] } },
            totalOpens: { $sum: '$openCount' },
            totalClicks: { $sum: '$clickCount' },
            avgEngagement: { $avg: '$engagementScore' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics',
        error: error.message
      });
    }
  }

  /**
   * Helper: Send tracking pixel
   */
  sendTrackingPixel(res) {
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', pixel.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(pixel);
  }

  /**
   * Helper: Parse user agent
   */
  parseUserAgent(userAgent) {
    if (!userAgent) {
      return { device: 'unknown', os: 'unknown', browser: 'unknown' };
    }

    const ua = userAgent.toLowerCase();
    
    // Device detection
    let device = 'desktop';
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
      device = /ipad|tablet/.test(ua) ? 'tablet' : 'mobile';
    }

    // OS detection
    let os = 'unknown';
    if (/windows/.test(ua)) os = 'Windows';
    else if (/mac os|macos/.test(ua)) os = 'macOS';
    else if (/linux/.test(ua)) os = 'Linux';
    else if (/android/.test(ua)) os = 'Android';
    else if (/ios|iphone|ipad/.test(ua)) os = 'iOS';

    // Browser detection
    let browser = 'unknown';
    if (/chrome/.test(ua) && !/edge/.test(ua)) browser = 'Chrome';
    else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'Safari';
    else if (/firefox/.test(ua)) browser = 'Firefox';
    else if (/edge/.test(ua)) browser = 'Edge';

    return { device, os, browser };
  }
}

module.exports = new TrackingController();