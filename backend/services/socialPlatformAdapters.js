const { encrypt, decrypt } = require('../utils/encryption');

const PLATFORM_LIMITS = {
  twitter: {
    name: 'X (Twitter)',
    maxChars: 280,
    maxImages: 4,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: true,
    supportsMentions: true
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 3000,
    maxImages: 9,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: true,
    supportsMentions: true
  },
  facebook: {
    name: 'Facebook',
    maxChars: 63206,
    maxImages: 10,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: true,
    supportsMentions: true
  },
  instagram: {
    name: 'Instagram',
    maxChars: 2200,
    maxImages: 10,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: true,
    supportsMentions: true
  },
  tiktok: {
    name: 'TikTok',
    maxChars: 2200,
    maxImages: 5,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: true,
    supportsMentions: true
  },
  youtube: {
    name: 'YouTube',
    maxChars: 5000,
    maxImages: 0,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: false,
    supportsMentions: true
  },
  pinterest: {
    name: 'Pinterest',
    maxChars: 500,
    maxImages: 5,
    maxVideos: 1,
    supportsVideo: true,
    supportsCarousel: true,
    supportsMentions: false
  }
};

const MOCK_AVATARS = {
  facebook: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&auto=format&fit=crop&q=80',
  instagram: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=150&auto=format&fit=crop&q=80',
  linkedin: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=150&auto=format&fit=crop&q=80',
  twitter: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=150&auto=format&fit=crop&q=80',
  tiktok: 'https://images.unsplash.com/photo-1611605698323-b1e992d37a91?w=150&auto=format&fit=crop&q=80',
  youtube: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=150&auto=format&fit=crop&q=80',
  pinterest: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=150&auto=format&fit=crop&q=80'
};

function getPlatformLimits(platform) {
  return PLATFORM_LIMITS[platform] || { maxChars: 2000, maxImages: 4, maxVideos: 1 };
}

/**
 * Simulate OAuth token exchange & account details creation
 */
async function simulateConnectOAuth(platform, accountName, accountHandle) {
  const limits = getPlatformLimits(platform);
  const rawAccessToken = `acc_tok_${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const rawRefreshToken = `ref_tok_${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const encryptedAccessToken = encrypt(rawAccessToken);
  const encryptedRefreshToken = encrypt(rawRefreshToken);

  const cleanHandle = accountHandle ? (accountHandle.startsWith('@') ? accountHandle : `@${accountHandle}`) : `@${accountName.toLowerCase().replace(/\s+/g, '')}`;
  const accountId = `act_${platform}_${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    platform,
    accountName: accountName || `${limits.name} Account`,
    accountHandle: cleanHandle,
    accountId,
    avatarUrl: MOCK_AVATARS[platform] || '',
    profileUrl: `https://${platform}.com/${cleanHandle.replace('@', '')}`,
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    status: 'connected',
    statusMessage: 'Account connected successfully',
    followersCount: Math.floor(1200 + Math.random() * 45000)
  };
}

/**
 * Refresh expired access token silently
 */
async function refreshAccountToken(account) {
  if (!account.encryptedRefreshToken) {
    account.status = 'needs_reconnect';
    account.statusMessage = 'Refresh token expired or missing. Please reconnect.';
    await account.save();
    return false;
  }

  const decryptedRefresh = decrypt(account.encryptedRefreshToken);
  if (!decryptedRefresh) {
    account.status = 'needs_reconnect';
    account.statusMessage = 'Token decryption failed. Please reconnect.';
    await account.save();
    return false;
  }

  // Issue new token
  const newRawAccessToken = `acc_tok_refreshed_${account.platform}_${Date.now()}`;
  account.encryptedAccessToken = encrypt(newRawAccessToken);
  account.tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  account.status = 'connected';
  account.statusMessage = 'Token silently refreshed';
  account.lastRefreshedAt = new Date();
  await account.save();
  return true;
}

/**
 * Publish post to platform API adapter
 */
async function publishToTarget(account, postText, mediaAssets = []) {
  // Check token status
  if (account.status === 'needs_reconnect' || account.status === 'expired') {
    const refreshed = await refreshAccountToken(account);
    if (!refreshed) {
      const err = new Error('Authentication token expired or invalid');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
  }

  // Decrypt token to simulate security verification
  const accessToken = decrypt(account.encryptedAccessToken);
  if (!accessToken) {
    const err = new Error('Failed to decrypt token');
    err.code = 'TOKEN_EXPIRED';
    throw err;
  }

  // Simulate occasional rate limit / transient errors if requested in simulation
  // 98% success rate in normal flow
  const externalPostId = `ext_post_${account.platform}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const externalUrl = `https://${account.platform}.com/post/${externalPostId}`;

  return {
    success: true,
    externalPostId,
    externalUrl,
    publishedAt: new Date()
  };
}

/**
 * Generate simulated metrics for account & posts
 */
function fetchMetricsForAccount(account) {
  const baseFollowers = account.followersCount || 2500;
  return {
    impressions: Math.floor(baseFollowers * (1.5 + Math.random() * 2.5)),
    reach: Math.floor(baseFollowers * (0.8 + Math.random() * 1.2)),
    engagement: Math.floor(baseFollowers * (0.05 + Math.random() * 0.15)),
    clicks: Math.floor(baseFollowers * (0.02 + Math.random() * 0.08)),
    likes: Math.floor(baseFollowers * (0.04 + Math.random() * 0.1)),
    shares: Math.floor(baseFollowers * (0.01 + Math.random() * 0.03)),
    comments: Math.floor(baseFollowers * (0.005 + Math.random() * 0.02)),
    followersCount: baseFollowers,
    websiteTraffic: Math.floor(baseFollowers * (0.015 + Math.random() * 0.04))
  };
}

module.exports = {
  PLATFORM_LIMITS,
  getPlatformLimits,
  simulateConnectOAuth,
  refreshAccountToken,
  publishToTarget,
  fetchMetricsForAccount
};
