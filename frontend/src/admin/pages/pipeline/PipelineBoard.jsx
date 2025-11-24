import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { PipelineAPI } from '../../../lib/api';

export default function PipelineBoard() {
    const navigate = useNavigate();
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        loadPipeline();
    }, []);

    const loadPipeline = async () => {
        try {
            setLoading(true);
            const [stagesData, dealsData] = await Promise.all([
                PipelineAPI.listStages(),
                PipelineAPI.listDeals()
            ]);

            const stagesList = Array.isArray(stagesData) ? stagesData : (stagesData.data || []);
            const dealsList = Array.isArray(dealsData) ? dealsData : (dealsData.data || []);

            // Map deals to stages
            const stagesWithDeals = stagesList.map(stage => ({
                ...stage,
                items: dealsList.filter(deal => deal.stageId === stage.id)
            }));

            // If no stages, use default structure but empty
            if (stagesWithDeals.length === 0) {
                const defaultStages = [
                    { id: 'new', name: 'New Leads', color: 'blue', items: [] },
                    { id: 'qualified', name: 'Qualified', color: 'purple', items: [] },
                    { id: 'proposal', name: 'Proposal Sent', color: 'yellow', items: [] },
                    { id: 'negotiation', name: 'Negotiation', color: 'orange', items: [] },
                    { id: 'won', name: 'Closed Won', color: 'green', items: [] },
                ];
                // Distribute deals if any to default stages based on status or id
                const mappedDefault = defaultStages.map(s => ({
                    ...s,
                    items: dealsList.filter(d => (d.status || d.stageId) === s.id)
                }));
                setStages(mappedDefault);
            } else {
                setStages(stagesWithDeals);
            }

        } catch (err) {
            console.error('Failed to load pipeline:', err);
            setError('Failed to load pipeline');
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
                        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your deals and track progress</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/pipeline/settings')}
                            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
                        >
                            ⚙️ Settings
                        </button>
                        <button className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <span>+</span> Add Deal
                        </button>
                    </div>
                </div>

                {/* Pipeline Board */}
                <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-180px)]">
                    {stages.map((stage) => (
                        <div key={stage.id} className="min-w-[300px] w-[300px] flex flex-col">
                            <div className={`p-3 rounded-t-lg bg-${stage.color || 'blue'}-900/20 border-t-4 border-${stage.color || 'blue'}-500 flex justify-between items-center mb-2`}>
                                <span className="font-semibold text-sm uppercase tracking-wide">{stage.name}</span>
                                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{stage.items.length}</span>
                            </div>

                            <div className="flex-1 bg-[#1e293b]/50 rounded-lg p-2 space-y-3 overflow-y-auto">
                                {stage.items.map((item) => (
                                    <div
                                        key={item.id || item._id}
                                        onClick={() => navigate(`/admin/pipeline/leads/${item.id || item._id}`)}
                                        className="bg-[#1e293b] p-4 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="font-medium mb-1 group-hover:text-blue-400 transition-colors">{item.title}</div>
                                        <div className="text-lg font-bold text-green-400 mb-2">{item.value}</div>
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                                    {(item.contact || 'U').charAt(0)}
                                                </div>
                                                {item.contact || 'Unknown'}
                                            </div>
                                            <span>{item.date || 'Recently'}</span>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-sm text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 transition-colors">
                                    + Add Deal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
