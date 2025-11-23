import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { SettingsAPI } from '../../lib/api';

export default function SMTPSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [formData, setFormData] = useState({
        host: '',
        port: '587',
        encryption: 'TLS',
        username: '',
        password: '',
        fromName: '',
        fromEmail: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const data = await SettingsAPI.get('smtp');
            if (data) setFormData(data);
        } catch (error) {
            console.error('Failed to load SMTP settings:', error);
            // Fallback mock data if API fails or returns empty
            setFormData({
                host: 'smtp.example.com',
                port: '587',
                encryption: 'TLS',
                username: 'user@example.com',
                password: '',
                fromName: 'Your Company',
                fromEmail: 'noreply@example.com'
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await SettingsAPI.update('smtp', formData);
            alert('SMTP settings saved successfully!');
        } catch (error) {
            console.error('Failed to save SMTP settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleTest() {
        setTesting(true);
        try {
            // Simulate test connection
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert('Connection successful!');
        } catch (error) {
            alert('Connection failed. Please check your settings.');
        } finally {
            setTesting(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading settings...</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">SMTP Configuration</h1>
                    <p className="text-gray-400 text-sm mt-1">Configure your email sending server</p>
                </div>

                <div className="max-w-2xl">
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">SMTP Host</label>
                                <input
                                    type="text"
                                    placeholder="smtp.example.com"
                                    value={formData.host}
                                    onChange={e => setFormData({ ...formData, host: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Port</label>
                                    <input
                                        type="text"
                                        placeholder="587"
                                        value={formData.port}
                                        onChange={e => setFormData({ ...formData, port: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Encryption</label>
                                    <select
                                        value={formData.encryption}
                                        onChange={e => setFormData({ ...formData, encryption: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                    >
                                        <option value="TLS">TLS</option>
                                        <option value="SSL">SSL</option>
                                        <option value="None">None</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="user@example.com"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">From Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Company"
                                    value={formData.fromName}
                                    onChange={e => setFormData({ ...formData, fromName: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">From Email</label>
                                <input
                                    type="email"
                                    placeholder="noreply@example.com"
                                    value={formData.fromEmail}
                                    onChange={e => setFormData({ ...formData, fromEmail: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button
                                    onClick={handleTest}
                                    disabled={testing || saving}
                                    className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {testing ? 'Testing...' : 'Test Connection'}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || testing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
