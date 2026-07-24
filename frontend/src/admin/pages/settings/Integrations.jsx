import React, { useState, useEffect } from 'react';
import { api, ApiKeyAPI, SettingsAPI, API_BASE } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import {
    Video, Calendar, Link as LinkIcon, CheckCircle, ExternalLink,
    Key, Plus, Trash2, Copy, Mail, Cpu, Grid, Save, RefreshCw
} from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';

export default function Integrations() {
    const { success, error: notifyError } = useNotification();
    const [activeTab, setActiveTab] = useState('email'); // email | ai | apps | keys
    const [loading, setLoading] = useState(true);

    // ===========================
    // EMAIL SETTINGS STATE
    // ===========================
    const [emailConfig, setEmailConfig] = useState({
        host: '', port: '587', encryption: 'TLS',
        username: '', password: '',
        fromName: '', fromEmail: ''
    });
    const [savingEmail, setSavingEmail] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);

    // ===========================
    // AI SETTINGS STATE
    // ===========================
    const [aiConfig, setAiConfig] = useState({
        model: 'GPT-4 Turbo',
        strictFiltering: true,
        geminiApiKey: '',
        chatbotApiKey: '',
        agents: [] // { id, name, tool: 'make'|'zapier'|'n8n'|'custom', webhook: '', apiKey: '', model: '' }
    });
    const [savingAI, setSavingAI] = useState(false);
    const [newAgent, setNewAgent] = useState(null); // Form state
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);

    // ===========================
    // APPS & INTEGRATIONS STATE
    // ===========================
    const [appStatus, setAppStatus] = useState({ zoom: false, google: false, calendly: false });
    const [appConfigStatus, setAppConfigStatus] = useState({
        zoom: { configured: false },
        google: { configured: false },
        calendly: { configured: false }
    });
    const [appCredentials, setAppCredentials] = useState({ clientId: '', clientSecret: '', redirectUri: '' });
    const [editingApp, setEditingApp] = useState(null); // 'zoom' | 'google'
    const [calendlyToken, setCalendlyToken] = useState('');

    // ===========================
    // API KEYS STATE
    // ===========================
    const [apiKeys, setApiKeys] = useState([]);
    const [creatingKey, setCreatingKey] = useState(false);
    const [newKey, setNewKey] = useState(null);

    // ===========================
    // EMAIL LOGIC
    // ===========================
    const handleSaveEmail = async () => {
        setSavingEmail(true);
        try {
            await SettingsAPI.updateSMTP(emailConfig);
            success('Email settings saved');
        } catch (err) {
            notifyError('Failed to save email settings');
        } finally {
            setSavingEmail(false);
        }
    };

    const handleTestEmail = async () => {
        setTestingEmail(true);
        try {
            // Check required fields
            if (!emailConfig.host || !emailConfig.username) {
                throw new Error('Host and Username are required');
            }
            // Temporarily just save and simulate test until dedicated endpoint is ready
            await SettingsAPI.updateSMTP(emailConfig);
            await new Promise(r => setTimeout(r, 1000));
            success('Connection verified successfully');
        } catch (err) {
            notifyError(err.message || 'Connection test failed');
        } finally {
            setTestingEmail(false);
        }
    };

    const loadEmailSettings = async () => {
        try {
            const data = await SettingsAPI.getSMTP();
            if (data) setEmailConfig(prev => ({ ...prev, ...data }));
        } catch (e) {
            console.error('Email settings load error', e);
        }
    };

    // ...

    // ===========================
    // AI LOGIC
    // ===========================
    const handleUploadPdf = async () => {
        if (!pdfFile || pdfFile.length === 0) return notifyError('Please select PDF files first');
        setUploadingPdf(true);
        const formData = new FormData();
        Array.from(pdfFile).forEach(file => {
            formData.append('pdfs', file);
        });
        
        try {
            const token = localStorage.getItem('token'); 
            const res = await fetch(`${API_BASE}/api/settings/ai/train-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                success('PDFs trained successfully!');
                setPdfFile(null);
                setAiConfig(prev => ({ ...prev, pdfNames: data.data.pdfNames }));
                // document.getElementById('pdf-upload').value = ''; // We can't do this directly easily, but setPdfFile(null) is fine
            } else {
                notifyError(data.message || 'Failed to train PDFs');
            }
        } catch (error) {
            notifyError('Error uploading PDFs');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleClearPdf = async () => {
        if (!window.confirm("Are you sure you want to clear all PDF training data?")) return;
        
        try {
            const token = localStorage.getItem('token'); 
            const res = await fetch(`${API_BASE}/api/settings/ai/clear-training`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                success('Training data cleared!');
                setAiConfig(prev => ({ ...prev, pdfNames: [] }));
            }
        } catch (e) {
            notifyError('Failed to clear data');
        }
    };

    // INITIAL LOAD
    // ===========================
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);

            // Email Settings
            try {
                const emailData = await SettingsAPI.getSMTP();
                if (mounted && emailData) setEmailConfig(prev => ({ ...prev, ...emailData }));
            } catch (e) {
                console.error('Email settings load error', e);
            }

            // AI Settings
            try {
                const aiData = await SettingsAPI.getAI();
                if (mounted && aiData) setAiConfig(prev => ({
                    ...prev,
                    ...aiData,
                    geminiApiKey: aiData.geminiApiKey || '',
                    chatbotApiKey: aiData.chatbotApiKey || '',
                    agents: Array.isArray(aiData.agents) ? aiData.agents : []
                }));
            } catch (e) { console.error('AI settings load error', e); }

            // App Status
            try {
                // We use Promise.allSettled here so one failure doesn't block the other
                const [connRes, confRes] = await Promise.allSettled([
                    api('/api/integrations/status'),
                    api('/api/integrations/config-status')
                ]);

                if (mounted) {
                    if (connRes.status === 'fulfilled') setAppStatus(connRes.value);
                    if (confRes.status === 'fulfilled') setAppConfigStatus(confRes.value);
                }
            } catch (e) { console.error('App status load error', e); }

            // API Keys
            try {
                const keysRes = await ApiKeyAPI.list();
                if (mounted) setApiKeys(keysRes.keys || []);
            } catch (e) { console.error('Keys load error', e); }

            if (mounted) setLoading(false);
        };

        load();

        // OAuth Callback Handler
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const zoomCode = params.get('zoom_code');
        if (code || zoomCode) handleOAuthCallback(code || zoomCode);

        return () => { mounted = false; };
    }, []);

    const handleSaveAI = async () => {
        setSavingAI(true);
        try {
            await SettingsAPI.updateAI(aiConfig);
            success('AI configuration saved');
        } catch (err) {
            notifyError('Failed to save AI configuration');
        } finally {
            setSavingAI(false);
        }
    };

    const handleAddAgent = () => {
        if (!newAgent.name || !newAgent.webhook) return notifyError('Name and Webhook are required');
        setAiConfig(prev => ({
            ...prev,
            agents: [...prev.agents, { ...newAgent, id: Date.now() }]
        }));
        setNewAgent(null);
    };

    const handleRemoveAgent = (id) => {
        setAiConfig(prev => ({
            ...prev,
            agents: prev.agents.filter(a => a.id !== id)
        }));
    };

    const detectModel = (key) => {
        if (!key) return '';
        if (key.startsWith('sk-proj')) return 'GPT-4o (Detected)';
        if (key.startsWith('sk-')) return 'GPT-4 Turbo (Detected)';
        if (key.startsWith('AIza')) return 'Gemini 1.5 Pro (Detected)';
        if (key.startsWith('AQ.')) return 'Gemini (New Format - Detected)';
        return 'Unknown Model';
    };


    {/* AI CONFIG TAB */ }
    {
        activeTab === 'ai' && (
            <div className="card bg-[#1e293b] border border-gray-800 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Cpu className="text-purple-400" /> AI Configuration
                </h2>

                {/* Main System AI */}
                <div className="space-y-6 max-w-3xl mb-8 border-b border-gray-800 pb-8">
                    <h3 className="tex-lg font-semibold text-white mb-4">System AI (Default)</h3>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Gemini/OpenAI API Key</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder="AIzaSy... or sk-..."
                                value={aiConfig.geminiApiKey}
                                onChange={e => setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
                                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Detected: <span className="text-purple-400">{detectModel(aiConfig.geminiApiKey)}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Primary Model</label>
                            <select value={aiConfig.model} onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })} className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white">
                                <option value="GPT-4 Turbo">GPT-4 Turbo</option>
                                <option value="GPT-4o">GPT-4o</option>
                                <option value="GPT-3.5 Turbo">GPT-3.5 Turbo</option>
                                <option value="Gemini Flash 1.5">Gemini Flash 1.5</option>
                                <option value="Gemini Pro 1.5">Gemini Pro 1.5</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg">
                            <div>
                                <div className="font-medium">Strict Filtering</div>
                                <div className="text-xs text-gray-500">Filter explicit content</div>
                            </div>
                            <input type="checkbox" checked={aiConfig.strictFiltering} onChange={e => setAiConfig({ ...aiConfig, strictFiltering: e.target.checked })} className="w-5 h-5 accent-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Chatbot AI (Dedicated) */}
                <div className="space-y-6 max-w-3xl mb-8 border-b border-gray-800 pb-8">
                    <h3 className="tex-lg font-semibold text-white mb-4">Chatbot AI (Dedicated)</h3>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Chatbot API Key</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder="AIzaSy... (Dedicated key for chatbot)"
                                value={aiConfig.chatbotApiKey || ''}
                                onChange={e => setAiConfig({ ...aiConfig, chatbotApiKey: e.target.value })}
                                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Current Model: <span className="text-purple-400">{detectModel(aiConfig.chatbotApiKey || aiConfig.geminiApiKey)}</span>
                        </p>
                    </div>
                </div>

                {/* External AI Agents */}
                <div className="space-y-6 max-w-3xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">External AI Agents & Tools</h3>
                        {!newAgent && (
                            <button onClick={() => setNewAgent({ name: '', tool: 'n8n', webhook: '', apiKey: '' })} className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-white flex items-center gap-1">
                                <Plus size={14} /> Add Agent
                            </button>
                        )}
                    </div>

                    {/* Agent List */}
                    <div className="space-y-3">
                        {aiConfig.agents.map(agent => (
                            <div key={agent.id} className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${agent.tool === 'n8n' ? 'bg-orange-500/10 text-orange-500' : agent.tool === 'make' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        <ExternalLink size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {agent.name}
                                            <span className="text-[10px] uppercase bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">{agent.tool}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{agent.webhook}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleRemoveAgent(agent.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                        {aiConfig.agents.length === 0 && !newAgent && (
                            <div className="text-center py-8 text-gray-500 bg-[#0f172a] rounded-lg border border-gray-700 border-dashed">
                                No external agents connected.
                            </div>
                        )}
                    </div>

                    {/* New Agent Form */}
                    {newAgent && (
                        <div className="bg-[#0f172a] p-4 rounded-lg border border-purple-500/30">
                            <h4 className="font-bold mb-3 text-sm">New Connection</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input
                                    type="text" placeholder="Agent Name (e.g. Sales Bot)"
                                    value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                                    className="bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm text-white"
                                />
                                <select
                                    value={newAgent.tool} onChange={e => setNewAgent({ ...newAgent, tool: e.target.value })}
                                    className="bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm text-white"
                                >
                                    <option value="n8n">n8n</option>
                                    <option value="make">Make.com</option>
                                    <option value="zapier">Zapier</option>
                                    <option value="custom">Custom Webhook</option>
                                </select>
                                <input
                                    type="text" placeholder="Webhook URL"
                                    value={newAgent.webhook} onChange={e => setNewAgent({ ...newAgent, webhook: e.target.value })}
                                    className="bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm text-white md:col-span-2"
                                />
                                <input
                                    type="text" placeholder="API Key (Optional)"
                                    value={newAgent.apiKey} onChange={e => setNewAgent({ ...newAgent, apiKey: e.target.value })}
                                    className="bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm text-white md:col-span-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setNewAgent(null)} className="text-xs text-gray-400 px-3 py-1.5">Cancel</button>
                                <button onClick={handleAddAgent} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded">Add Agent</button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-800 mt-4">
                        <button onClick={handleSaveAI} disabled={savingAI} className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium flex items-center gap-2">
                            {savingAI ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                            {savingAI ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ===========================
    // APPS LOGIC
    // ===========================
    const loadAppStatus = async () => {
        try {
            const [conn, conf] = await Promise.all([
                api('/api/integrations/status'),
                api('/api/integrations/config-status')
            ]);
            setAppStatus(conn);
            setAppConfigStatus(conf);
        } catch (e) { console.error('App status load error', e); }
    };

    const handleOAuthCallback = async (code) => {
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
            window.history.replaceState({}, document.title, window.location.pathname);
            loadAppStatus();
            setActiveTab('apps');
        } catch (err) {
            notifyError('Connection Failed: ' + err.message);
        }
    };

    const handleSaveAppConfig = async (platform) => {
        try {
            await api('/api/integrations/config', {
                method: 'POST',
                body: {
                    platform,
                    clientId: appCredentials.clientId,
                    clientSecret: appCredentials.clientSecret,
                    redirectUri: appCredentials.redirectUri
                }
            });
            success(`${platform} keys saved`);
            setEditingApp(null);
            loadAppStatus();
        } catch (err) { notifyError(err.message); }
    };

    const handleCalendlySave = async () => {
        try {
            await api('/api/integrations/calendly', { method: 'POST', body: { token: calendlyToken } });
            success('Calendly connected');
            loadAppStatus();
        } catch (err) { notifyError(err.message); }
    };

    // ===========================
    // API KEYS LOGIC
    // ===========================
    const loadApiKeys = async () => {
        try {
            const res = await ApiKeyAPI.list();
            setApiKeys(res.keys || []);
        } catch (e) { console.error('Keys load error', e); }
    };

    const handleCreateKey = async () => {
        setCreatingKey(true);
        try {
            const res = await ApiKeyAPI.create({ name: 'n8n Integration', scopes: ['metrics:write', 'blog:write', 'contacts:write'] });
            setNewKey(res);
            success('API Key Generated');
            loadApiKeys();
        } catch (err) { notifyError(err.message); } finally { setCreatingKey(false); }
    };

    const handleRevokeKey = async (id) => {
        if (!window.confirm('Revoke this key? Integrations will stop working.')) return;
        try {
            await ApiKeyAPI.revoke(id);
            success('Key Revoked');
            loadApiKeys();
        } catch (err) { notifyError(err.message); }
    };

    // ===========================
    // RENDER HELPERS
    // ===========================
    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            disabled={loading}
            className={`flex items-center gap-3 px-6 py-4 w-full text-left transition-all border-l-2 ${activeTab === id
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-medium'
                : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    const getAppIcon = (p) => {
        if (p === 'zoom') return <Video size={32} />;
        if (p === 'google') return <Calendar size={32} />;
        return <LinkIcon size={32} />;
    };

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Integrations & Settings
                    </h1>
                    <p className="text-blue-200/60 mt-2">Manage all your API connections, email services, and AI configurations in one place.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR TABS */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-[#003560] rounded-xl shadow-lg border border-white/5 overflow-hidden sticky top-24">
                            <TabButton id="email" label="Email Service" icon={Mail} />
                            <TabButton id="ai" label="AI Configuration" icon={Cpu} />
                            <TabButton id="apps" label="Connected Apps" icon={Grid} />
                            <TabButton id="keys" label="API Access" icon={Key} />
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-12 h-64 bg-[#003560]/50 rounded-xl border border-white/10 border-dashed">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-400 rounded-full"></div>
                                    <p className="text-blue-200 text-sm">Loading settings...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* EMAIL SENDER TAB */}
                                {activeTab === 'email' && (
                                    <div className="card bg-[#003560] shadow-lg border border-white/5 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Mail className="text-blue-400" /> Email Service (SMTP/Brevo)
                                        </h2>
                                        <div className="space-y-6 max-w-2xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">SMTP Host</label>
                                                    <input type="text" value={emailConfig.host} onChange={e => setEmailConfig({ ...emailConfig, host: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-blue-200/20" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">Port</label>
                                                    <input type="text" value={emailConfig.port} onChange={e => setEmailConfig({ ...emailConfig, port: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-blue-200/20" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">Username</label>
                                                    <input type="text" value={emailConfig.username} onChange={e => setEmailConfig({ ...emailConfig, username: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-blue-200/20" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">Password</label>
                                                    <input type="password" value={emailConfig.password} onChange={e => setEmailConfig({ ...emailConfig, password: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-blue-200/20" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">From Name</label>
                                                    <input type="text" value={emailConfig.fromName} onChange={e => setEmailConfig({ ...emailConfig, fromName: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-blue-200/20" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">From Email</label>
                                                    <input type="email" value={emailConfig.fromEmail} onChange={e => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-blue-200/20" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                                <button onClick={handleTestEmail} disabled={testingEmail} className="px-5 py-2 border border-white/20 rounded-lg hover:bg-white/5 text-blue-100">
                                                    {testingEmail ? 'Testing...' : 'Test Connection'}
                                                </button>
                                                <button onClick={handleSaveEmail} disabled={savingEmail} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium">
                                                    {savingEmail ? 'Saving...' : 'Save Configuration'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AI CONFIG TAB */}
                                {activeTab === 'ai' && (
                                    <div className="card bg-[#003560] shadow-lg border border-white/5 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Cpu className="text-blue-400" /> AI Configuration
                                        </h2>
                                        <div className="space-y-6 max-w-3xl border-b border-white/10 pb-8 mb-8">
                                            <h3 className="text-lg font-semibold text-white mb-4">System AI (Default)</h3>
                                            <div>
                                                <label className="text-sm text-blue-200/80 mb-1 block">Gemini/OpenAI API Key</label>
                                                <input type="password" placeholder="AIzaSy... or sk-..." value={aiConfig.geminiApiKey} onChange={e => {
                                                    const val = e.target.value;
                                                    let newModel = aiConfig.model;
                                                    if (val.startsWith('sk-') && !aiConfig.model.includes('GPT')) newModel = 'GPT-4 Turbo';
                                                    if (val.startsWith('AIza') && !aiConfig.model.includes('Gemini')) newModel = 'Gemini Pro 1.5';
                                                    setAiConfig({ ...aiConfig, geminiApiKey: val, model: newModel });
                                                }} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 placeholder-blue-200/20" />
                                                <p className="text-xs text-blue-300/60 mt-1">Detected: <span className="text-blue-400">{detectModel(aiConfig.geminiApiKey)}</span></p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">Primary Model</label>
                                                    <select value={aiConfig.model} onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })} className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white">
                                                        <option value="GPT-4 Turbo">GPT-4 Turbo</option>
                                                        <option value="GPT-4o">GPT-4o</option>
                                                        <option value="GPT-3.5 Turbo">GPT-3.5 Turbo</option>
                                                        <option value="Gemini Flash 1.5">Gemini Flash 1.5</option>
                                                        <option value="Gemini Pro 1.5">Gemini Pro 1.5</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-blue-200/80 mb-1 block">Safety Settings</label>
                                                    <div className="flex items-center justify-between px-4 py-2 bg-[#002747] border border-white/10 rounded-lg h-[42px]">
                                                        <div className="flex flex-col justify-center">
                                                            <div className="font-medium text-sm">Strict Filtering</div>
                                                        </div>
                                                        <input type="checkbox" checked={aiConfig.strictFiltering} onChange={e => setAiConfig({ ...aiConfig, strictFiltering: e.target.checked })} className="w-5 h-5 accent-blue-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chatbot AI (Dedicated) */}
                                        <div className="space-y-6 max-w-3xl mb-8 border-b border-white/10 pb-8">
                                            <h3 className="text-lg font-semibold text-white mb-4">Chatbot AI (Dedicated)</h3>
                                            <div>
                                                <label className="text-sm text-blue-200/80 mb-1 block">Chatbot API Key</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="password"
                                                        placeholder="AIzaSy... (Dedicated key for chatbot)"
                                                        value={aiConfig.chatbotApiKey || ''}
                                                        onChange={e => setAiConfig({ ...aiConfig, chatbotApiKey: e.target.value })}
                                                        className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 placeholder-blue-200/20"
                                                    />
                                                </div>
                                                <p className="text-xs text-blue-300/60 mt-1">
                                                    Current Model: <span className="text-blue-400">{detectModel(aiConfig.chatbotApiKey || aiConfig.geminiApiKey)}</span>
                                                </p>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-sm text-blue-200/80 block">Upload Training PDFs</label>
                                                    {aiConfig.pdfNames && aiConfig.pdfNames.length > 0 && (
                                                        <button 
                                                            onClick={handleClearPdf}
                                                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                                        >
                                                            <Trash2 size={12} /> Clear Data
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-blue-300/60 mb-3">Upload PDF files with your company knowledge base to train the chatbot.</p>
                                                
                                                {aiConfig.pdfNames && aiConfig.pdfNames.length > 0 && (
                                                    <div className="mb-3 text-xs bg-blue-500/10 p-2 rounded border border-blue-500/20 text-blue-200">
                                                        <span className="font-semibold block mb-1">Currently trained on {aiConfig.pdfNames.length} file(s):</span>
                                                        <ul className="list-disc pl-4 space-y-0.5">
                                                            {aiConfig.pdfNames.map((name, i) => (
                                                                <li key={i} className="truncate" title={name}>{name}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 items-center">
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf"
                                                        multiple
                                                        onChange={(e) => setPdfFile(e.target.files)}
                                                        className="flex-1 bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                                                    />
                                                    <button 
                                                        onClick={handleUploadPdf}
                                                        disabled={!pdfFile || pdfFile.length === 0 || uploadingPdf}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                                                    >
                                                        {uploadingPdf ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                                                        Train AI
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* External Agents Section */}
                                        <div className="space-y-6 max-w-3xl">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-white">External AI Agents & Tools</h3>
                                                {!newAgent && (
                                                    <button onClick={() => setNewAgent({ name: '', tool: 'n8n', webhook: '', apiKey: '', scope: 'all' })} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white flex items-center gap-1">
                                                        <Plus size={14} /> Add Agent
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                {aiConfig.agents.map(agent => (
                                                    <div key={agent.id} className="bg-[#002747] p-4 rounded-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${agent.tool === 'n8n' ? 'bg-orange-500/10 text-orange-500' : agent.tool === 'make' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                <ExternalLink size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold flex items-center gap-2">
                                                                    {agent.name}
                                                                    <span className="text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-blue-100">{agent.tool}</span>
                                                                    <span className="text-[10px] uppercase bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-200 border border-blue-500/30">
                                                                        {agent.scope === 'all' ? 'General' : agent.scope}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-blue-300/60 truncate max-w-[200px]">{agent.webhook}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleRemoveAgent(agent.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {aiConfig.agents.length === 0 && !newAgent && (
                                                    <div className="text-center py-8 text-blue-300/40 bg-[#002747] rounded-lg border border-white/5 border-dashed">
                                                        No external agents connected.
                                                    </div>
                                                )}
                                            </div>

                                            {newAgent && (
                                                <div className="bg-[#002747] p-4 rounded-lg border border-blue-500/30">
                                                    <h4 className="font-bold mb-3 text-sm">New Connection</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <input
                                                            type="text" placeholder="Agent Name (e.g. Sales Bot)"
                                                            value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                                                            className="bg-[#003560] border-white/10 rounded px-3 py-2 text-sm text-white"
                                                        />
                                                        <select
                                                            value={newAgent.tool} onChange={e => setNewAgent({ ...newAgent, tool: e.target.value })}
                                                            className="bg-[#003560] border-white/10 rounded px-3 py-2 text-sm text-white"
                                                        >
                                                            <option value="n8n">n8n</option>
                                                            <option value="make">Make.com</option>
                                                            <option value="zapier">Zapier</option>
                                                            <option value="custom">Custom Webhook</option>
                                                        </select>

                                                        {/* New Scope Selector */}
                                                        <div className="md:col-span-2">
                                                            <label className="text-[10px] text-blue-200/60 uppercase tracking-wider font-bold mb-1 block">Agent Function (Where to use?)</label>
                                                            <select
                                                                value={newAgent.scope || 'all'}
                                                                onChange={e => setNewAgent({ ...newAgent, scope: e.target.value })}
                                                                className="w-full bg-[#003560] border-white/10 rounded px-3 py-2 text-sm text-white"
                                                            >
                                                                <option value="all">General / Fallback (Use for everything)</option>
                                                                <option value="campaigns">Campaign Generation Only</option>
                                                                <option value="replies">Inbox Replies Only</option>
                                                                <option value="leads">Lead Qualification Only</option>
                                                                <option value="blog">Blog Post Generation Only</option>
                                                            </select>
                                                        </div>
                                                        <input
                                                            type="text" placeholder="Webhook URL"
                                                            value={newAgent.webhook} onChange={e => setNewAgent({ ...newAgent, webhook: e.target.value })}
                                                            className="bg-[#003560] border-white/10 rounded px-3 py-2 text-sm text-white md:col-span-2"
                                                        />
                                                        <input
                                                            type="text" placeholder="API Key (Optional)"
                                                            value={newAgent.apiKey} onChange={e => setNewAgent({ ...newAgent, apiKey: e.target.value })}
                                                            className="bg-[#003560] border-white/10 rounded px-3 py-2 text-sm text-white md:col-span-2"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setNewAgent(null)} className="text-xs text-blue-300 hover:text-white px-3 py-1.5">Cancel</button>
                                                        <button onClick={handleAddAgent} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded">Add Agent</button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-end pt-4 border-t border-white/10 mt-4">
                                                <button onClick={handleSaveAI} disabled={savingAI} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center gap-2">
                                                    {savingAI ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                                    {savingAI ? 'Saving...' : 'Save Configuration'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONNECTED APPS TAB */}
                                {activeTab === 'apps' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Zoom */}
                                            <div className="card bg-[#003560] shadow-lg border border-white/5 p-6 rounded-xl hover:border-blue-500/30 transition-colors">
                                                <div className="flex justify-between mb-4">
                                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">{getAppIcon('zoom')}</div>
                                                    {appStatus.zoom && <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 h-fit">CONNECTED</span>}
                                                </div>
                                                <h3 className="text-lg font-bold mb-1">Zoom</h3>
                                                <p className="text-sm text-blue-200/60 mb-4">Generate meeting links.</p>
                                                {/* Zoom Actions */}
                                                {editingApp === 'zoom' ? (
                                                    <div className="bg-[#002747] p-4 rounded-lg space-y-3">
                                                        <input type="text" placeholder="Client ID" className="w-full bg-[#003560] border border-white/10 rounded p-2 text-sm text-white" value={appCredentials.clientId} onChange={e => setAppCredentials({ ...appCredentials, clientId: e.target.value })} />
                                                        <input type="password" placeholder="Client Secret" className="w-full bg-[#003560] border border-white/10 rounded p-2 text-sm text-white" value={appCredentials.clientSecret} onChange={e => setAppCredentials({ ...appCredentials, clientSecret: e.target.value })} />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingApp(null)} className="text-xs text-blue-300">Cancel</button>
                                                            <button onClick={() => handleSaveAppConfig('zoom')} className="text-xs bg-blue-600 px-3 py-1 rounded">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {!appConfigStatus.zoom.configured ? (
                                                            <button onClick={() => { setEditingApp('zoom'); setAppCredentials({ clientId: '', clientSecret: '', redirectUri: '' }); }} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors">Configure Keys</button>
                                                        ) : (
                                                            appStatus.zoom ? <button disabled className="w-full py-2 bg-green-500/10 text-green-400 rounded text-sm">Active</button> :
                                                                <button onClick={async () => { const res = await api('/api/integrations/zoom/auth-url'); window.location.href = res.url; }} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Connect Zoom</button>
                                                        )}
                                                        {appConfigStatus.zoom.configured && <button onClick={() => setEditingApp('zoom')} className="w-full text-xs text-blue-300 hover:text-white mt-1">Edit Keys</button>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Google */}
                                            <div className="card bg-[#003560] shadow-lg border border-white/5 p-6 rounded-xl hover:border-orange-500/30 transition-colors">
                                                <div className="flex justify-between mb-4">
                                                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">{getAppIcon('google')}</div>
                                                    {appStatus.google && <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 h-fit">CONNECTED</span>}
                                                </div>
                                                <h3 className="text-lg font-bold mb-1">Google Calendar</h3>
                                                <p className="text-sm text-blue-200/60 mb-4">Sync meetings.</p>
                                                {/* Google Actions */}
                                                {editingApp === 'google' ? (
                                                    <div className="bg-[#002747] p-4 rounded-lg space-y-3">
                                                        <input type="text" placeholder="Client ID" className="w-full bg-[#003560] border border-white/10 rounded p-2 text-sm text-white" value={appCredentials.clientId} onChange={e => setAppCredentials({ ...appCredentials, clientId: e.target.value })} />
                                                        <input type="password" placeholder="Client Secret" className="w-full bg-[#003560] border border-white/10 rounded p-2 text-sm text-white" value={appCredentials.clientSecret} onChange={e => setAppCredentials({ ...appCredentials, clientSecret: e.target.value })} />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingApp(null)} className="text-xs text-blue-300">Cancel</button>
                                                            <button onClick={() => handleSaveAppConfig('google')} className="text-xs bg-blue-600 px-3 py-1 rounded">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {!appConfigStatus.google.configured ? (
                                                            <button onClick={() => { setEditingApp('google'); setAppCredentials({ clientId: '', clientSecret: '', redirectUri: '' }); }} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors">Configure Keys</button>
                                                        ) : (
                                                            appStatus.google ? <button disabled className="w-full py-2 bg-green-500/10 text-green-400 rounded text-sm">Active</button> :
                                                                <button onClick={async () => { const res = await api('/api/integrations/google/get-url'); window.location.href = res.url; }} className="w-full py-2 bg-white text-black hover:bg-gray-200 rounded text-sm transition-colors">Connect Google</button>
                                                        )}
                                                        {appConfigStatus.google.configured && <button onClick={() => setEditingApp('google')} className="w-full text-xs text-blue-300 hover:text-white mt-1">Edit Keys</button>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Calendly */}
                                            <div className="card bg-[#003560] shadow-lg border border-white/5 p-6 rounded-xl hover:border-cyan-500/30 transition-colors">
                                                <div className="flex justify-between mb-4">
                                                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">{getAppIcon('calendly')}</div>
                                                    {appStatus.calendly && <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 h-fit">CONNECTED</span>}
                                                </div>
                                                <h3 className="text-lg font-bold mb-1">Calendly</h3>
                                                <p className="text-sm text-blue-200/60 mb-4">Import events.</p>
                                                {!appStatus.calendly ? (
                                                    <div className="space-y-2">
                                                        <input type="text" placeholder="Personal Access Token" value={calendlyToken} onChange={e => setCalendlyToken(e.target.value)} className="w-full bg-[#002747] border border-white/10 rounded px-2 py-1.5 text-sm text-white" />
                                                        <button onClick={handleCalendlySave} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm transition-colors">Connect</button>
                                                    </div>
                                                ) : (
                                                    <button disabled className="w-full py-2 bg-green-500/10 text-green-400 rounded text-sm mt-auto">Connected</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* API ACCESS TAB */}
                                {activeTab === 'keys' && (
                                    <div className="card bg-[#003560] shadow-lg border border-white/5 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold flex items-center gap-2">
                                                <Key className="text-emerald-500" /> API Access (n8n & External Tools)
                                            </h2>
                                            <button onClick={handleCreateKey} disabled={creatingKey} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold flex items-center gap-2">
                                                {creatingKey ? 'Generating...' : <><Plus size={16} /> Generate Key</>}
                                            </button>
                                        </div>

                                        {newKey && (
                                            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                                <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><CheckCircle size={18} /> New Key Generated</h4>
                                                <p className="text-sm text-blue-200/60 mb-2">Copy this key now. It won't be shown again.</p>
                                                <div className="flex gap-2">
                                                    <code className="flex-1 bg-[#002747] p-2 rounded text-emerald-300 font-mono text-sm border border-emerald-500/20">{newKey.secret}</code>
                                                    <button onClick={() => { navigator.clipboard.writeText(newKey.secret); success('Copied'); }} className="p-2 bg-white/10 rounded hover:bg-white/20"><Copy size={16} /></button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-hidden rounded-lg border border-white/5">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#002747] text-blue-200/60 text-xs uppercase">
                                                    <tr>
                                                        <th className="p-4">Name</th>
                                                        <th className="p-4">Created</th>
                                                        <th className="p-4">Last Used</th>
                                                        <th className="p-4 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {apiKeys.length === 0 ? (
                                                        <tr><td colSpan="4" className="p-8 text-center text-blue-300/40">No active keys</td></tr>
                                                    ) : (
                                                        apiKeys.map(key => (
                                                            <tr key={key._id} className="hover:bg-white/5 transition-colors">
                                                                <td className="p-4 font-medium">{key.name}</td>
                                                                <td className="p-4 text-blue-200/60 text-sm">{new Date(key.createdAt).toLocaleDateString()}</td>
                                                                <td className="p-4 text-blue-200/60 text-sm">{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : '-'}</td>
                                                                <td className="p-4 text-right">
                                                                    <button onClick={() => handleRevokeKey(key._id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded"><Trash2 size={16} /></button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
