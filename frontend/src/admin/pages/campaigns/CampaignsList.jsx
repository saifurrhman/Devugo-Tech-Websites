import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { CampaignAPI } from '../../../lib/api';

export default function CampaignsList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const data = await CampaignAPI.list();
            const list = Array.isArray(data) ? data : (data.data || []);
            setCampaigns(list);
        } catch (err) {
            console.error('Failed to load campaigns:', err);
            setError('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = filter === 'all' ? campaigns : campaigns.filter(c => (c.status || 'Draft').toLowerCase() === filter);

    if (loading) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Email Campaigns</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage and track your email marketing campaigns</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/campaigns/create')}
                        className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Create Campaign
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'sent', 'active', 'draft', 'scheduled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-colors capitalize whitespace-nowrap ${filter === f
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Campaign List */}
                <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3">Campaign Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Sent</th>
                                    <th className="px-6 py-3 text-right">Opens %</th>
                                    <th className="px-6 py-3 text-right">Clicks %</th>
                                    <th className="px-6 py-3 text-right">Date</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colspan="7" className="px-6 py-8 text-center text-gray-500">
                                            No campaigns found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id || campaign._id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {campaign.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs border ${campaign.status === 'Sent' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    campaign.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        campaign.status === 'Draft' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {campaign.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-300">
                                                {campaign.stats?.sent || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-300">
                                                {campaign.stats?.sent > 0
                                                    ? Math.round(((campaign.stats?.opened || 0) / campaign.stats.sent) * 100) + '%'
                                                    : '0%'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-300">
                                                {campaign.stats?.sent > 0
                                                    ? Math.round(((campaign.stats?.clicked || 0) / campaign.stats.sent) * 100) + '%'
                                                    : '0%'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-400">{campaign.date || new Date().toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-white mx-2">Edit</button>
                                                <button className="text-gray-400 hover:text-red-400">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
