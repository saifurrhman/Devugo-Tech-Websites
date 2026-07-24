const BlogPost = require('../models/BlogPost');
const EmailService = require('../services/emailService');
const EmailList = require('../models/EmailList');
const EmailRecipient = require('../models/EmailRecipient');

exports.list = async (req, res) => {
  try {
    const isAdminAll = (req.query.all === '1' || req.query.all === 'true') && (req.user || req.isAdmin); // basic check
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '9', 10), 1), 50);
    const categorySlug = req.query.category;

    const filter = isAdminAll ? {} : { published: true };
    if (categorySlug) {
      // filter posts by category slug
      const BlogCategory = require('../models/BlogCategory');
      const cat = await BlogCategory.findOne({ slug: categorySlug });
      if (cat) filter.categories = cat._id; else filter.categories = null; // no results if missing
    }

    const total = await BlogPost.countDocuments(filter);
    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('categories');
    res.json({ posts, page, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug } = req.query;
    const post = slug
      ? await BlogPost.findOne({ slug }).populate('categories')
      : await BlogPost.findById(id).populate('categories');
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, featuredImage, galleryImages, featured, tags, published, seo } = req.body || {};
    const slug = (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const post = await BlogPost.create({
      title,
      excerpt,
      content,
      coverImage,
      featuredImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      featured: !!featured,
      tags,
      seo: seo ? {
        metaTitle: seo.metaTitle || '',
        metaDescription: seo.metaDescription || '',
        metaKeywords: Array.isArray(seo.metaKeywords) ? seo.metaKeywords : (seo.metaKeywords ? String(seo.metaKeywords).split(',').map(s => s.trim()).filter(Boolean) : []),
      } : undefined,
      published: !!published,
      slug,
      publishedAt: published ? new Date() : undefined,
    });

    // Send Newsletter if published
    if (!!published) {
      try {
        const newsletterList = await EmailList.findOne({ name: 'Newsletter' }).populate('recipients');
        if (newsletterList && newsletterList.recipients && newsletterList.recipients.length > 0) {
          // We have subscribers
          const recipients = newsletterList.recipients; // Array of EmailRecipient documents

          // Construct Email Content
          const emailSubject = `New Blog Post: ${title}`;
          const emailHtml = `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h1>${title}</h1>
               ${featuredImage ? `<img src="${featuredImage}" style="max-width: 100%; border-radius: 8px;" />` : ''}
               <p style="font-size: 16px; color: #555;">${excerpt || 'Check out our latest update!'}</p>
               <div style="margin: 20px 0;">
                 <a href="${process.env.FRONTEND_URL || 'https://devugo.tech'}/blog/${post.slug}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Read Full Post</a>
               </div>
               <hr />
               <small style="color: #999;">You are receiving this because you subscribed to our newsletter.</small>
             </div>
           `;

          // Use EmailService to send bulk or campaign (using sendBulkEmails for simplicity as it iterates)
          // ideally we should create a 'Campaign' object to track it, but direct sending is a good start.

          // Extract emails
          const emailsToSend = recipients.map(r => ({
            to: r.email,
            subject: emailSubject,
            html: emailHtml,
            text: `New Blog Post: ${title}\n\n${excerpt}\n\nRead more: ${process.env.FRONTEND_URL || 'https://devugo.tech'}/blog/${post.slug}`
          }));

          // Fire and forget - don't hold up the API response
          EmailService.sendBulkEmails(emailsToSend).then(results => {
            console.log(`Newsletter sent for "${title}": ${results.length} recipients processed.`);
          }).catch(err => console.error('Newsletter sending failed:', err));

        }
      } catch (emailErr) {
        console.error('Failed to initiate newsletter:', emailErr);
      }
    }

    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    if (typeof payload.title === 'string') {
      payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    }
    if (payload.published && !payload.publishedAt) payload.publishedAt = new Date();
    if (payload.seo) {
      payload.seo = {
        metaTitle: payload.seo.metaTitle || '',
        metaDescription: payload.seo.metaDescription || '',
        metaKeywords: Array.isArray(payload.seo.metaKeywords) ? payload.seo.metaKeywords : (payload.seo.metaKeywords ? String(payload.seo.metaKeywords).split(',').map(s => s.trim()).filter(Boolean) : []),
      };
    }
    if (payload.galleryImages && !Array.isArray(payload.galleryImages)) {
      payload.galleryImages = [];
    }
    const post = await BlogPost.findByIdAndUpdate(id, payload, { new: true });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await BlogPost.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getAutomationStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, weekCount, monthCount, allTimeCount] = await Promise.all([
      BlogPost.countDocuments({ source: 'auto', createdAt: { $gte: startOfToday } }),
      BlogPost.countDocuments({ source: 'auto', createdAt: { $gte: startOfWeek } }),
      BlogPost.countDocuments({ source: 'auto', createdAt: { $gte: startOfMonth } }),
      BlogPost.countDocuments({ source: 'auto' })
    ]);

    // Aggregate last 7 days chart data
    const last7DaysData = await BlogPost.aggregate([
      { 
        $match: { 
          source: 'auto', 
          createdAt: { $gte: startOfWeek } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format chart data to ensure all 7 days are present
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = last7DaysData.find(x => x._id === dateStr);
      chartData.push({
        date: dateStr,
        count: match ? match.count : 0
      });
    }

    res.json({
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      allTime: allTimeCount,
      last7Days: chartData
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
