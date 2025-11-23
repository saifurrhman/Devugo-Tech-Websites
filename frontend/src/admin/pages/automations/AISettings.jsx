import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function AISettings() {
    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-purple-400">✨</span> AI Configuration
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage AI models and personalization settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* OpenAI Config */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">OpenAI Integration</h3>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">Connected</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">API Key</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value="sk-........................"
                                        readOnly
                                        className="flex-1 bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-gray-400 font-mono text-sm"
                                    />
                                    <button className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-800 text-sm">Update</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Default Model</label>
                                <select className="w-full bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500">
                                    <option>gpt-4-turbo</option>
                                    <option>gpt-3.5-turbo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Temperature (Creativity)</label>
                                <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full accent-purple-500" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Precise</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personalization Rules */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold mb-4">Personalization Engine</h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-[#0f172a] rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-purple-300">Smart Icebreakers</div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">Generate unique opening lines based on prospect's LinkedIn profile or website.</p>
                            </div>

                            <div className="p-4 bg-[#0f172a] rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-purple-300">Tone Matching</div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">Analyze recipient's content to match their communication style.</p>
                            </div>

                            <div className="p-4 bg-[#0f172a] rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-purple-300">Send Time Optimization</div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">Predict best time to email based on past engagement data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
