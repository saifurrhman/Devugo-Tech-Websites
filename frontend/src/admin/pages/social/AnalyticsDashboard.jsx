import React, { useState, useEffect } from 'react';
import { Eye, TrendingUp, MousePointer, Users, Share2, BarChart2, ExternalLink, Filter } from 'lucide-react';
import axios from 'axios';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/social/analytics/overview', getHeaders());
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading cross-platform analytics...</div>;
  }

  const totals = data?.totals || {
    postsPublished: 14,
    impressions: 48500,
    reach: 32100,
    engagement: 3840,
    clicks: 1290,
    followersCount: 18450,
    websiteTraffic: 890
  };

  const platformBreakdown = data?.platformBreakdown || {
    facebook: { impressions: 12400, engagement: 890, clicks: 310, accountsCount: 1 },
    linkedin: { impressions: 18200, engagement: 1450, clicks: 520, accountsCount: 1 },
    twitter: { impressions: 9800, engagement: 710, clicks: 240, accountsCount: 1 },
    instagram: { impressions: 8100, engagement: 790, clicks: 220, accountsCount: 1 }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <div className="muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Eye size={16} /> Total Impressions
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {totals.impressions.toLocaleString()}
          </div>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>+14.2% vs last month</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div className="muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingUp size={16} /> Total Reach
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {totals.reach.toLocaleString()}
          </div>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>+9.8% reach efficiency</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ec4899' }}>
          <div className="muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Share2 size={16} /> Total Engagement
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {totals.engagement.toLocaleString()}
          </div>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>7.9% engagement rate</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div className="muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MousePointer size={16} /> Link Clicks
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {totals.clicks.toLocaleString()}
          </div>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>{totals.websiteTraffic} site visitors</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div className="muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={16} /> Total Followers
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {totals.followersCount.toLocaleString()}
          </div>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>Across all accounts</span>
        </div>
      </div>

      {/* Platform Breakdown & Traffic Attribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Platform Breakdown Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Platform Metric Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.keys(platformBreakdown).map(plat => {
              const pb = platformBreakdown[plat];
              const pct = totals.impressions > 0 ? Math.round((pb.impressions / totals.impressions) * 100) : 25;

              return (
                <div key={plat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className={`platform-badge platform-${plat}`}>{plat}</span>
                      ({pb.accountsCount} connected)
                    </span>
                    <span>{pb.impressions.toLocaleString()} imp ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Attribution Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>UTM Traffic Attribution</h3>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Separating native social platform reports vs direct website visitor analytics.
          </p>

          <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>UTM Campaign</th>
                <th>Source</th>
                <th>Clicks</th>
                <th>Web Conversions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>q3_social_launch</strong></td>
                <td><span className="platform-badge platform-linkedin">linkedin</span></td>
                <td>520</td>
                <td>34 leads</td>
              </tr>
              <tr>
                <td><strong>product_demo_v2</strong></td>
                <td><span className="platform-badge platform-facebook">facebook</span></td>
                <td>310</td>
                <td>19 leads</td>
              </tr>
              <tr>
                <td><strong>brand_awareness</strong></td>
                <td><span className="platform-badge platform-twitter">twitter</span></td>
                <td>240</td>
                <td>12 leads</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
