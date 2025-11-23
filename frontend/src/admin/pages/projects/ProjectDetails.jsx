import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import TaskBoard from './TaskBoard';
import { ProjectAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        loadProject();
    }, [id]);

    async function loadProject() {
        try {
            setLoading(true);
            const data = await ProjectAPI.get(id);
            setProject(data);
            setFetchError(null);
        } catch (err) {
            console.error('Failed to load project:', err);
            setFetchError('Failed to load project details');
            error('Failed to load project details');
            // Fallback mock data
            setProject({
                _id: id,
                name: 'Website Redesign',
                client: 'Acme Corp',
                status: 'active',
                dueDate: '2024-07-15',
                description: 'Redesigning the corporate website for better conversion.'
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await ProjectAPI.delete(id);
            success('Project deleted successfully');
            navigate('/admin/projects');
        } catch (err) {
            console.error('Failed to delete project:', err);
            error('Failed to delete project');
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading project details...</div>;
    if (!project) return <div className="p-8 text-center text-white">Project not found</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <button onClick={() => navigate('/admin/projects')} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Projects</button>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                {project.name}
                                <span className={`px-2 py-1 rounded-full text-xs border ${project.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    project.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                    } font-normal capitalize`}>{project.status}</span>
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Client: {project.client} • Due: {project.dueDate}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                            >
                                Delete
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm">Edit Project</button>
                            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium">+ Add Task</button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-800 mb-6">
                    <button className="pb-3 text-blue-400 border-b-2 border-blue-500 font-medium text-sm">Tasks</button>
                    <button className="pb-3 text-gray-400 hover:text-white font-medium text-sm">Files</button>
                    <button className="pb-3 text-gray-400 hover:text-white font-medium text-sm">Time Log</button>
                    <button className="pb-3 text-gray-400 hover:text-white font-medium text-sm">Invoices</button>
                </div>

                {/* Task Board */}
                <TaskBoard projectId={id} />
            </main>
        </div>
    );
}
