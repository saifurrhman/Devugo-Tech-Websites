import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function FollowUpSettings() {
    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Follow-Up Settings</h1>
                    <p className="text-gray-400 text-sm mt-1">Configure default behavior for automated follow-ups</p>
                </div>

                <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 max-w-3xl">
                    <div className="space-y-8">
                        {/* Global Rules */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span>🌐</span> Global Rules
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-gray-700">
                                    <div>
                                        <div className="font-medium">Stop on Reply</div>
                                        <div className="text-sm text-gray-400">Automatically stop follow-ups if a recipient replies</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-gray-700">
                                    <div>
                                        <div className="font-medium">Stop on Click</div>
                                        <div className="text-sm text-gray-400">Stop follow-ups if a recipient clicks a link</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Sending Windows */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span>⏰</span> Sending Windows
                            </h3>
                            <div className="bg-[#0f172a] rounded-lg border border-gray-700 p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                                        <input type="time" defaultValue="09:00" className="w-full bg-[#1e293b] border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">End Time</label>
                                        <input type="time" defaultValue="17:00" className="w-full bg-[#1e293b] border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm text-gray-400 mb-2">Sending Days</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <button
                                                key={day}
                                                className={`px-3 py-1 rounded text-sm border ${['Sat', 'Sun'].includes(day)
                                                        ? 'border-gray-700 text-gray-500 hover:border-gray-600'
                                                        : 'bg-blue-600 border-blue-600 text-white'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button className="btn-primary px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Save Settings</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
