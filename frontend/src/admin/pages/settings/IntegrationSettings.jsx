import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { SettingsAPI } from '../../lib/api';

export default function IntegrationSettings() {
    const [loading, setLoading] = useState(true);
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        loadIntegrations();
    }, []);

    async function loadIntegrations() {
        try {
            setLoading(true);
            const data = await SettingsAPI.get('integrations');
            if (data && Array.isArray(data)) {
                setIntegrations(data);
            } else {
                // Fallback mock data
                setIntegrations([
                    { id: 'stripe', name: 'Stripe', description: 'Payment processing', connected: true, icon: 'S', color: 'bg-blue-600' },
                    { id: 'slack', name: 'Slack', description: 'Team communication', connected: false, icon: 'S', color: 'bg-[#4A154B]' },
                    { id: 'aws', name: 'AWS S3', description: 'File storage', connected: false, icon: 'A', color: 'bg-[#FF9900]' }
                ]);
            }
        } catch (error) {
            console.error('Failed to load integrations:', error);
            // Fallback mock data
            setIntegrations([
                { id: 'stripe', name: 'Stripe', description: 'Payment processing', connected: true, icon: 'S', color: 'bg-blue-600' },
                { id: 'slack', name: 'Slack', description: 'Team communication', connected: false, icon: 'S', color: 'bg-[#4A154B]' },
                { id: 'aws', name: 'AWS S3', description: 'File storage', connected: false, icon: 'A', color: 'bg-[#FF9900]' }
            ]);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(id, currentStatus) {
        try {
            // Optimistic update
            const updatedIntegrations = integrations.map(int =>
                int.id === id ? { ...int, connected: !currentStatus } : int
            );
            setIntegrations(updatedIntegrations);

            await SettingsAPI.update('integrations', updatedIntegrations);
        } catch (error) {
            console.error('Failed to update integration:', error);
            alert('Failed to update integration status');
            // Revert on error
            loadIntegrations();
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading integrations...</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Integrations</h1>
                    <p className="text-gray-400 text-sm mt-1">Connect your favorite tools</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map(integration => (
                        <div key={integration.id} className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 ${integration.color || 'bg-gray-600'} text-white rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm`}>
                                {integration.icon}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{integration.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{integration.description}</p>
                            <button
                                onClick={() => handleToggle(integration.id, integration.connected)}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${integration.connected
                                        ? 'bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                            >
                                {integration.connected ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
