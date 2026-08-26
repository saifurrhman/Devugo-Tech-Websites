const SocialAccount = require('../models/SocialAccount');
const SocialPost = require('../models/SocialPost');
const SocialMediaAsset = require('../models/SocialMediaAsset');
const SocialAnalytics = require('../models/SocialAnalytics');
const SocialAuditLog = require('../models/SocialAuditLog');

const { simulateConnectOAuth, refreshAccountToken, publishToTarget, fetchMetricsForAccount } = require('../services/socialPlatformAdapters');
const { validateSocialPost } = require('../services/socialValidationService');
const { processTextUtmLinks } = require('../services/utmBuilder');

// ==========================================
// 1. ACCOUNT CONNECTION & HEALTH MANAGEMENT
// ==========================================

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find().sort({ createdAt: -1 });
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.connectAccount = async (req, res) => {
  try {
    const { platform, accountName, accountHandle } = req.body;
    if (!platform) {
      return res.status(400).json({ success: false, message: 'Platform is required' });
    }

    const accountData = await simulateConnectOAuth(platform, accountName, accountHandle);
    accountData.createdBy = req.user?._id;

    // Support multiple accounts per platform by checking matching accountId or accountHandle
    let account = await SocialAccount.findOne({ platform, accountHandle: accountData.accountHandle });
    if (account) {
      Object.assign(account, accountData);
      await account.save();
    } else {
      account = await SocialAccount.create(accountData);
    }

    await SocialAuditLog.create({
      user: req.user?._id,
      action: 'CONNECT_ACCOUNT',
      platform,
      targetAccount: account._id,
      details: `Connected account ${account.accountName} (${account.accountHandle})`,
      status: 'SUCCESS'
    });

    res.status(201).json({ success: true, message: 'Account connected successfully', account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.disconnectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await SocialAccount.findById(id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await SocialAccount.findByIdAndDelete(id);

    await SocialAuditLog.create({
      user: req.user?._id,
      action: 'DISCONNECT_ACCOUNT',
      platform: account.platform,
      targetAccount: account._id,
      details: `Disconnected account ${account.accountName}`,
      status: 'SUCCESS'
    });

    res.json({ success: true, message: 'Account disconnected successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await SocialAccount.findById(id);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const success = await refreshAccountToken(account);

    await SocialAuditLog.create({
      user: req.user?._id,
      action: 'REFRESH_TOKEN',
      platform: account.platform,
      targetAccount: account._id,
      details: success ? 'Token refreshed successfully' : 'Token refresh failed - reconnect required',
      status: success ? 'SUCCESS' : 'WARNING'
    });

    res.json({ success, account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 2. POST COMPOSER, VALIDATION & POST MANAGEMENT
// ==========================================

exports.validatePost = async (req, res) => {
  try {
    const validation = validateSocialPost(req.body);
    res.json(validation);
  } catch (err) {
    res.status(400).json({ isValid: false, errors: [err.message] });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { status, campaign, tag, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (campaign) filter.campaign = campaign;
    if (tag) filter.tags = tag;
    if (search) {
      filter.globalText = { $regex: search, $options: 'i' };
    }

    const posts = await SocialPost.find(filter)
      .populate('selectedAccounts mediaAssets author')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id)
      .populate('selectedAccounts mediaAssets targetResults.account author');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { globalText, platformOverrides, mediaAssets, selectedAccounts, scheduledAt, action, campaign, tags, utmParams } = req.body;

    // Fetch account objects for validation
    const accounts = await SocialAccount.find({ _id: { $in: selectedAccounts || [] } });
    const media = await SocialMediaAsset.find({ _id: { $in: mediaAssets || [] } });

    // Validate server side
    const validation = validateSocialPost({
      globalText,
      platformOverrides,
      selectedAccounts: accounts,
      mediaAssets: media,
      scheduledAt: action === 'schedule' ? scheduledAt : null
    });

    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    let postStatus = 'draft';
    if (action === 'schedule') {
      postStatus = 'scheduled';
    }

    const post = await SocialPost.create({
      globalText,
      platformOverrides,
      mediaAssets,
      selectedAccounts,
      scheduledAt: action === 'schedule' ? scheduledAt : null,
      status: postStatus,
      campaign: campaign || '',
      tags: tags || [],
      utmParams: utmParams || {},
      author: req.user?._id,
      idempotencyKey: `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    });

    // Immediate publish if action === 'publish_now'
    if (action === 'publish_now') {
      post.status = 'publishing';
      await post.save();

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const account of accounts) {
        try {
          const override = platformOverrides ? platformOverrides[account.platform] : null;
          const baseText = (override && override.text) ? override.text : globalText;
          const finalText = utmParams && utmParams.autoAppend !== false
            ? processTextUtmLinks(baseText, account.platform, utmParams)
            : baseText;

          const resPub = await publishToTarget(account, finalText, media);
          results.push({
            account: account._id,
            platform: account.platform,
            status: 'success',
            externalPostId: resPub.externalPostId,
            externalUrl: resPub.externalUrl,
            publishedAt: resPub.publishedAt
          });
          successCount++;
        } catch (err) {
          results.push({
            account: account._id,
            platform: account.platform,
            status: 'failed',
            errorCode: err.code || 'PUBLISH_FAILED',
            errorMessage: err.message || 'Publishing error'
          });
          failCount++;
        }
      }

      post.targetResults = results;
      post.publishedAt = new Date();
      post.status = failCount === 0 ? 'published' : (successCount > 0 ? 'partial_failure' : 'failed');
      await post.save();
    }

    await SocialAuditLog.create({
      user: req.user?._id,
      action: action === 'publish_now' ? 'PUBLISH_POST' : (action === 'schedule' ? 'SCHEDULE_POST' : 'UPDATE_POST'),
      targetPost: post._id,
      details: `Created post (${post.status}) for ${accounts.length} accounts`,
      status: 'SUCCESS'
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await SocialPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.status === 'published') {
      return res.status(400).json({ success: false, message: 'Published posts cannot be edited' });
    }

    Object.assign(post, req.body);
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await SocialPost.findByIdAndDelete(id);

    await SocialAuditLog.create({
      user: req.user?._id,
      action: 'DELETE_POST',
      details: `Deleted social post ${id}`,
      status: 'SUCCESS'
    });

    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.retrySingleTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetAccountId } = req.body;

    const post = await SocialPost.findById(id).populate('selectedAccounts mediaAssets');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const account = post.selectedAccounts.find(a => a._id.toString() === targetAccountId);
    if (!account) return res.status(404).json({ success: false, message: 'Target account not found on this post' });

    const override = post.platformOverrides ? post.platformOverrides[account.platform] : null;
    const baseText = (override && override.text) ? override.text : post.globalText;
    const finalText = post.utmParams && post.utmParams.autoAppend !== false
      ? processTextUtmLinks(baseText, account.platform, post.utmParams)
      : baseText;

    const resPub = await publishToTarget(account, finalText, post.mediaAssets);

    // Update target result item
    const targetIdx = post.targetResults.findIndex(r => r.account.toString() === targetAccountId);
    if (targetIdx !== -1) {
      post.targetResults[targetIdx] = {
        account: account._id,
        platform: account.platform,
        status: 'success',
        externalPostId: resPub.externalPostId,
        externalUrl: resPub.externalUrl,
        publishedAt: resPub.publishedAt,
        retriesCount: (post.targetResults[targetIdx].retriesCount || 0) + 1
      };
    } else {
      post.targetResults.push({
        account: account._id,
        platform: account.platform,
        status: 'success',
        externalPostId: resPub.externalPostId,
        externalUrl: resPub.externalUrl,
        publishedAt: resPub.publishedAt,
        retriesCount: 1
      });
    }

    const allSuccess = post.targetResults.every(r => r.status === 'success');
    post.status = allSuccess ? 'published' : 'partial_failure';
    await post.save();

    await SocialAuditLog.create({
      user: req.user?._id,
      action: 'RETRY_POST',
      targetPost: post._id,
      targetAccount: account._id,
      details: `Retried target ${account.accountName} (${account.platform}) - SUCCESS`,
      status: 'SUCCESS'
    });

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 3. MEDIA LIBRARY & SCANNING
// ==========================================

exports.getMediaLibrary = async (req, res) => {
  try {
    const assets = await SocialMediaAsset.find().sort({ createdAt: -1 });
    res.json({ success: true, assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const url = `/uploads/${req.file.filename}`;

    const asset = await SocialMediaAsset.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      url,
      mimetype: req.file.mimetype,
      mediaType: isVideo ? 'video' : 'image',
      sizeBytes: req.file.size,
      width: isVideo ? 1920 : 1080,
      height: isVideo ? 1080 : 1080,
      durationSeconds: isVideo ? 30 : 0,
      scanStatus: 'passed',
      uploadedBy: req.user?._id
    });

    res.status(201).json({ success: true, asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 4. CROSS-PLATFORM ANALYTICS & ATTRIBUTION
// ==========================================

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const accounts = await SocialAccount.find();
    let totalImpressions = 0;
    let totalReach = 0;
    let totalEngagement = 0;
    let totalClicks = 0;
    let totalFollowers = 0;
    let totalWebsiteTraffic = 0;

    const platformBreakdown = {};

    accounts.forEach(acc => {
      const m = fetchMetricsForAccount(acc);
      totalImpressions += m.impressions;
      totalReach += m.reach;
      totalEngagement += m.engagement;
      totalClicks += m.clicks;
      totalFollowers += m.followersCount;
      totalWebsiteTraffic += m.websiteTraffic;

      if (!platformBreakdown[acc.platform]) {
        platformBreakdown[acc.platform] = { impressions: 0, engagement: 0, clicks: 0, accountsCount: 0 };
      }
      platformBreakdown[acc.platform].impressions += m.impressions;
      platformBreakdown[acc.platform].engagement += m.engagement;
      platformBreakdown[acc.platform].clicks += m.clicks;
      platformBreakdown[acc.platform].accountsCount += 1;
    });

    const postsCount = await SocialPost.countDocuments({ status: { $in: ['published', 'partial_failure'] } });

    res.json({
      success: true,
      totals: {
        postsPublished: postsCount,
        impressions: totalImpressions,
        reach: totalReach,
        engagement: totalEngagement,
        clicks: totalClicks,
        followersCount: totalFollowers,
        websiteTraffic: totalWebsiteTraffic
      },
      platformBreakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await SocialAuditLog.find()
      .populate('user targetAccount targetPost')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
