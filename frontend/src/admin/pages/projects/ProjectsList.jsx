import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { ProjectAPI } from '../../../lib/api';

export default function ProjectsList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('active');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await ProjectAPI.list();
            const list = Array.isArray(data) ? data : (data.data || []);
            setProjects(list);
        } catch (err) {
            console.error('Failed to load projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = filter === 'all' ? projects : projects.filter(p => (p.status || 'Active').toLowerCase().includes(filter));

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
                        <h1 className="text-2xl font-bold">Projects</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your client projects and tasks</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/projects/create')}
                        className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <span>+</span> New Project
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['active', 'completed', 'on hold', 'all'].map(f => (
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

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No projects found.
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <div
                                key={project.id || project._id}
                                onClick={() => navigate(`/admin/projects/${project.id || project._id}`)}
                                className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg font-bold">
                                        {(project.name || 'P').charAt(0)}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs border ${project.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        project.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                        {project.status || 'Active'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                                <p className="text-sm text-gray-400 mb-4">{project.client}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Progress</span>
                                        <span>{project.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                    <div className="flex -space-x-2">
                                        {[...Array(project.members || 1)].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#1e293b] flex items-center justify-center text-[8px]">
                                                U{i + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-400">Due {project.deadline || 'TBD'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
