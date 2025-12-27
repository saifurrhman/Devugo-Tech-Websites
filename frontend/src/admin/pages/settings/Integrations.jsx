import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { Video, Calendar, Link as LinkIcon, CheckCircle, ExternalLink } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';

export default function Integrations() {
    const { success, error: notifyError } = useNotification();
    const [status, setStatus] = useState({ zoom: false, google: false, calendly: false });
    const [configStatus, setConfigStatus] = useState({ zoom: { configured: false }, google: { configured: false } });
    const [loading, setLoading] = useState(true);

    // UI State
    const [editing, setEditing] = useState(null); // 'zoom' | 'google'

    // Form Data
    const [credentials, setCredentials] = useState({
        clientId: '',
        clientSecret: '',
        redirectUri: 'http://localhost:3000/admin/settings/integrations'
    });

    // Calendly
    const [calendlyToken, setCalendlyToken] = useState('');

    useEffect(() => {
        fetchData();

        // Handle OAuth Return
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const zoomCode = params.get('zoom_code'); // If we use custom param

        if (code || zoomCode) {
            handleOAuthCallback(code || zoomCode);
        }
    }, []);

    const fetchData = async () => {
        try {
            const [connRes, confRes] = await Promise.all([
                api('/api/integrations/status'),
                api('/api/integrations/config-status')
            ]);
            setStatus(connRes);
            setConfigStatus(confRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthCallback = async (code) => {
        // Detect which service purely based on URL or previous state is hard if generic 'code'.
        // Zoom usually returns code. Google returns code.
        // We will try connecting Zoom first if the param was 'zoom_code', else Google.
        const params = new URLSearchParams(window.location.search);
        const isZoom = params.has('zoom_code');

        try {
            if (isZoom) {
                await api('/api/integrations/zoom/connect', { method: 'POST', body: { code } });
                success('Zoom Connected Successfully');
            } else {
                await api('/api/integrations/google/connect', { method: 'POST', body: { code } });
                success('Google Calendar Connected');
            }
            // Clear URL
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchData();
        } catch (err) {
            notifyError('Connection Failed: ' + err.message);
        }
    };

    const handleSaveConfig = async (platform) => {
        try {
            await api('/api/integrations/config', {
                method: 'POST',
                body: {
                    platform,
                    clientId: credentials.clientId,
                    clientSecret: credentials.clientSecret,
                    redirectUri: credentials.redirectUri
                }
            });
            success(`${platform} configuration saved`);
            setEditing(null);
            fetchData();
        } catch (err) {
            notifyError(err.message);
        }
    };

    const handleZoomConnect = async () => {
        try {
            const res = await api('/api/integrations/zoom/auth-url');
            window.location.href = res.url;
        } catch (err) {
            notifyError(err.message);
        }
    };

    const handleGoogleConnect = async () => {
        try {
            const res = await api('/api/integrations/google/get-url');
            window.location.href = res.url;
        } catch (err) {
            notifyError(err.message);
        }
    };

    const handleCalendlySave = async () => {
        try {
            await api('/api/integrations/calendly', {
                method: 'POST',
                body: { token: calendlyToken }
            });
            success('Calendly connected');
            fetchData();
        } catch (err) {
            notifyError(err.message);
        }
    };

    const getIcon = (platform) => {
        if (platform === 'zoom') return <Video size={32} />;
        if (platform === 'google') return <Calendar size={32} />;
        return <LinkIcon size={32} />;
    };

    const renderConfigForm = (platform) => (
        <div className="mt-4 bg-gray-900 p-4 rounded-lg space-y-3 border border-gray-700">
            <h4 className="font-semibold text-white">Configure {platform} API</h4>
            <div>
                <label className="text-xs text-gray-400">Client ID</label>
                <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"
                    value={credentials.clientId}
                    onChange={e => setCredentials({ ...credentials, clientId: e.target.value })}
                />
            </div>
            <div>
                <label className="text-xs text-gray-400">Client Secret</label>
                <input
                    type="password"
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"
                    value={credentials.clientSecret}
                    onChange={e => setCredentials({ ...credentials, clientSecret: e.target.value })}
                />
            </div>
            <div>
                <label className="text-xs text-gray-400">Redirect URI (Default)</label>
                <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-400 cursor-not-allowed"
                    value="http://localhost:3000/admin/settings/integrations"
                    disabled
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleSaveConfig(platform)}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    Save Keys
                </button>
            </div>
        </div>
    );

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Integrations
                    </h1>
                    <p className="text-gray-400 mt-2">Connect external services to sync meetings (Configure API Keys manually).</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* ZOOM CARD */}
                        <div className="card group relative p-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 border-transparent hover:border-blue-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative h-full p-6 flex flex-col z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                        {getIcon('zoom')}
                                    </div>
                                    {status.zoom && <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">CONNECTED</span>}
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Zoom</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-1">Generate meeting links automatically.</p>

                                {editing === 'zoom' ? renderConfigForm('zoom') : (
                                    <div className="space-y-2 mt-auto">
                                        {!configStatus.zoom.configured ? (
                                            <button
                                                onClick={() => { setEditing('zoom'); setCredentials({ clientId: '', clientSecret: '', redirectUri: '' }); }}
                                                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-700 hover:border-blue-500/50 transition-all font-medium"
                                            >
                                                ⚙️ Configure Keys
                                            </button>
                                        ) : (
                                            <>
                                                {status.zoom ? (
                                                    <button disabled className="w-full py-2.5 bg-green-500/10 text-green-500 rounded-lg text-sm cursor-default font-medium border border-green-500/20">
                                                        Active
                                                    </button>
                                                ) : (
                                                    <button onClick={handleZoomConnect} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-600/20 transition-all transform hover:translate-y-[-1px]">
                                                        Connect Zoom
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setEditing('zoom'); setCredentials({ clientId: '', clientSecret: '', redirectUri: '' }); }}
                                                    className="w-full text-xs text-gray-500 hover:text-blue-400 mt-2 transition-colors"
                                                >
                                                    Edit API Keys
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* GOOGLE CARD */}
                        <div className="card group relative p-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 border-transparent hover:border-orange-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative h-full p-6 flex flex-col z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                        {getIcon('google')}
                                    </div>
                                    {status.google && <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">CONNECTED</span>}
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">Google Calendar</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-1">Sync meetings to calendar.</p>

                                {editing === 'google' ? renderConfigForm('google') : (
                                    <div className="space-y-2 mt-auto">
                                        {!configStatus.google.configured ? (
                                            <button
                                                onClick={() => { setEditing('google'); setCredentials({ clientId: '', clientSecret: '', redirectUri: '' }); }}
                                                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-700 hover:border-orange-500/50 transition-all font-medium"
                                            >
                                                ⚙️ Configure Keys
                                            </button>
                                        ) : (
                                            <>
                                                {status.google ? (
                                                    <button disabled className="w-full py-2.5 bg-green-500/10 text-green-500 rounded-lg text-sm cursor-default font-medium border border-green-500/20">
                                                        Active
                                                    </button>
                                                ) : (
                                                    <button onClick={handleGoogleConnect} className="w-full py-2.5 bg-white text-black hover:bg-gray-100 rounded-lg text-sm font-medium shadow-lg transition-all transform hover:translate-y-[-1px]">
                                                        Connect Google
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setEditing('google'); setCredentials({ clientId: '', clientSecret: '', redirectUri: '' }); }}
                                                    className="w-full text-xs text-gray-500 hover:text-orange-400 mt-2 transition-colors"
                                                >
                                                    Edit API Keys
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CALENDLY CARD */}
                        <div className="card group relative p-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 border-transparent hover:border-cyan-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative h-full p-6 flex flex-col z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                                        {getIcon('calendly')}
                                    </div>
                                    {status.calendly && <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">CONNECTED</span>}
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">Calendly</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-1">Import scheduled events.</p>

                                {!status.calendly ? (
                                    <div className="space-y-2 mt-auto">
                                        <input
                                            type="text"
                                            placeholder="Paste Personal Token"
                                            value={calendlyToken}
                                            onChange={e => setCalendlyToken(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                                        />
                                        <button onClick={handleCalendlySave} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-600/20 transition-all transform hover:translate-y-[-1px]">
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <button disabled className="w-full py-2.5 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium mt-auto border border-green-500/20">Connected</button>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
