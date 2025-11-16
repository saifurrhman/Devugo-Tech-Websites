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
  }
};