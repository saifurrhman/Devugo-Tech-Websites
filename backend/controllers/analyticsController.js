// Analytics controller
const BlogPost = require('../models/BlogPost');
const Contact = require('../models/Contact');
const Service = require('../models/Service');
const PricingPlan = require('../models/PricingPlan');
const Portfolio = require('../models/Portfolio');
const TeamMember = require('../models/TeamMember');

exports.capture = async (req, res) => res.status(202).json({ received: true });
exports.metrics = async (req, res) => res.json({ traffic: [], attribution: [] });

// Dashboard summary: totals and recent activities
exports.summary = async (_req, res) => {
  try {
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

    // Placeholders for emails and social posts until those modules exist
    const totalEmailsSent = 0;
    const totalSocialPosts = 0;
    const lastEmailCampaign = null;
    const lastSocialPost = null;

    // Backward-compatible placeholders for existing dashboard charts
    const visitors = 12000; // placeholder aggregate
    const pageviews = 32000; // placeholder aggregate
    const conversions = Math.max(0, Math.round(totalLeads * 0.3));
    const last7 = {
      visitors: [210, 260, 230, 280, 300, 340, 390],
      contacts: [2, 1, 3, 4, 5, 6, 7],
    };

    res.json({
      totals: {
        visitors,
        pageviews,
        contacts: totalLeads,
        conversions,
        // New metrics
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
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
