import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { useNotification } from '../../../contexts/NotificationContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { CampaignAPI } from '../../../lib/api';
import LoadingState from '../../components/LoadingState';
import Badge from '../../components/Badge';

export default function CampaignsList() {
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();
    const confirm = useConfirm();
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

    const handleDelete = async (id) => {
        await confirm.show({
            title: 'Delete Campaign',
            message: 'Are you sure you want to delete this campaign?',
            variant: 'danger',
            confirmText: 'Delete',
            action: async () => {
                try {
                    await CampaignAPI.remove(id);
                    setCampaigns(prev => prev.filter(c => (c.id || c._id) !== id));
                    success('Campaign deleted successfully');
                } catch (err) {
                    console.error('Delete failed', err);
                    notifyError('Failed to delete campaign');
                }
            }
        });
    };

    const filteredCampaigns = filter === 'all' ? campaigns : campaigns.filter(c => (c.status || 'Draft').toLowerCase() === filter);

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
                    {['all', 'draft', 'scheduled', 'sending', 'sent'].map(f => (
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

                {/* Totals strip */}
                {!loading && !error && (
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 mb-6 p-4 flex flex-wrap gap-4 items-center">
                        <Badge status="neutral">Total: {campaigns.length}</Badge>
                        <Badge status="scheduled">Scheduled: {campaigns.filter(c => c.status === 'scheduled').length}</Badge>
                        <Badge status="completed">Completed: {campaigns.filter(c => c.status === 'sent').length}</Badge>
                    </div>
                )}

                {/* Content Area */}
                {loading ? (
                    <LoadingState message="Loading campaigns..." />
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
                        <div className="text-red-400 mb-2 font-medium">{error}</div>
                        <button
                            onClick={loadCampaigns}
                            className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    /* Campaign List */
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-3">Campaign Name</th>
                                        <th className="px-6 py-3">Sender</th>
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
                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                                No campaigns found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCampaigns.map((campaign) => (
                                            <tr key={campaign.id || campaign._id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {campaign.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    {campaign.senderEmail || 'info@devugo-tech.com'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge status={campaign.status || 'draft'}>
                                                        {campaign.status || 'Draft'}
                                                    </Badge>
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
                                                <td className="px-6 py-4 text-right text-gray-400">{campaign.date ? new Date(campaign.date).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/campaigns/create?id=${campaign.id || campaign._id}`)}
                                                        className="btn-icon"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(campaign.id || campaign._id)}
                                                        className="btn-icon danger"
                                                        title="Delete"
                                                        style={{ marginLeft: '.5rem' }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
