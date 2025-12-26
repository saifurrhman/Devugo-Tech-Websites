import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Trash2, Edit } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { useNotification } from '../../../contexts/NotificationContext';
import { TemplateAPI } from '../../../lib/api';

export default function TemplatesList() {
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    React.useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await TemplateAPI.list();
            const list = Array.isArray(data) ? data : (data.data || []);
            setTemplates(list);
        } catch (err) {
            console.error('Failed to load templates:', err);
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await TemplateAPI.delete(id);
            setTemplates(prev => prev.filter(t => (t.id || t._id) !== id));
            success('Template deleted successfully');
        } catch (err) {
            console.error('Delete failed', err);
            notifyError('Failed to delete template');
        }
    };

    const filteredTemplates = filter === 'All' ? templates : templates.filter(t => (t.category || 'General') === filter);

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Email Templates</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your email designs and layouts</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/templates/ai-generator')}
                            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-900/20"
                        >
                            <Sparkles size={16} /> AI Generator
                        </button>
                        <button
                            onClick={() => navigate('/admin/templates/create')}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            <Plus size={16} /> Create Template
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'Newsletter', 'Promotional', 'Onboarding', 'Transactional', 'Events'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${filter === cat
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Templates Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-400">Loading templates...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
                        <div className="text-red-400 mb-2 font-medium">{error}</div>
                        <button onClick={loadTemplates} className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors">Retry</button>
                    </div>
                ) : (
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-3">Template Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3 text-right">Last Edited</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredTemplates.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No templates found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTemplates.map((template) => (
                                            <tr key={template.id || template._id} className="hover:bg-gray-800/30 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-gray-700 flex-shrink-0 overflow-hidden border border-gray-600">
                                                        {template.thumbnail ? (
                                                            <img src={template.thumbnail} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">IMG</div>
                                                        )}
                                                    </div>
                                                    {template.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    <span className="px-2 py-1 rounded-full bg-gray-700/50 border border-gray-700 text-xs">
                                                        {template.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400">
                                                    {template.lastModified || template.updatedAt ? new Date(template.lastModified || template.updatedAt).toLocaleDateString() : 'Recently'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 text-gray-400">
                                                        <button
                                                            onClick={() => navigate(`/admin/templates/create?id=${template.id || template._id}`)}
                                                            className="p-1.5 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(template.id || template._id)}
                                                            className="p-1.5 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
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
