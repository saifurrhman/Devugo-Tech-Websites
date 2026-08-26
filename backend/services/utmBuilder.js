/**
 * Helper to build and append UTM parameters to links in post text
 */

function buildUtmLink(baseUrl, params = {}) {
  if (!baseUrl) return baseUrl;

  try {
    const urlObj = new URL(baseUrl);
    if (params.utm_source) urlObj.searchParams.set('utm_source', params.utm_source);
    if (params.utm_medium) urlObj.searchParams.set('utm_medium', params.utm_medium);
    if (params.utm_campaign) urlObj.searchParams.set('utm_campaign', params.utm_campaign);
    if (params.utm_term) urlObj.searchParams.set('utm_term', params.utm_term);
    if (params.utm_content) urlObj.searchParams.set('utm_content', params.utm_content);
    return urlObj.toString();
  } catch (e) {
    return baseUrl;
  }
}

function processTextUtmLinks(text, platform, utmParams = {}) {
  if (!text) return text;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const source = utmParams.utm_source || platform || 'social';
    const medium = utmParams.utm_medium || 'social';
    const campaign = utmParams.utm_campaign || 'socialsuite';
    
    return buildUtmLink(url, {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_term: utmParams.utm_term || '',
      utm_content: utmParams.utm_content || ''
    });
  });
}

module.exports = {
  buildUtmLink,
  processTextUtmLinks
};
