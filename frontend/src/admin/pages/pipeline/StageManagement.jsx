import React from 'react';

export default function StageManagement() {
    const stages = [
        { id: 1, name: 'New Leads', probability: 10, color: 'blue' },
        { id: 2, name: 'Qualified', probability: 30, color: 'purple' },
        { id: 3, name: 'Proposal Sent', probability: 60, color: 'yellow' },
        { id: 4, name: 'Negotiation', probability: 80, color: 'orange' },
        { id: 5, name: 'Closed Won', probability: 100, color: 'green' },
    ];

    return (
        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Pipeline Stages</h3>
                <button className="text-sm text-blue-400 hover:text-blue-300">+ Add Stage</button>
            </div>

            <div className="space-y-3">
                {stages.map((stage, idx) => (
                    <div key={stage.id} className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg border border-gray-700 group">
                        <div className="text-gray-500 cursor-move">⋮⋮</div>
                        <div className={`w-3 h-3 rounded-full bg-${stage.color}-500`}></div>
                        <div className="flex-1 font-medium text-sm">{stage.name}</div>
                        <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{stage.probability}%</div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-white">✎</button>
                            <button className="text-gray-400 hover:text-red-400">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
                Drag and drop to reorder stages. Changes affect all active deals.
            </p>
        </div>
    );
}
