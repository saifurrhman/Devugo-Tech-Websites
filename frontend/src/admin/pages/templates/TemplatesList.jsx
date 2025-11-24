import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { TemplateAPI } from '../../../lib/api';

export default function TemplatesList() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        <h1 className="text-2xl font-bold">Email Templates</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your email designs and layouts</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/templates/ai-generator')}
                            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <span>✨</span> AI Generator
                        </button>
                        <button
                            onClick={() => navigate('/admin/templates/create')}
                            className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Create Template
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'Newsletter', 'Promotional', 'Onboarding', 'Transactional', 'Events'].map(cat => (
                        <button
                            key={cat}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${cat === 'All'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No templates found.
                        </div>
                    ) : (
                        templates.map((template) => (
                            <div key={template.id || template._id} className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden group hover:border-blue-500/50 transition-all">
                                <div className="relative aspect-video bg-gray-800 overflow-hidden">
                                    <img src={template.thumbnail || 'https://via.placeholder.com/300x200?text=Template'} alt={template.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="px-3 py-1.5 bg-white text-gray-900 rounded text-sm font-medium hover:bg-gray-100">Edit</button>
                                        <button className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-600">Preview</button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold truncate pr-2">{template.name}</h3>
                                        <button className="text-gray-500 hover:text-white">⋮</button>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>{template.category || 'General'}</span>
                                        <span>{template.lastModified || 'Recently'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Create New Card */}
                    <button
                        onClick={() => navigate('/admin/templates/create')}
                        className="card bg-[#1e293b]/50 rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-[#1e293b] transition-all flex flex-col items-center justify-center min-h-[200px] gap-3 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">+</div>
                        <span className="font-medium text-gray-400 group-hover:text-white">Create New Template</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
