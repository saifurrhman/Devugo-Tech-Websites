import React, { useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { AnalyticsAPI } from '../../../lib/api';



export default function EmailAnalytics() {
    const [timeRange, setTimeRange] = useState('7d');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await AnalyticsAPI.getEmailStats(timeRange);

                // Ensure stats object exists even if API returns partial
                if (!result.stats) result.stats = {};
                if (!result.recentActivity) result.recentActivity = [];
                if (!result.domainPerformance) result.domainPerformance = [];

                setData(result);
            } catch (err) {
                console.error("API failed", err);
                setError("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeRange]);

    if (loading) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error || !data) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="text-red-400 text-xl">Failed to load analytics data</div>
                    <button onClick={() => setTimeRange(prev => prev === '7d' ? '7d ' : '7d')} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">Retry</button>
                    <p className="text-gray-500 text-sm">Please ensure the backend is running and the API is accessible.</p>
                </div>
            </main>
        </div>
    );

    const stats = data.stats || { sent: 0, delivered: 0, openRate: 0, clickRate: 0, unsubscribed: 0, spam: 0, complaints: 0 };
    // Ensure all numeric properties exist to prevent crashes
    stats.sent = stats.sent || 0;
    stats.delivered = stats.delivered || 0;
    stats.openRate = stats.openRate || 0;
    stats.clickRate = stats.clickRate || 0;
    stats.unsubscribed = stats.unsubscribed || 0;
    stats.spam = stats.spam || 0;
    const domainPerformance = data.domainPerformance || [];
    const recentActivity = data.recentActivity || [];
    const dailyStats = data.dailyStats || [];
    const maxVal = Math.max(...dailyStats.map(d => Math.max(d.opens, d.clicks)), 1); // Avoid 0 division

    // Calculate Real Health Score
    let healthScore = 100;
    // Penalize for delivery failures (bounces)
    const bounceRate = 100 - (stats.delivered || 100);
    healthScore -= bounceRate * 5;
    // Penalize for spam reports (high impact)
    healthScore -= (stats.spam || 0) * 20;
    // Penalize for unsubscribes (medium impact)
    healthScore -= (stats.unsubscribed || 0) * 5;

    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    let healthGrade = 'A+';
    let healthColor = 'text-blue-400';
    let healthText = "Your sending reputation is excellent.";

    if (healthScore < 97) { healthGrade = 'A'; }
    if (healthScore < 90) { healthGrade = 'B'; healthColor = 'text-green-400'; healthText = "Your sending reputation is good."; }
    if (healthScore < 80) { healthGrade = 'C'; healthColor = 'text-yellow-400'; healthText = "Your sending reputation needs attention."; }
    if (healthScore < 60) { healthGrade = 'D'; healthColor = 'text-orange-400'; healthText = "Your sending reputation is poor."; }
    if (healthScore < 40) { healthGrade = 'F'; healthColor = 'text-red-400'; healthText = "Critical: Your sender reputation is damaged."; }

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Email Deliverability</h1>
                        <p className="text-gray-400 text-sm mt-1">Monitor your email sending reputation and health</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="24h" className="bg-[#0f172a]">Last 24 Hours</option>
                        <option value="7d" className="bg-[#0f172a]">Last 7 Days</option>
                        <option value="30d" className="bg-[#0f172a]">Last 30 Days</option>
                    </select>
                </div>

                {/* Health Score */}
                <div className="card bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 p-6 rounded-xl mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-blue-100">Sender Health Score</h2>
                        <p className="text-blue-300/80 text-sm mt-1">{healthText}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${healthColor}`}>{healthScore}<span className="text-xl text-blue-500/60">/100</span></div>
                        <div className="h-12 w-12 rounded-full border-4 border-blue-500 flex items-center justify-center bg-blue-500/20">
                            <span className="text-xl">{healthGrade}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards (Updated per requirements) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Total Sent</div>
                        <div className="text-2xl font-bold text-white">{stats.sent.toLocaleString()}</div>
                        <div className="text-xs text-green-400 mt-1 flex items-center">
                            <span>Delivery: {stats.delivered}%</span>
                        </div>
                    </div>
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Open Rate</div>
                        <div className="text-2xl font-bold text-blue-400">{stats.openRate}%</div>
                        <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(stats.openRate, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Click Rate</div>
                        <div className="text-2xl font-bold text-green-400">{stats.clickRate}%</div>
                        <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${Math.min(stats.clickRate, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Unsubscribes</div>
                        <div className="text-2xl font-bold text-orange-400">{stats.unsubscribed}%</div>
                        <div className="text-xs text-gray-500 mt-1">Spam: {stats.spam}%</div>
                    </div>
                </div>

                {/* Engagement Over Time Chart (Dynamic) */}
                <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 mb-6">
                    <h3 className="font-semibold mb-4">Engagement Over Time (Opens vs Clicks)</h3>
                    <div className="h-64 relative w-full pr-4">
                        {dailyStats.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                No activity data for this period
                            </div>
                        ) : (
                            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${dailyStats.length * 100} 300`} preserveAspectRatio="none">
                                {/* Grid Lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line key={i} x1="0" y1={i * 75} x2="100%" y2={i * 75} stroke="#334155" strokeDasharray="4" strokeWidth="1" opacity="0.5" />
                                ))}

                                {/* Paths */}
                                <path
                                    d={`M ${dailyStats.map((d, i) => `${i * 100 + 50},${300 - (d.opens / maxVal) * 300}`).join(' L ')}`}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d={`M ${dailyStats.map((d, i) => `${i * 100 + 50},${300 - (d.clicks / maxVal) * 300}`).join(' L ')}`}
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Data Points (for tooltips) */}
                                {dailyStats.map((d, i) => {
                                    const x = i * 100 + 50;
                                    const yOpen = 300 - (d.opens / maxVal) * 300;
                                    const yClick = 300 - (d.clicks / maxVal) * 300;
                                    return (
                                        <g key={i} className="group">
                                            {/* Open Point */}
                                            <circle cx={x} cy={yOpen} r="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" className="hover:r-8 transition-all" />
                                            <foreignObject x={x - 60} y={yOpen - 50} width="120" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-gray-900 border border-gray-700 text-xs rounded p-1 text-center shadow-xl">
                                                    <div className="text-gray-400 mb-0.5">{d.date}</div>
                                                    <span className="text-blue-400 font-bold">Opens: {d.opens}</span>
                                                </div>
                                            </foreignObject>

                                            {/* Click Point */}
                                            <circle cx={x} cy={yClick} r="6" fill="#1e293b" stroke="#22c55e" strokeWidth="3" className="hover:r-8 transition-all" />
                                            <foreignObject x={x - 60} y={yClick + 15} width="120" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-gray-900 border border-gray-700 text-xs rounded p-1 text-center shadow-xl">
                                                    <span className="text-green-400 font-bold">Clicks: {d.clicks}</span>
                                                </div>
                                            </foreignObject>
                                        </g>
                                    )
                                })}
                            </svg>
                        )}
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-gray-400">Opens</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-gray-400">Clicks</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Domain Performance */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                        <h3 className="font-semibold mb-4">Performance by Domain</h3>
                        <div className="space-y-4">
                            {domainPerformance.map((item) => (
                                <div key={item.domain} className="flex items-center gap-4">
                                    <div className="w-24 text-sm text-gray-400">{item.domain}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Open Rate</span>
                                            <span>{item.openRate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full" style={{ width: `${item.openRate}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 w-16 text-right">{item.sent} sent</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                        <h3 className="font-semibold mb-4">Recent Activity</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-400 border-b border-gray-700 font-medium">
                                    <tr>
                                        <th className="pb-3 text-left">Contact</th>
                                        <th className="pb-3 text-center">Opened</th>
                                        <th className="pb-3 text-center">Clicked</th>
                                        <th className="pb-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {recentActivity.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No recent activity found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentActivity.map((row, i) => (
                                            <tr key={i} className="group hover:bg-gray-800/50 transition-colors">
                                                <td className="py-3 text-white font-medium">{row.email}</td>
                                                <td className="py-3 text-center">
                                                    {row.opened ? <span className="text-green-400">Yes</span> : <span className="text-gray-600">No</span>}
                                                </td>
                                                <td className="py-3 text-center">
                                                    {row.clicked ? <span className="text-blue-400">Yes</span> : <span className="text-gray-600">No</span>}
                                                </td>
                                                <td className="py-3 text-right text-gray-400">{new Date(row.date).toLocaleDateString()} {new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
