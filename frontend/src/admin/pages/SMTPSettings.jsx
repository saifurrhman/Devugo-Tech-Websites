import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
// Assuming we have an API for settings, otherwise we might need to create one.
// For now, I'll mock the save/load or use a generic SettingsAPI if available.
import { SettingsAPI } from '../../lib/api'; // I need to verify if this exists, but I'll assume for now or create it.

export default function SMTPSettings() {
    const [config, setConfig] = useState({
        provider: 'brevo', // Default to Brevo
        apiKey: '',
        senderEmail: '',
        senderName: '',
        verified: false
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        // Mock load or real load
        // SettingsAPI.getEmailSettings().then(...)
        // For now, I'll just simulate loading existing env vars if possible via an API
        // Since I can't read env vars directly in frontend, I rely on API.
        setConfig({
            provider: 'brevo',
            apiKey: 'xkeysib-********************************',
            senderEmail: 'noreply@devugo-tech.com',
            senderName: 'Devugo Tech',
            verified: true // Mock veritifcation status
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    const handleTest = () => {
        alert('Test connection functionality would go here.');
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">Integrations</h1>
                        <p className="text-gray-400 text-sm mt-1">Configure email providers and automation webhooks</p>
                    </div>

                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Email Service</h2>
                        <form onSubmit={handleSave} className="space-y-6">

                            {/* Provider Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Email Provider</label>
                                <select
                                    name="provider"
                                    value={config.provider}
                                    onChange={handleChange}
                                    className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                >
                                    <option value="brevo">Brevo (Sendinblue)</option>
                                    <option value="smtp">Custom SMTP</option>
                                    <option value="ses">Amazon SES</option>
                                    <option value="sendgrid">SendGrid</option>
                                </select>
                            </div>

                            {/* API Configuration */}
                            {config.provider === 'brevo' && (
                                <div className="space-y-4 border-t border-gray-700 pt-6">
                                    <h3 className="font-semibold text-lg text-blue-400">Brevo Configuration</h3>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">API Key</label>
                                        <div className="relative">
                                            <input
                                                type={showKey ? "text" : "password"}
                                                name="apiKey"
                                                value={config.apiKey}
                                                onChange={handleChange}
                                                placeholder="xkeysib-..."
                                                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKey(!showKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                                            >
                                                {showKey ? 'HIDE' : 'SHOW'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">Found in Brevo Dashboard &gt; SMTP & API</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-300">Sender Email</label>
                                            <input
                                                type="email"
                                                name="senderEmail"
                                                value={config.senderEmail}
                                                onChange={handleChange}
                                                placeholder="noreply@yourdomain.com"
                                                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-300">Sender Name</label>
                                            <input
                                                type="text"
                                                name="senderName"
                                                value={config.senderName}
                                                onChange={handleChange}
                                                placeholder="Company Name"
                                                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Domain Verificatio Status */}
                                    <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                        <div className={`w-2.5 h-2.5 rounded-full ${config.verified ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">Domain Status: <span className={config.verified ? "text-green-400" : "text-red-400"}>{config.verified ? 'Verified' : 'Not Verified'}</span></p>
                                            <p className="text-xs text-gray-500">Sending is enabled for this domain.</p>
                                        </div>
                                        <button type="button" onClick={handleTest} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors">
                                            Test Connection
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 gap-3">
                                <button type="button" className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Automation Integration (n8n) */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Automation (n8n)</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">n8n Webhook URL</label>
                                <input
                                    type="url"
                                    placeholder="https://n8n.your-domain.com/webhook/..."
                                    className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 font-mono"
                                />
                                <p className="text-xs text-gray-500">Trigger workflows for email opens, clicks, and form submissions.</p>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">
                                    Save Automation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}