const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

// Google Analytics Configuration
const propertyId = '546640964'; 
const keyFilePath = path.join(__dirname, '../config/google-analytics-key.json');

// Initialize Analytics Client
let analyticsDataClient;
try {
  analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: keyFilePath,
  });
  console.log('✅ Google Analytics API initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Google Analytics API:', error.message);
}

/**
 * Get Analytics Summary Data
 */
async function getAnalyticsSummary(days = 7) {
  if (!analyticsDataClient) {
    throw new Error('Analytics client not initialized');
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: `${days}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
      ],
    });

    // Process the data
    const visitors = [];
    const pageviews = [];
    const labels = [];

    if (response.rows) {
      response.rows.forEach(row => {
        const date = row.dimensionValues[0].value;
        const users = parseInt(row.metricValues[0].value || 0);
        const views = parseInt(row.metricValues[1].value || 0);
        
        visitors.push(users);
        pageviews.push(views);
        
        // Format date: 20250116 -> Jan 16
        const dateObj = new Date(
          date.slice(0, 4), 
          date.slice(4, 6) - 1, 
          date.slice(6, 8)
        );
        labels.push(dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }));
      });
    }

    // Calculate totals
    const totalVisitors = visitors.reduce((a, b) => a + b, 0);
    const totalPageviews = pageviews.reduce((a, b) => a + b, 0);

    console.log(`📊 Analytics fetched: ${totalVisitors} visitors, ${totalPageviews} pageviews`);

    return {
      totals: {
        visitors: totalVisitors,
        pageviews: totalPageviews,
        contacts: 0,
        conversions: 0,
        blogs: 0,
        leads: 0,
        emailsSent: 0,
        socialPosts: 0,
      },
      last7: {
        visitors: visitors,
        contacts: [], // Will be populated from database
      },
      series: {
        visitors: visitors,
        contacts: [],
      },
      labels: labels,
    };
  } catch (error) {
    console.error('❌ Analytics API Error:', error.message);
    
    // Return fallback data if API fails
    return {
      totals: {
        visitors: 0,
        pageviews: 0,
        contacts: 0,
        conversions: 0,
        blogs: 0,
        leads: 0,
        emailsSent: 0,
        socialPosts: 0,
      },
      last7: {
        visitors: [0, 0, 0, 0, 0, 0, 0],
        contacts: [0, 0, 0, 0, 0, 0, 0],
      },
      series: {
        visitors: [0, 0, 0, 0, 0, 0, 0],
        contacts: [0, 0, 0, 0, 0, 0, 0],
      },
      labels: [],
      error: error.message,
    };
  }
}

/**
 * Get Real-time Analytics Data
 */
async function getRealtimeData() {
  if (!analyticsDataClient) {
    return { activeUsers: 0, timestamp: new Date().toISOString() };
  }

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }],
    });

    let activeUsers = 0;
    if (response.rows && response.rows.length > 0) {
      activeUsers = parseInt(response.rows[0].metricValues[0].value || 0);
    }

    console.log(`👥 Active users: ${activeUsers}`);

    return {
      activeUsers: activeUsers,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Realtime Analytics Error:', error.message);
    return { activeUsers: 0, timestamp: new Date().toISOString() };
  }
}

/**
 * Capture analytics event (legacy function - kept for compatibility)
 */
async function capture(event) {
  console.log('📌 Captured analytics event:', event);
  // Can be extended to send custom events to GA4
}

/**
 * Get metrics (legacy function - kept for compatibility)
 */
async function getMetrics() {
  try {
    const data = await getAnalyticsSummary(7);
    return {
      visitors: data.totals.visitors,
      sources: [], // Can be extended
    };
  } catch (error) {
    return { visitors: 0, sources: [] };
  }
}

module.exports = {
  getAnalyticsSummary,
  getRealtimeData,
  capture, // Legacy function
  getMetrics, // Legacy function
};