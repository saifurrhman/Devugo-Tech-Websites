import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function CreateAutomation() {
    const [workflowName, setWorkflowName] = useState('');
    const [trigger, setTrigger] = useState('');

    const triggers = [
        { id: 'sub', icon: '👤', label: 'Subscriber Joins List', desc: 'When a new contact is added' },
        { id: 'link', icon: '🔗', label: 'Link Clicked', desc: 'When a recipient clicks a specific link' },
        { id: 'tag', icon: '🏷️', label: 'Tag Added', desc: 'When a tag is applied to a contact' },
        { id: 'date', icon: '📅', label: 'Specific Date', desc: 'On a birthday or anniversary' },
    ];

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Create Automation</h1>
                        <p className="text-gray-400 text-sm mt-1">Build a new automated workflow</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm">Cancel</button>
                        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium">Save Workflow</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Canvas Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card bg-[#1e293b] p-6 rounded-xl border border-gray-800">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Workflow Name</label>
                            <input
                                type="text"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                placeholder="e.g., Welcome Series for New Users"
                                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>

                        <div className="card bg-[#1e293b] p-8 rounded-xl border border-gray-800 min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-gray-700">
                            {!trigger ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚡</div>
                                    <h3 className="text-lg font-semibold mb-2">Select a Trigger</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto">Choose what event should start this automation workflow.</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-md">
                                    <div className="bg-blue-600 p-4 rounded-lg flex items-center gap-4 mb-8 relative">
                                        <div className="text-2xl">{triggers.find(t => t.id === trigger)?.icon}</div>
                                        <div>
                                            <div className="font-semibold">Trigger: {triggers.find(t => t.id === trigger)?.label}</div>
                                            <div className="text-blue-200 text-xs">Starts the workflow</div>
                                        </div>
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-xl">↓</div>
                                    </div>

                                    <button className="w-full border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-4 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                                        <span className="text-xl">+</span> Add Action
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Tools */}
                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] p-5 rounded-xl border border-gray-800">
                            <h3 className="font-semibold mb-4 text-sm uppercase text-gray-400 tracking-wider">Triggers</h3>
                            <div className="space-y-2">
                                {triggers.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTrigger(t.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${trigger === t.id
                                                ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/50'
                                                : 'bg-[#0f172a] border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="text-xl mt-0.5">{t.icon}</div>
                                        <div>
                                            <div className="font-medium text-sm">{t.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card bg-[#1e293b] p-5 rounded-xl border border-gray-800 opacity-50 pointer-events-none">
                            <h3 className="font-semibold mb-4 text-sm uppercase text-gray-400 tracking-wider">Actions</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-[#0f172a] rounded-lg border border-gray-700 flex items-center gap-3">
                                    <span>✉️</span> Send Email
                                </div>
                                <div className="p-3 bg-[#0f172a] rounded-lg border border-gray-700 flex items-center gap-3">
                                    <span>⏱️</span> Wait Delay
                                </div>
                                <div className="p-3 bg-[#0f172a] rounded-lg border border-gray-700 flex items-center gap-3">
                                    <span>🔀</span> Condition (If/Else)
                                </div>
                            </div>
                            <p className="text-xs text-center mt-4 text-yellow-500">Select a trigger first</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
