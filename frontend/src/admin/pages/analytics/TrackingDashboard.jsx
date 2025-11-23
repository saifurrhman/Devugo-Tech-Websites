import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI } from '../../lib/api';

export default function TrackingDashboard() {
    const [liveEvents, setLiveEvents] = React.useState([]);
    const [topLocations, setTopLocations] = React.useState([]);
    const [activeUsers, setActiveUsers] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await AnalyticsAPI.getTrackingStats();
                setLiveEvents(result.liveEvents || []);
                setTopLocations(result.topLocations || []);
                setActiveUsers(result.activeUsers || 0);
            } catch (err) {
                console.error("Failed to fetch tracking stats", err);
                setError("Failed to load tracking data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Optional: Set up polling for live updates
        const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="text-red-400 text-xl">Failed to load tracking data</div>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">Retry</button>
                </div>
            </main>
        </div>
    );

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        Live Tracking
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time feed of user interactions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Feed */}
                    <div className="lg:col-span-2">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-800 bg-gray-800/30 flex justify-between items-center">
                                <h3 className="font-semibold">Activity Feed</h3>
                                <button className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-colors">Pause Feed</button>
                            </div>
                            <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                                {liveEvents.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">No recent activity</div>
                                ) : (
                                    liveEvents.map((event) => (
                                        <div key={event.id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-start gap-4">
                                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${event.event === 'Email Opened' ? 'bg-blue-500' :
                                                event.event === 'Link Clicked' ? 'bg-green-500' :
                                                    'bg-red-500'
                                                }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-medium text-sm text-gray-200">{event.user}</p>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">{event.time}</span>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-0.5">
                                                    {event.event} in <span className="text-gray-300">{event.campaign}</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <span>🌍 {event.location}</span>
                                                    <span>•</span>
                                                    <span>Desktop (Chrome)</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 text-center border-t border-gray-800">
                                <button className="text-sm text-gray-400 hover:text-white transition-colors">Load More History</button>
                            </div>
                        </div>
                    </div>

                    {/* Map / Stats */}
                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                            <h3 className="font-semibold mb-4">Top Locations (24h)</h3>
                            <div className="space-y-3">
                                {topLocations.map((loc) => (
                                    <div key={loc.country}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{loc.country}</span>
                                            <span className="text-gray-400">{loc.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full" style={{ width: `${loc.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                            <h3 className="font-semibold mb-2">Active Users Now</h3>
                            <div className="text-4xl font-bold text-white">{activeUsers}</div>
                            <p className="text-sm text-gray-400 mt-1">Viewing your emails or landing pages</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
