import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI } from '../../lib/api';

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
                setData(result);
            } catch (err) {
                console.error("Failed to fetch email analytics", err);
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
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">Retry</button>
                </div>
            </main>
        </div>
    );

    const stats = data.stats || { delivered: 0, spam: 0, unsubscribed: 0, complaints: 0 };
    const domainPerformance = data.domainPerformance || [];

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
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>

                {/* Health Score */}
                <div className="card bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 p-6 rounded-xl mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-blue-100">Sender Health Score</h2>
                        <p className="text-blue-300/80 text-sm mt-1">Your sending reputation is excellent.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-blue-400">98<span className="text-xl text-blue-500/60">/100</span></div>
                        <div className="h-12 w-12 rounded-full border-4 border-blue-500 flex items-center justify-center bg-blue-500/20">
                            <span className="text-xl">A+</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Delivery Rate</div>
                        <div className="text-2xl font-bold text-green-400">{stats.delivered}%</div>
                        <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${stats.delivered}%` }}></div>
                        </div>
                    </div>
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Spam Rate</div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.spam}%</div>
                        <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full" style={{ width: `${stats.spam * 10}%` }}></div>
                        </div>
                    </div>
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Unsubscribe Rate</div>
                        <div className="text-2xl font-bold text-orange-400">{stats.unsubscribed}%</div>
                        <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: `${stats.unsubscribed * 10}%` }}></div>
                        </div>
                    </div>
                    <div className="card p-4 bg-[#1e293b] rounded-xl border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Complaint Rate</div>
                        <div className="text-2xl font-bold text-red-400">{stats.complaints}%</div>
                        <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${stats.complaints * 10}%` }}></div>
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

                    {/* Bounce Analysis */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                        <h3 className="font-semibold mb-4">Bounce Analysis</h3>
                        <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                            [Pie Chart Placeholder: Hard vs Soft Bounces]
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                                <div className="text-red-400 font-bold text-lg">12</div>
                                <div className="text-xs text-gray-400">Hard Bounces</div>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                                <div className="text-yellow-400 font-bold text-lg">45</div>
                                <div className="text-xs text-gray-400">Soft Bounces</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
