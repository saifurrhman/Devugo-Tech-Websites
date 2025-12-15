// Analytics controller
const BlogPost = require('../models/BlogPost');
const Contact = require('../models/Contact');
const Service = require('../models/Service');
const PricingPlan = require('../models/PricingPlan');
const Portfolio = require('../models/Portfolio');
const TeamMember = require('../models/TeamMember');
const { getAnalyticsSummary, getRealtimeData } = require('../services/analyticsService');

exports.capture = async (req, res) => res.status(202).json({ received: true });

exports.metrics = async (req, res) => res.json({ traffic: [], attribution: [] });

// Dashboard summary: totals and recent activities with REAL Google Analytics data
exports.summary = async (_req, res) => {
  try {
    // Fetch database counts
    const [
      totalBlogs,
      totalLeads,
      lastBlog,
      lastLead,
      totalServices,
      totalPricing,
      totalPortfolio,
      totalTeam,
      lastPortfolio
    ] = await Promise.all([
      BlogPost.countDocuments({}),
      Contact.countDocuments({}),
      BlogPost.findOne({}).sort({ publishedAt: -1, createdAt: -1 }),
      Contact.findOne({}).sort({ createdAt: -1 }),
      Service.countDocuments({}),
      PricingPlan.countDocuments({}),
      Portfolio.countDocuments({}),
      TeamMember.countDocuments({}),
      Portfolio.findOne({}).sort({ updatedAt: -1, createdAt: -1 })
    ]);

    // Fetch REAL Google Analytics data
    let gaData;
    try {
      gaData = await getAnalyticsSummary(7);
    } catch (error) {
      console.warn('⚠️ Google Analytics fetch failed, using fallback data');
      gaData = {
        totals: { visitors: 0, pageviews: 0 },
        last7: { visitors: [0, 0, 0, 0, 0, 0, 0] },
        labels: [],
      };
    }

    // Placeholders for emails and social posts
    const totalEmailsSent = 0;
    const totalSocialPosts = 0;
    const lastEmailCampaign = null;
    const lastSocialPost = null;

    // Use REAL visitors and pageviews from Google Analytics
    const visitors = gaData.totals.visitors;
    const pageviews = gaData.totals.pageviews;
    const conversions = Math.max(0, Math.round(totalLeads * 0.3));

    // Mock contacts data for last 7 days (can be improved with real DB queries)
    const last7 = {
      visitors: gaData.last7.visitors,
      contacts: [2, 1, 3, 4, 5, 6, 7], // Placeholder - improve this with real DB data
    };

    res.json({
      totals: {
        visitors, // REAL from Google Analytics
        pageviews, // REAL from Google Analytics
        contacts: totalLeads,
        conversions,
        blogs: totalBlogs,
        leads: totalLeads,
        services: totalServices,
        pricing: totalPricing,
        portfolio: totalPortfolio,
        team: totalTeam,
        emailsSent: totalEmailsSent,
        socialPosts: totalSocialPosts,
      },
      last7,
      labels: gaData.labels, // Date labels from GA
      recent: {
        blog: lastBlog ? {
          id: lastBlog._id,
          title: lastBlog.title,
          published: !!lastBlog.published,
          publishedAt: lastBlog.publishedAt || lastBlog.createdAt,
        } : null,
        lead: lastLead ? {
          id: lastLead._id,
          name: lastLead.name,
          email: lastLead.email,
          createdAt: lastLead.createdAt,
        } : null,
        portfolio: lastPortfolio ? {
          id: lastPortfolio._id,
          title: lastPortfolio.title,
          updatedAt: lastPortfolio.updatedAt,
        } : null,
        email: lastEmailCampaign,
        social: lastSocialPost,
      }
    });
  } catch (err) {
    console.error('❌ Summary Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// NEW: Summary with custom range
exports.summaryRange = async (req, res) => {
  try {
    const { range, from, to } = req.query;
    let days = 7;

    if (range) {
      days = parseInt(range);
    }

    // Fetch Google Analytics data
    const gaData = await getAnalyticsSummary(days);

    // Fetch database counts
    const [totalBlogs, totalLeads] = await Promise.all([
      BlogPost.countDocuments({}),
      Contact.countDocuments({}),
    ]);

    res.json({
      totals: {
        visitors: gaData.totals.visitors,
        pageviews: gaData.totals.pageviews,
        contacts: totalLeads,
        conversions: Math.round(totalLeads * 0.3),
        blogs: totalBlogs,
        leads: totalLeads,
      },
      last7: gaData.last7,
      series: gaData.series || gaData.last7,
      labels: gaData.labels,
    });
  } catch (error) {
    console.error('❌ Summary Range Error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
};

// NEW: Real-time analytics
exports.realtime = async (req, res) => {
  try {
    const data = await getRealtimeData();
    res.json(data);
  } catch (error) {
    console.error('❌ Realtime Error:', error);
    res.status(500).json({
      error: 'Failed to fetch realtime data',
      details: error.message
    });
  });
}
};

// NEW: Email Analytics
exports.getEmailStats = async (req, res) => {
  try {
    const { timeRange } = req.query;
    // Calculate date filter based on timeRange (24h, 7d, 30d)
    let startDate = new Date();
    if (timeRange === '24h') startDate.setDate(startDate.getDate() - 1);
    else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);
    else startDate.setDate(startDate.getDate() - 7); // Default 7d

    const EmailCampaign = require('../models/EmailCampaign');
    const EmailLog = require('../models/EmailLog');

    // 1. Aggregate Campaign Stats
    const campaigns = await EmailCampaign.find({
      createdAt: { $gte: startDate }
    });

    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalUnsubscribed = 0;
    let totalComplaints = 0;

    campaigns.forEach(c => {
      const s = c.stats || {};
      totalSent += s.sent || 0;
      totalDelivered += s.delivered || 0;
      totalOpened += s.opened || 0;
      totalClicked += s.clicked || 0;
      totalUnsubscribed += s.unsubscribed || (s.bounced ? s.bounced * 0.1 : 0); // Approx if not tracked
      totalComplaints += s.complaints || 0;
    });

    // 2. Recent Activity from Logs
    const recentActivity = await EmailLog.find({
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('recipient', 'email name')
      .lean();

    // Map logs to frontend table format
    const formattedActivity = recentActivity.map(log => ({
      email: log.recipientEmail || (log.recipient ? log.recipient.email : 'Unknown'),
      opened: log.openedAt ? true : false,
      clicked: log.clickedAt ? true : false,
      date: log.createdAt,
      status: log.status
    }));

    // 3. Domain Performance (Simple Aggregation from Logs)
    const logs = await EmailLog.find({ createdAt: { $gte: startDate } }).select('recipientEmail status');
    const domainStats = {};
    logs.forEach(log => {
      if (!log.recipientEmail) return;
      const domain = log.recipientEmail.split('@')[1];
      if (!domain) return;

      if (!domainStats[domain]) domainStats[domain] = { sent: 0, opened: 0 };
      domainStats[domain].sent++;
      if (log.status === 'opened' || log.status === 'clicked') domainStats[domain].opened++;
    });

    const domainPerformance = Object.keys(domainStats)
      .map(d => ({
        domain: d,
        sent: domainStats[d].sent,
        openRate: Math.round((domainStats[d].opened / domainStats[d].sent) * 100) || 0
      }))
      .sort((a, b) => b.sent - a.sent)
      .slice(0, 5);

    // Calculate Global Rates
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : 0;
    const unsRate = totalSent > 0 ? ((totalUnsubscribed / totalSent) * 100).toFixed(2) : 0;
    const spamRate = totalSent > 0 ? ((totalComplaints / totalSent) * 100).toFixed(2) : 0;
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;

    res.json({
      stats: {
        sent: totalSent,
        delivered: Number(deliveryRate), // Keep as number for progress bars if needed, or string
        openRate: Number(openRate),
        clickRate: Number(clickRate),
        unsubscribed: Number(unsRate),
        spam: Number(spamRate),
        complaints: totalComplaints
      },
      domainPerformance,
      recentActivity: formattedActivity
    });

  } catch (error) {
    console.error('Email Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch email analytics' });
  }
};