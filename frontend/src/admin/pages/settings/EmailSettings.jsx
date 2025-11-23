import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { SettingsAPI } from '../../lib/api';

export default function EmailSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        signature: '',
        includeSignature: true,
        trackOpens: true,
        trackClicks: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const data = await SettingsAPI.get('email');
            if (data) setSettings(data);
        } catch (error) {
            console.error('Failed to load email settings:', error);
            // Fallback mock data
            setSettings({
                signature: 'Best regards,\n\n[Your Name]\n[Your Title]\n[Company Name]',
                includeSignature: true,
                trackOpens: true,
                trackClicks: true
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await SettingsAPI.update('email', settings);
            alert('Email settings saved successfully!');
        } catch (error) {
            console.error('Failed to save email settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading settings...</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Email Preferences</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage default email behavior and signatures</p>
                </div>

                <div className="max-w-3xl space-y-6">
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="font-semibold mb-4">Email Signature</h3>
                        <div className="mb-4">
                            <textarea
                                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 h-32 resize-none"
                                value={settings.signature}
                                onChange={e => setSettings({ ...settings, signature: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="sig-check"
                                className="rounded bg-gray-700 border-gray-600"
                                checked={settings.includeSignature}
                                onChange={e => setSettings({ ...settings, includeSignature: e.target.checked })}
                            />
                            <label htmlFor="sig-check" className="text-sm text-gray-300">Include signature in all new emails</label>
                        </div>
                    </div>

                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="font-semibold mb-4">Sending Behavior</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Track Opens</div>
                                    <div className="text-xs text-gray-500">Insert tracking pixel in sent emails</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.trackOpens}
                                        onChange={e => setSettings({ ...settings, trackOpens: e.target.checked })}
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Track Clicks</div>
                                    <div className="text-xs text-gray-500">Rewrite links to track clicks</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.trackClicks}
                                        onChange={e => setSettings({ ...settings, trackClicks: e.target.checked })}
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
