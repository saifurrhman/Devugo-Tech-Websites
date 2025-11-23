import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function N8NIntegration() {
    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-pink-500">⚡</span> n8n Integration
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Connect your workflows with n8n for advanced automation</p>
                </div>

                <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-8 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⚡</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Connect to your n8n Instance</h2>
                    <p className="text-gray-400 mb-8">
                        Enable bi-directional sync between your CRM and n8n workflows. Trigger automations on lead updates, new emails, and more.
                    </p>

                    <div className="space-y-4 text-left max-w-md mx-auto">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">n8n Webhook URL</label>
                            <input
                                type="text"
                                placeholder="https://n8n.yourdomain.com/webhook/..."
                                className="w-full bg-[#0f172a] border border-gray-700 rounded px-4 py-2.5 text-white outline-none focus:border-pink-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">API Key (Optional)</label>
                            <input
                                type="password"
                                placeholder="Header Auth Key"
                                className="w-full bg-[#0f172a] border border-gray-700 rounded px-4 py-2.5 text-white outline-none focus:border-pink-500"
                            />
                        </div>

                        <button className="w-full btn-primary bg-pink-600 hover:bg-pink-500 py-3 rounded-lg font-medium transition-colors mt-4">
                            Test & Connect
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-300 mb-4">Available Triggers</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700">New Lead</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700">Email Opened</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700">Deal Stage Changed</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700">Task Completed</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
