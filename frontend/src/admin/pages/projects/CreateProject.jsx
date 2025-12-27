import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { ProjectAPI, ContactAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';

export default function CreateProject() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        client: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        budget: '',
        priority: 'medium',
        status: 'planning',
        description: '',
        techStack: ''
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await ContactAPI.list();
            setClients(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error('Failed to load clients:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.client) {
            warning('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                budget: parseFloat(formData.budget) || 0,
                techStack: formData.techStack.split(',').map(t => t.trim()).filter(t => t)
            };

            await ProjectAPI.create(payload);
            success('Project created successfully');
            navigate('/admin/projects');
        } catch (err) {
            console.error('Failed to create project:', err);
            error('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">New Project</h1>
                    <p className="text-gray-400 text-sm mt-1">Initialize a new project workflow</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Website Redesign"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Client *</label>
                                        <select
                                            required
                                            value={formData.client}
                                            onChange={e => setFormData({ ...formData, client: e.target.value })}
                                            className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                        >
                                            <option value="" className="bg-[#002747] text-white">Select Client</option>
                                            {clients.map(client => (
                                                <option key={client._id} value={client._id} className="bg-[#002747] text-white py-2">
                                                    {client.firstName} {client.lastName} ({client.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Budget ($)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.budget}
                                            onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Tech Stack (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="React, Node.js, MongoDB..."
                                        value={formData.techStack}
                                        onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Project details and requirements..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/projects')}
                                        className="px-6 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4 text-white">Project Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    >
                                        <option value="low" className="bg-[#002747] text-white py-2">Low</option>
                                        <option value="medium" className="bg-[#002747] text-white py-2">Medium</option>
                                        <option value="high" className="bg-[#002747] text-white py-2">High</option>
                                        <option value="urgent" className="bg-[#002747] text-white py-2">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Initial Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    >
                                        <option value="planning" className="bg-[#002747] text-white py-2">Planning</option>
                                        <option value="in_progress" className="bg-[#002747] text-white py-2">In Progress</option>
                                        <option value="on_hold" className="bg-[#002747] text-white py-2">On Hold</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
