import React, { useState, useEffect } from 'react';
import { Loader2, Settings, Check, X, Clock, Plus, Trash2 } from 'lucide-react';
import { SettingsAPI } from '../lib/api';
import { useNotification } from '../contexts/NotificationContext';

export default function BlogAutomationModal({ isOpen, onClose }) {
    const { success, error: notifyError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        isAutomationEnabled: false,
        publishTimes: ['09:00'],
        saveAsDraft: true,
        topics: '',
        selectedAgentId: ''
    });
    const [newTime, setNewTime] = useState('');
    const [availableAgents, setAvailableAgents] = useState([]);

    useEffect(() => {
        if (isOpen) fetchConfig();
    }, [isOpen]);

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
                    publishTimes: Array.isArray(data.publishTimes) ? data.publishTimes : ['09:00'],
                    saveAsDraft: data.saveAsDraft !== undefined ? data.saveAsDraft : true,
                    topics: data.topics || '',
                    selectedAgentId: data.selectedAgentId || ''
                });
            }
        } catch (error) {
            notifyError('Failed to load automation settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (config.publishTimes.length === 0 && config.isAutomationEnabled) {
            notifyError('Please add at least one publish time');
            return;
        }

        setSaving(true);
        try {
            await SettingsAPI.updateBlogAutomation(config);
            success('Automation settings saved successfully');
            onClose();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#002747] rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2 text-white">
                        <Settings className="text-blue-400" size={20} />
                        <h2 className="font-semibold text-lg">Blog Automation Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Enable Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <div>
                                    <h3 className="text-white font-medium">Enable Auto-Publishing</h3>
                                    <p className="text-sm text-gray-400">Automatically generate and save blog posts daily</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={config.isAutomationEnabled} 
                                        onChange={(e) => setConfig({ ...config, isAutomationEnabled: e.target.checked })} 
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>

                            {config.isAutomationEnabled && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {/* Select AI Agent */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Select AI Agent</label>
                                        <select
                                            value={config.selectedAgentId}
                                            onChange={e => setConfig({ ...config, selectedAgentId: e.target.value })}
                                            className="w-full bg-[#003560] border border-white/10 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none text-sm"
                                        >
                                            <option value="">-- Default (System Fallback) --</option>
                                            {availableAgents.map(agent => (
                                                <option key={agent._id || agent.name} value={agent._id || agent.name}>
                                                    {agent.name} {agent.scope ? `(${agent.scope})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Choose which external AI agent webhook should handle this automation.
                                        </p>
                                    </div>

                                    {/* Action Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">After generation:</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="saveAs" 
                                                    checked={config.saveAsDraft}
                                                    onChange={() => setConfig({ ...config, saveAsDraft: true })}
                                                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-600 focus:ring-2"
                                                />
                                                Save as Draft (Recommended)
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="saveAs" 
                                                    checked={!config.saveAsDraft}
                                                    onChange={() => setConfig({ ...config, saveAsDraft: false })}
                                                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-600 focus:ring-2"
                                                />
                                                Publish Immediately
                                            </label>
                                        </div>
                                    </div>

                                    {/* Schedule Times */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Publish Times (Every day)</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {config.publishTimes.map(time => (
                                                <div key={time} className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/30 text-sm">
                                                    <Clock size={14} />
                                                    {time}
                                                    <button onClick={() => removeTime(time)} className="hover:text-red-400 ml-1"><X size={14} /></button>
                                                </div>
                                            ))}
                                            {config.publishTimes.length === 0 && (
                                                <span className="text-sm text-gray-500 italic">No times scheduled</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="time" 
                                                value={newTime} 
                                                onChange={e => setNewTime(e.target.value)}
                                                className="bg-[#003560] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                            />
                                            <button 
                                                onClick={addTime} 
                                                disabled={!newTime}
                                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Plus size={16} /> Add Time
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            The system will automatically generate a new blog post at each scheduled time using your n8n AI webhook.
                                        </p>
                                    </div>

                                    {/* Topics */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Topics / Keywords (Comma separated)</label>
                                        <textarea
                                            value={config.topics}
                                            onChange={e => setConfig({ ...config, topics: e.target.value })}
                                            placeholder="e.g. Artificial Intelligence, SaaS Trends, Web Development, Future of Tech"
                                            className="w-full bg-[#003560] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none text-sm min-h-[100px]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            If provided, the AI will randomly pick one of these topics for each auto-generated post. If left blank, it will choose a general industry topic.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={saving || loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
