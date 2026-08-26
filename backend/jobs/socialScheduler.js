const SocialPost = require('../models/SocialPost');
const SocialAccount = require('../models/SocialAccount');
const SocialAuditLog = require('../models/SocialAuditLog');
const Notification = require('../models/Notification');
const { publishToTarget } = require('../services/socialPlatformAdapters');
const { processTextUtmLinks } = require('../services/utmBuilder');

let isProcessing = false;

async function processScheduledPosts() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const now = new Date();
    // Find scheduled posts whose scheduled time has arrived
    const duePosts = await SocialPost.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).populate('selectedAccounts mediaAssets');

    if (duePosts.length === 0) {
      isProcessing = false;
      return;
    }

    console.log(`🚀 [SocialScheduler] Found ${duePosts.length} posts due for publishing...`);

    for (const post of duePosts) {
      // Atomic lock
      post.status = 'publishing';
      await post.save();

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const account of post.selectedAccounts) {
        try {
          const override = post.platformOverrides ? post.platformOverrides[account.platform] : null;
          const baseText = (override && override.text) ? override.text : post.globalText;
          
          // Apply UTM link building if enabled
          const finalPostText = post.utmParams && post.utmParams.autoAppend !== false
            ? processTextUtmLinks(baseText, account.platform, post.utmParams)
            : baseText;

          const res = await publishToTarget(account, finalPostText, post.mediaAssets);

          results.push({
            account: account._id,
            platform: account.platform,
            status: 'success',
            externalPostId: res.externalPostId,
            externalUrl: res.externalUrl,
            publishedAt: res.publishedAt
          });
          successCount++;
        } catch (err) {
          console.error(`❌ Publish failed for ${account.accountName} (${account.platform}):`, err.message);
          results.push({
            account: account._id,
            platform: account.platform,
            status: 'failed',
            errorCode: err.code || 'PUBLISH_ERROR',
            errorMessage: err.message || 'Publish execution failed'
          });
          failCount++;
        }
      }

      post.targetResults = results;
      post.publishedAt = new Date();

      if (failCount === 0) {
        post.status = 'published';
      } else if (successCount > 0) {
        post.status = 'partial_failure';
      } else {
        post.status = 'failed';
      }

      await post.save();

      // Log audit
      await SocialAuditLog.create({
        user: post.author,
        action: 'PUBLISH_POST',
        targetPost: post._id,
        details: `Published to ${successCount}/${post.selectedAccounts.length} targets. Status: ${post.status}`,
        status: post.status === 'published' ? 'SUCCESS' : (post.status === 'partial_failure' ? 'WARNING' : 'FAILURE')
      });

      // Create notification
      try {
        await Notification.create({
          user: post.author,
          title: `Social Post Published: ${post.status.replace('_', ' ').toUpperCase()}`,
          message: `Post "${post.globalText.substring(0, 40)}..." processed with ${successCount} successful and ${failCount} failed targets.`,
          type: post.status === 'published' ? 'info' : 'warning',
          link: `/admin/social`
        });
      } catch (_e) {}
    }
  } catch (err) {
    console.error('❌ [SocialScheduler] Error running social scheduler job:', err);
  } finally {
    isProcessing = false;
  }
}

// Start polling every 30 seconds
if (process.env.NODE_ENV !== 'test') {
  setInterval(processScheduledPosts, 30000);
  console.log('⏰ [SocialScheduler] Background job initialized (polling every 30s)');
}

module.exports = {
  processScheduledPosts
};
