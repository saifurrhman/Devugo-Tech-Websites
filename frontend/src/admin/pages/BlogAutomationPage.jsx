import React, { useState, useEffect } from 'react';
import { Loader2, Settings, Check, X, Clock, Plus, ArrowLeft, Calendar, BarChart2, Trophy, Minus, Hash } from 'lucide-react';
import { SettingsAPI, BlogAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { Link, useNavigate } from 'react-router-dom';

export default function BlogAutomationPage() {
    const { success, error: notifyError } = useNotification();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        allTime: 0
    });

    const [config, setConfig] = useState({
        isAutomationEnabled: false,
        postsPerDay: 1,
        publishTimes: ['09:00'],
        saveAsDraft: true,
        topics: '',
        selectedAgentId: ''
    });
    const [newTime, setNewTime] = useState('');
    const [availableAgents, setAvailableAgents] = useState([]);

    useEffect(() => {
        document.title = 'Blog Automation Settings - Devugo Tech';
        fetchConfig();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const data = await BlogAPI.getAutomationStats();
            if (data) {
                setStats({
                    today: data.today || 0,
                    thisWeek: data.thisWeek || 0,
                    thisMonth: data.thisMonth || 0,
                    allTime: data.allTime || 0,
                    last7Days: data.last7Days || []
                });
            }
        } catch (error) {
            console.error('Failed to load stats', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const [data, aiSettings] = await Promise.all([
                SettingsAPI.getBlogAutomation(),
                SettingsAPI.getAI()
            ]);
            
            if (aiSettings && aiSettings.agents) {
                const agents = aiSettings.agents.filter(a => a.scope === 'blog' || a.scope === 'all');
                setAvailableAgents(agents);
            }

            if (data) {
                setConfig({
                    isAutomationEnabled: !!data.isAutomationEnabled,
                    postsPerDay: data.postsPerDay || 1,
                    publishTimes: Array.isArray(data.publishTimes) ? data.publishTimes : ['09:00'],
                    saveAsDraft: data.saveAsDraft !== undefined ? data.saveAsDraft : true,
                    topics: data.topics || '',
                    selectedAgentId: data.selectedAgentId || ''
                });
            }
        } catch (error) {
            console.error('Fetch config error:', error);
            notifyError('Failed to load automation settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (config.isAutomationEnabled) {
            if (config.publishTimes.length !== config.postsPerDay) {
                notifyError(`Please add exactly ${config.postsPerDay} publish times to match your posts per day.`);
                return;
            }
        }

        setSaving(true);
        try {
            await SettingsAPI.updateBlogAutomation(config);
            success('Automation settings saved successfully');
        } catch (error) {
            notifyError(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addTime = () => {
        if (!newTime) return;
        if (config.publishTimes.includes(newTime)) {
            notifyError('Time already exists');
            return;
        }
        setConfig(prev => ({ ...prev, publishTimes: [...prev.publishTimes, newTime].sort() }));
        setNewTime('');
    };

    const removeTime = (t) => {
        setConfig(prev => ({ ...prev, publishTimes: prev.publishTimes.filter(time => time !== t) }));
    };

    const handlePostsPerDayChange = (newVal) => {
        let val = parseInt(newVal) || 1;
        if (val < 1) val = 1;
        if (val > 10) val = 10;
        
        let newTimes = [...config.publishTimes];
        if (val > newTimes.length) {
            const defaults = ['09:00', '14:00', '19:00', '12:00', '17:00', '10:00', '15:00', '20:00', '11:00', '16:00'];
            for (let i = newTimes.length; i < val; i++) {
                const t = defaults.find(d => !newTimes.includes(d)) || `0${(8+i)%24}:00`.slice(-5);
                newTimes.push(t);
            }
            newTimes.sort();
        } else if (val < newTimes.length) {
            newTimes = newTimes.slice(0, val);
        }

        setConfig(prev => ({ ...prev, postsPerDay: val, publishTimes: newTimes }));
    };

    const incrementPosts = () => {
        if (config.postsPerDay < 10) handlePostsPerDayChange(config.postsPerDay + 1);
    };

    const decrementPosts = () => {
        if (config.postsPerDay > 1) handlePostsPerDayChange(config.postsPerDay - 1);
    };

    return (
        <div className="admin-layout bg-[#020b14] text-gray-200">
            <AdminSidebar />
            
            <main className="admin-content relative pb-24">
                <AdminTopbar />
                
                <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto space-y-8">
                        
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => navigate('/admin/blog')}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 text-gray-300 hover:text-white flex items-center justify-center"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Automation Settings</h1>
                                    <p className="text-sm text-gray-400 mt-1">Configure your AI blog post generation flow</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Today */}
                            <div className="bg-[#051426] border-l-4 border-l-teal-500 border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Calendar size={80} className="text-teal-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="p-2 bg-teal-500/10 rounded-lg">
                                        <Calendar size={18} className="text-teal-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">Generated Today</span>
                                </div>
                                <div className="relative z-10">
                                    {statsLoading ? (
                                        <Loader2 className="animate-spin text-teal-500" size={24} />
                                    ) : (
                                        <span className="text-3xl font-bold text-white tracking-tight">{stats.today}</span>
                                    )}
                                </div>
                            </div>

                            {/* This Week */}
                            <div className="bg-[#051426] border-l-4 border-l-blue-500 border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BarChart2 size={80} className="text-blue-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <BarChart2 size={18} className="text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">This Week</span>
                                </div>
                                <div className="relative z-10">
                                    {statsLoading ? (
                                        <Loader2 className="animate-spin text-blue-500" size={24} />
                                    ) : (
                                        <span className="text-3xl font-bold text-white tracking-tight">{stats.thisWeek}</span>
                                    )}
                                </div>
                            </div>

                            {/* This Month */}
                            <div className="bg-[#051426] border-l-4 border-l-purple-500 border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Hash size={80} className="text-purple-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Hash size={18} className="text-purple-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">This Month</span>
                                </div>
                                <div className="relative z-10">
                                    {statsLoading ? (
                                        <Loader2 className="animate-spin text-purple-500" size={24} />
                                    ) : (
                                        <span className="text-3xl font-bold text-white tracking-tight">{stats.thisMonth}</span>
                                    )}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-[#051426] border-l-4 border-l-amber-500 border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Trophy size={80} className="text-amber-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Trophy size={18} className="text-amber-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">Total Auto-Generated</span>
                                </div>
                                <div className="relative z-10">
                                    {statsLoading ? (
                                        <Loader2 className="animate-spin text-amber-500" size={24} />
                                    ) : (
                                        <span className="text-3xl font-bold text-white tracking-tight">{stats.allTime}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Configuration Section */}
                        <div className="bg-[#051426] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                                <div className="p-2 bg-teal-500/20 rounded-lg">
                                    <Settings className="text-teal-400" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Automation Configuration</h2>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="animate-spin text-teal-500" size={32} />
                                </div>
                            ) : (
                                <div className="p-6">
                                    {/* Split Grid for Config */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        
                                        {/* LEFT COLUMN */}
                                        <div className="space-y-6">
                                            {/* Enable Toggle */}
                                            <div className="bg-[#081a2f] border border-white/5 rounded-xl p-6 flex items-center justify-between transition-colors hover:border-white/10 shadow-inner">
                                                <div>
                                                    <h3 className="text-white font-medium text-base mb-1">Enable Auto-Publishing</h3>
                                                    <p className="text-sm text-gray-400">Automatically generate and save blog posts daily</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={config.isAutomationEnabled} 
                                                        onChange={(e) => setConfig({ ...config, isAutomationEnabled: e.target.checked })} 
                                                    />
                                                    <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                                </label>
                                            </div>

                                            <div className={`transition-opacity duration-300 space-y-6 ${!config.isAutomationEnabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                                
                                                {/* Posts Per Day Stepper */}
                                                <div className="bg-[#081a2f] border border-white/5 rounded-xl p-6 shadow-inner">
                                                    <label className="block text-sm font-medium text-gray-200 mb-4">How many blog posts per day?</label>
                                                    <div className="flex items-center gap-4 bg-[#051426] border border-white/10 rounded-lg p-2 w-fit">
                                                        <button 
                                                            onClick={decrementPosts}
                                                            className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                                                            disabled={config.postsPerDay <= 1}
                                                        >
                                                            <Minus size={18} />
                                                        </button>
                                                        
                                                        <div className="w-12 text-center text-xl font-bold text-white select-none">
                                                            {config.postsPerDay}
                                                        </div>

                                                        <button 
                                                            onClick={incrementPosts}
                                                            className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                                                            disabled={config.postsPerDay >= 10}
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-3">
                                                        System will generate this many posts automatically each day (min: 1, max: 10).
                                                    </p>
                                                </div>

                                                {/* Select AI Agent */}
                                                <div className="bg-[#081a2f] border border-white/5 rounded-xl p-6 shadow-inner">
                                                    <label className="block text-sm font-medium text-gray-200 mb-3">Select AI Agent</label>
                                                    <div className="relative">
                                                        <select
                                                            value={config.selectedAgentId}
                                                            onChange={e => setConfig({ ...config, selectedAgentId: e.target.value })}
                                                            className="w-full bg-[#051426] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm appearance-none"
                                                        >
                                                            <option value="">-- Default (System Fallback) --</option>
                                                            {availableAgents.map(agent => (
                                                                <option key={agent._id || agent.name} value={agent._id || agent.name}>
                                                                    {agent.name} {agent.scope ? `(${agent.scope})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-3">
                                                        Choose which external AI agent webhook should handle this automation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN */}
                                        <div className={`space-y-6 transition-opacity duration-300 ${!config.isAutomationEnabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                            
                                            {/* Action Type */}
                                            <div className="bg-[#081a2f] border border-white/5 rounded-xl p-6 shadow-inner">
                                                <label className="block text-sm font-medium text-gray-200 mb-4">After generation:</label>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${config.saveAsDraft ? 'bg-teal-500/10 border-teal-500/50 text-teal-400' : 'bg-[#051426] border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                                        <input 
                                                            type="radio" 
                                                            name="saveAs" 
                                                            checked={config.saveAsDraft}
                                                            onChange={() => setConfig({ ...config, saveAsDraft: true })}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${config.saveAsDraft ? 'border-teal-500' : 'border-gray-500'}`}>
                                                            {config.saveAsDraft && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
                                                        </div>
                                                        <span className="text-sm font-medium">Save as Draft</span>
                                                    </label>
                                                    
                                                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${!config.saveAsDraft ? 'bg-teal-500/10 border-teal-500/50 text-teal-400' : 'bg-[#051426] border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                                        <input 
                                                            type="radio" 
                                                            name="saveAs" 
                                                            checked={!config.saveAsDraft}
                                                            onChange={() => setConfig({ ...config, saveAsDraft: false })}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!config.saveAsDraft ? 'border-teal-500' : 'border-gray-500'}`}>
                                                            {!config.saveAsDraft && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
                                                        </div>
                                                        <span className="text-sm font-medium">Publish Now</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Schedule Times */}
                                            <div className="bg-[#081a2f] border border-white/5 rounded-xl p-6 shadow-inner">
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="block text-sm font-medium text-gray-200">Publish Times (Every day)</label>
                                                    <span className="text-xs px-2.5 py-1 bg-white/10 rounded-md text-gray-300 font-medium">
                                                        {config.publishTimes.length} / {config.postsPerDay}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {config.publishTimes.map(time => (
                                                        <div key={time} className="flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-lg border border-teal-500/30 text-sm font-medium">
                                                            <Clock size={14} />
                                                            {time}
                                                            <button onClick={() => removeTime(time)} className="hover:text-red-400 ml-2 transition-colors p-1 -mr-1 rounded-md hover:bg-red-400/20">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {config.publishTimes.length === 0 && (
                                                        <span className="text-sm text-gray-500 italic py-2 px-1">No times scheduled</span>
                                                    )}
                                                </div>

                                                {config.publishTimes.length !== config.postsPerDay && (
                                                    <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                                                        <div className="text-red-400 mt-0.5">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                        </div>
                                                        <p className="text-sm text-red-300">
                                                            Please add exactly {config.postsPerDay} publish times (currently {config.publishTimes.length}).
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-3">
                                                    <input 
                                                        type="time" 
                                                        value={newTime} 
                                                        onChange={e => setNewTime(e.target.value)}
                                                        className="bg-[#051426] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                    />
                                                    <button 
                                                        onClick={addTime} 
                                                        disabled={!newTime || config.publishTimes.length >= config.postsPerDay}
                                                        className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                                    >
                                                        <Plus size={16} /> Add Time
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Topics */}
                                            <div className="bg-[#081a2f] border border-white/5 rounded-xl p-6 shadow-inner">
                                                <label className="block text-sm font-medium text-gray-200 mb-3">Target Topics / Keywords</label>
                                                <textarea
                                                    value={config.topics}
                                                    onChange={e => setConfig({ ...config, topics: e.target.value })}
                                                    placeholder="e.g. Artificial Intelligence, SaaS Trends, Web Development..."
                                                    className="w-full bg-[#051426] border border-white/10 rounded-lg p-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm min-h-[120px] resize-y placeholder-gray-600"
                                                />
                                                <p className="text-xs text-gray-500 mt-3">
                                                    Comma separated. AI will randomly pick one of these for each post. Leave blank for general topics.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                {/* STICKY BOTTOM BAR */}
                <div className="sticky bottom-0 z-20 bg-[#020b14]/90 backdrop-blur-md border-t border-white/10 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex justify-end gap-4 px-6 md:px-12 w-full mt-8">
                    <button
                        onClick={() => navigate('/admin/blog')}
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading || (config.isAutomationEnabled && config.publishTimes.length !== config.postsPerDay)}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-500/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                        Save Settings
                    </button>
                </div>
            </main>
        </div>
    );
}
