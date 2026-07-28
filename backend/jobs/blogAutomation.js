const cron = require('node-cron');
const Setting = require('../models/Setting');
const BlogPost = require('../models/BlogPost');
const BlogCategory = require('../models/BlogCategory');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

class BlogAutomationJob {
  constructor() {
    this.schedule = '* * * * *'; // Run every minute
    this.enabled = process.env.ENABLE_JOBS !== 'false';
  }

  start() {
    if (!this.enabled) {
      logger.info('Blog Automation job is disabled');
      return;
    }

    cron.schedule(this.schedule, async () => {
      try {
        await this.processAutomation();
      } catch (error) {
        logger.error('Error in Blog Automation job:', error);
      }
    });

    logger.info('✅ Blog Automation job initialized');
  }

  async processAutomation() {
    const setting = await Setting.findOne({ key: 'blogAutomation' });
    if (!setting || !setting.value || !setting.value.isAutomationEnabled) {
      return; // Automation not enabled
    }

    const config = setting.value;
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    // Check if current time is in the publishTimes array
    if (!config.publishTimes || !config.publishTimes.includes(currentTime)) {
      return; 
    }

    // Check if we already ran for this specific time today
    const lastRunKey = `lastRun_${currentTime}`;
    const lastRunDateStr = config[lastRunKey];
    const todayStr = now.toISOString().split('T')[0];
    
    if (lastRunDateStr === todayStr) {
      return; // Already ran for this time today
    }

    // Check if we already reached postsPerDay limit today
    let runCountToday = 0;
    if (config.publishTimes) {
      config.publishTimes.forEach(time => {
        if (config[`lastRun_${time}`] === todayStr) runCountToday++;
      });
    }
    const postsPerDay = config.postsPerDay || 1;
    if (runCountToday >= postsPerDay) {
      return; // Reached max posts per day limit
    }

    logger.info(`🤖 Triggering Blog Automation for time: ${currentTime}`);

    try {
      // Pick a random topic if topics exist
      let selectedTopic = '';
      if (config.topics && config.topics.length > 0) {
        const topicArray = config.topics.split(',').map(t => t.trim()).filter(Boolean);
        if (topicArray.length > 0) {
          selectedTopic = topicArray[Math.floor(Math.random() * topicArray.length)];
        }
      }

      // Generate Blog
      const aiResponse = await aiService.generateBlog({
        topic: selectedTopic || 'Write a relevant tech or industry blog post',
        keywords: selectedTopic,
        tone: 'Professional',
        agentId: config.selectedAgentId || null
      });

      if (!aiResponse) {
        throw new Error('AI Service returned empty response');
      }

      // Parse and save blog post
      let parsedResult = aiResponse;
      if (typeof aiResponse === 'string') {
        try { parsedResult = JSON.parse(aiResponse); } 
        catch (e) { parsedResult = { title: selectedTopic || 'Auto Generated Blog', content: aiResponse }; }
      }
      
      const {
        title = parsedResult.subject || 'Auto Generated Blog',
        content = parsedResult.body || '',
        excerpt = '',
        tags = [],
        category = '',
        coverImage = null,
        galleryImages = [],
        seo = {}
      } = parsedResult;

      if (!title || !content) {
        throw new Error('Blog generation failed: title and content are required');
      }

      // Generate slug
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existingSlug = await BlogPost.findOne({ slug });
      if (existingSlug) slug = `${slug}-${Date.now()}`;

      // Dynamic Category Resolution
      let categoryId = null;
      if (category && typeof category === 'string') {
        const catName = category.trim();
        const existingCat = await BlogCategory.findOne({
          name: { $regex: `^${catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });
        
        if (existingCat) {
          categoryId = existingCat._id;
        } else {
          const catSlug = catName.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
          const newCat = await BlogCategory.create({ name: catName, slug: catSlug });
          categoryId = newCat._id;
        }
      }

      const newPost = new BlogPost({
        title,
        slug,
        excerpt: excerpt || content.substring(0, 150) + '...',
        content,
        tags: Array.isArray(tags) ? tags : [],
        categories: categoryId ? [categoryId] : [],
        coverImage: coverImage && typeof coverImage === 'string' && !coverImage.includes('oaidalleapi') ? coverImage : null,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        seo: {
          metaTitle: seo.metaTitle || title.substring(0, 60),
          metaDescription: seo.metaDescription || content.substring(0, 150),
          metaKeywords: Array.isArray(tags) ? tags : []
        },
        published: !config.saveAsDraft,
        publishedAt: config.saveAsDraft ? null : new Date(),
        source: 'auto'
      });

      await newPost.save();
      logger.info(`✅ Auto-generated blog post saved: ${title}`);

      // Update last run time in settings
      config[lastRunKey] = todayStr;
      await Setting.findOneAndUpdate(
        { key: 'blogAutomation' },
        { $set: { value: config, updatedAt: Date.now() } }
      );

    } catch (error) {
      logger.error('❌ Blog Automation execution failed:', error);
    }
  }
}

const blogAutomationJob = new BlogAutomationJob();

if (process.env.NODE_ENV !== 'test') {
  blogAutomationJob.start();
}

module.exports = blogAutomationJob;
