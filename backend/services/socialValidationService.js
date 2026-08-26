const { getPlatformLimits } = require('./socialPlatformAdapters');

function validateSocialPost({ globalText, platformOverrides = {}, selectedAccounts = [], mediaAssets = [], scheduledAt }) {
  const errors = [];
  const warnings = [];

  // Check accounts
  if (!selectedAccounts || selectedAccounts.length === 0) {
    errors.push('At least one target social account must be selected.');
  }

  // Check schedule date
  if (scheduledAt) {
    const schedDate = new Date(scheduledAt);
    if (isNaN(schedDate.getTime())) {
      errors.push('Invalid schedule date format.');
    } else if (schedDate.getTime() < Date.now() - 30000) { // allow 30s buffer
      errors.push('Scheduled date and time must be in the future.');
    }
  }

  // Check global text or overrides
  if (!globalText || globalText.trim().length === 0) {
    errors.push('Global post message cannot be empty.');
  }

  // Validate per selected account's platform rules
  const accountsByPlatform = {};
  selectedAccounts.forEach(act => {
    const plat = act.platform || (typeof act === 'string' ? '' : act);
    if (plat) {
      if (!accountsByPlatform[plat]) accountsByPlatform[plat] = [];
      accountsByPlatform[plat].push(act);
    }
  });

  Object.keys(accountsByPlatform).forEach(platform => {
    const limits = getPlatformLimits(platform);
    const override = platformOverrides[platform];
    const postText = (override && override.text) ? override.text : globalText;

    if (!postText || postText.trim().length === 0) {
      errors.push(`${limits.name}: Content cannot be empty.`);
    } else if (postText.length > limits.maxChars) {
      errors.push(`${limits.name}: Content exceeds maximum limit of ${limits.maxChars} characters by ${postText.length - limits.maxChars} characters.`);
    }

    // Media validation
    const images = mediaAssets.filter(m => m.mediaType === 'image' || (m.mimetype && m.mimetype.startsWith('image/')));
    const videos = mediaAssets.filter(m => m.mediaType === 'video' || (m.mimetype && m.mimetype.startsWith('video/')));

    if (images.length > limits.maxImages) {
      errors.push(`${limits.name}: Maximum ${limits.maxImages} images allowed (${images.length} provided).`);
    }

    if (videos.length > limits.maxVideos) {
      errors.push(`${limits.name}: Maximum ${limits.maxVideos} video allowed (${videos.length} provided).`);
    }

    if (images.length > 0 && videos.length > 0) {
      warnings.push(`${limits.name}: Mixed media (images + video) may be auto-converted or restricted on some platforms.`);
    }

    // Special platform requirements
    if (platform === 'youtube' && videos.length === 0) {
      errors.push('YouTube: A video file attachment is required to create a YouTube post.');
    }

    if (platform === 'pinterest' && images.length === 0 && videos.length === 0) {
      errors.push('Pinterest: An image or video asset is required for Pinterest pins.');
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  validateSocialPost
};
