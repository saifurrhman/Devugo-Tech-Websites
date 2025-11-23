import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PipelineAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [deal, setDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadDeal();
    }, [id]);

    async function loadDeal() {
        try {
            setLoading(true);
            const data = await PipelineAPI.getDeal(id);
            setDeal(data);
            setFetchError(null);
        } catch (err) {
            console.error('Failed to load deal:', err);
            setFetchError('Failed to load deal details');
            error('Failed to load deal details');
            // Fallback mock data for demo
            setDeal({
                _id: id,
                title: 'Acme Corp Deal',
                value: 5000,
                stage: 'New Lead',
                contact: {
                    name: 'John Doe',
                    email: 'john@acme.com',
                    phone: '+1 555 000 0000',
                    company: 'Acme Corp',
                    role: 'CEO'
                },
                expectedCloseDate: '2024-12-31',
                probability: 20,
                activity: [
                    { type: 'note', content: 'Deal Created', date: '2 days ago', user: 'John Doe' },
                    { type: 'call', content: 'Introductory call with Sarah', date: '1 day ago', user: 'John Doe' }
                ]
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate(updates) {
        try {
            setSaving(true);
            const updatedDeal = await PipelineAPI.updateDeal(id, updates);
            setDeal(prev => ({ ...prev, ...updatedDeal }));
            success('Deal updated successfully!');
        } catch (err) {
            console.error('Failed to update deal:', err);
            error('Failed to update deal');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Are you sure you want to delete this deal?')) return;

        try {
            setSaving(true);
            await PipelineAPI.deleteDeal(id);
            success('Deal deleted successfully');
            navigate('/admin/pipeline');
        } catch (err) {
            console.error('Failed to delete deal:', err);
            error('Failed to delete deal');
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading deal details...</div>;
    if (!deal) return <div className="p-8 text-center text-white">Deal not found</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <button onClick={() => navigate('/admin/pipeline')} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Pipeline</button>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold">{deal.title}</h1>
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">{deal.stage}</span>
                            </div>
                            <div className="text-3xl font-bold text-green-400">${deal.value?.toLocaleString()}</div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                            >
                                Delete
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm">Edit Deal</button>
                            <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium">Mark Won</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Notes & Activity */}
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <div className="flex gap-4 border-b border-gray-700 mb-4">
                                <button className="pb-2 text-blue-400 border-b-2 border-blue-500 font-medium">Activity</button>
                                <button className="pb-2 text-gray-400 hover:text-white">Notes</button>
                                <button className="pb-2 text-gray-400 hover:text-white">Emails</button>
                                <button className="pb-2 text-gray-400 hover:text-white">Files</button>
                            </div>

                            <div className="space-y-6">
                                {deal.activity?.map((act, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className={`w-8 h-8 rounded-full ${act.type === 'call' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center flex-shrink-0 text-sm`}>
                                            {act.type === 'call' ? '📞' : '📝'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{act.content}</div>
                                            <div className="text-xs text-gray-500">{act.user || 'System'}</div>
                                            <div className="text-xs text-gray-600 mt-1">{act.date}</div>
                                        </div>
                                    </div>
                                ))}
                                {(!deal.activity || deal.activity.length === 0) && (
                                    <div className="text-gray-500 text-sm text-center py-4">No recent activity</div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-800">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Add a note..." className="flex-1 bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">Add</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Contact Person</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                                    {deal.contact?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="font-medium">{deal.contact?.name || 'Unknown Contact'}</div>
                                    <div className="text-xs text-gray-400">{deal.contact?.role || 'No Role'} at {deal.contact?.company || 'No Company'}</div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Email</span>
                                    <span className="text-blue-400">{deal.contact?.email || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone</span>
                                    <span className="text-gray-300">{deal.contact?.phone || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deal Info */}
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Deal Info</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Expected Close Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded px-2 py-1.5 text-gray-300"
                                        value={deal.expectedCloseDate || ''}
                                        onChange={(e) => handleUpdate({ expectedCloseDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Probability</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            className="flex-1 accent-blue-500"
                                            value={deal.probability || 0}
                                            onChange={(e) => setDeal(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                                            onMouseUp={(e) => handleUpdate({ probability: parseInt(e.target.value) })}
                                        />
                                        <span className="text-gray-300 w-8 text-right">{deal.probability}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
