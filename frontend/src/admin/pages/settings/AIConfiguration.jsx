import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { SettingsAPI } from '../../lib/api';

export default function AIConfiguration() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        model: 'GPT-4 Turbo',
        strictFiltering: true,
        geminiApiKey: ''
    });

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            setLoading(true);
            const data = await SettingsAPI.getAI();
            if (data) setConfig({ ...data, geminiApiKey: data.geminiApiKey || '' });
        } catch (error) {
            console.error('Failed to load AI configuration:', error);
            // Fallback mock data
            setConfig({
                model: 'GPT-4 Turbo',
                strictFiltering: true,
                geminiApiKey: ''
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await SettingsAPI.updateAI(config);
            alert('AI configuration saved successfully!');
        } catch (error) {
            console.error('Failed to save AI configuration:', error);
            alert('Failed to save configuration. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading configuration...</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-purple-400">✨</span> AI Settings
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Configure global AI behavior and keys</p>
                </div>

                <div className="max-w-3xl space-y-6">
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="font-semibold mb-4">API Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Gemini API Key</label>
                                <input
                                    type="password"
                                    value={config.geminiApiKey}
                                    onChange={e => setConfig({ ...config, geminiApiKey: e.target.value })}
                                    placeholder="AIzaSy..."
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to use system environment variable if set.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="font-semibold mb-4">Model Selection</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Model</label>
                                <select
                                    value={config.model}
                                    onChange={e => setConfig({ ...config, model: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500"
                                >
                                    <option value="GPT-4 Turbo">GPT-4 Turbo</option>
                                    <option value="GPT-3.5 Turbo">GPT-3.5 Turbo</option>
                                    <option value="Claude 3 Opus">Claude 3 Opus</option>
                                    <option value="Gemini Flash 1.5">Gemini Flash 1.5</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="font-semibold mb-4">Content Safety</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Strict Filtering</div>
                                    <div className="text-xs text-gray-500">Filter potentially sensitive content</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={config.strictFiltering}
                                        onChange={e => setConfig({ ...config, strictFiltering: e.target.checked })}
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
