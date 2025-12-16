import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI } from '../../lib/api';

// Mock data for development if API fails
const MOCK_CAMPAIGN_DATA = {
  summary: {
    totalSent: 15420,
    openRate: 42.5,
    clickRate: 12.8,
    bounceRate: 1.2
  },
  recentCampaigns: [
    { id: 1, name: 'Summer Sale 2024', status: 'Sent', sent: 5000, opens: 2500, clicks: 800, date: '2024-06-15' },
    { id: 2, name: 'Welcome Series', status: 'Active', sent: 1200, opens: 800, clicks: 300, date: '2024-06-18' },
    { id: 3, name: 'Product Launch', status: 'Draft', sent: 0, opens: 0, clicks: 0, date: '2024-06-20' },
  ],
  performanceOverTime: [
    { date: '2024-06-01', opens: 120, clicks: 40 },
    { date: '2024-06-02', opens: 150, clicks: 50 },
    { date: '2024-06-03', opens: 180, clicks: 60 },
    { date: '2024-06-04', opens: 200, clicks: 80 },
    { date: '2024-06-05', opens: 170, clicks: 55 },
    { date: '2024-06-06', opens: 220, clicks: 90 },
    { date: '2024-06-07', opens: 250, clicks: 100 },
  ]
};

function StatCard({ label, value, sub, trend }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      {trend && (
        <div className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-2`}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

export default function CampaignAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await AnalyticsAPI.getCampaignStats(timeRange);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch campaign analytics", error);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center py-20 h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    );

    if (error || !data) return (
      <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
        <div className="text-red-400 text-xl">Failed to load analytics data</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">Retry</button>
      </div>
    );

    return (
      <>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Emails Sent"
            value={(data.stats?.totalSent || 0).toLocaleString()}
            trend={5.2}
          />
          <StatCard
            label="Open Rate"
            value={`${data.stats?.openRate || 0}%`}
            trend={2.1}
          />
          <StatCard
            label="Click Rate"
            value={`${data.stats?.clickRate || 0}%`}
            trend={-0.5}
          />
          <StatCard
            label="Bounce/Unsub Rate"
            value={`${data.stats?.bounceRate || 0}%`}
            trend={-0.1}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card p-5 lg:col-span-2 bg-[#1e293b] rounded-xl border border-gray-800">
            <h3 className="font-semibold mb-4">Engagement Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {(data.performanceOverTime || []).map((day, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-1 group relative">
                  <div
                    className="bg-blue-500/80 hover:bg-blue-500 rounded-t w-full transition-all"
                    style={{ height: `${(day.opens / 300) * 100}%` }}
                  ></div>
                  <div
                    className="bg-green-500/80 hover:bg-green-500 rounded-t w-full transition-all absolute bottom-0"
                    style={{ height: `${(day.clicks / 300) * 100}%` }}
                  ></div>
                  <div className="text-[10px] text-gray-500 text-center mt-1 truncate">
                    {new Date(day.date).getDate()}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-xs p-2 rounded border border-gray-700 z-10 whitespace-nowrap">
                    <div>Opens: {day.opens}</div>
                    <div>Clicks: {day.clicks}</div>
                    <div className="text-gray-400">{day.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Opens</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Clicks</div>
            </div>
          </div>

          <div className="card p-5 bg-[#1e293b] rounded-xl border border-gray-800">
            <h3 className="font-semibold mb-4">Device Breakdown</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Desktop', val: 65, color: 'bg-indigo-500' },
                { label: 'Mobile', val: 30, color: 'bg-pink-500' },
                { label: 'Tablet', val: 5, color: 'bg-teal-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Campaigns Table */}
        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold">Recent Campaigns</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3">Campaign Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Sent</th>
                  <th className="px-6 py-3 text-right">Opens</th>
                  <th className="px-6 py-3 text-right">Clicks</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.recentCampaigns || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No recent campaigns found</td>
                  </tr>
                ) : (
                  (data.recentCampaigns || []).map((campaign) => (
                    <tr key={campaign.id || campaign._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium">{campaign.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${campaign.status === 'Sent' ? 'bg-green-500/20 text-green-400' :
                          campaign.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">{(campaign.sent || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{(campaign.opens || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{(campaign.clicks || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-gray-400">{campaign.date}</td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
      <AdminSidebar />
      <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
        <AdminTopbar />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Campaign Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Track the performance of your email campaigns</p>
          </div>

          <div className="flex bg-[#1e293b] rounded-lg p-1">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
