import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, Wand2, Loader2, X, Save, RotateCcw } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { TemplateAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import CustomSelect from '../../../components/CustomSelect';

export default function AITemplateGenerator() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();

    // Form State
    const [formData, setFormData] = useState({
        type: 'promotional', // newsletter, promotional, transactional, welcome, other
        goal: 'lead_generation', // lead_generation, sales, engagement, announcement
        tone: 'professional', // professional, friendly, urgent, witty
        language: 'english',
        prompt: ''
    });

    // UI State
    const [generating, setGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null); // { subject, body, followUp: { subject, body } }
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveName, setSaveName] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        if (!formData.prompt && !formData.type) {
            warning('Please describe what you want to generate');
            return;
        }

        setGenerating(true);
        try {
            console.log('🔄 Calling TemplateAPI.generateAI...', formData);
            // Call backend API
            const response = await TemplateAPI.generateAI(formData);

            if (response.success || response.data) {
                const data = response.data || response; // Adapt based on API wrapper return style
                setGeneratedContent(data);
                setShowPreview(true);
                success('Template generated successfully!');
            } else {
                error('Failed to generate template');
            }
        } catch (err) {
            console.error('Generation failed:', err);
            error('AI Generation failed. Using mock data for demo if API key is missing.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!saveName.trim()) {
            warning('Please give your template a name');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: saveName,
                subject: generatedContent.subject,
                htmlContent: generatedContent.body,
                category: formData.type,
                isActive: true
            };

            await TemplateAPI.create(payload);

            // If follow-up exists, maybe ask user if they want to save that too? 
            // For now, simpler flow: success and redirect.

            success('Template saved successfully!');
            navigate('/admin/templates');
        } catch (err) {
            console.error('Save failed:', err);
            error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="max-w-4xl mx-auto mb-10 mt-6">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 rounded-full bg-blue-600/10 mb-4 border border-blue-500/20">
                            <Bot size={40} className="text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3 text-white">
                            AI Email Generator
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Generate professional email templates and follow-ups in seconds using advanced AI.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel: Controls */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-5">
                                <h3 className="font-semibold mb-4 text-blue-400 flex items-center gap-2">
                                    <Sparkles size={16} /> Configuration
                                </h3>

                                <label className="block mb-3">
                                    <span className="text-sm text-gray-400 mb-1 block">Email Type</span>
                                    <CustomSelect
                                        value={formData.type}
                                        onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                                        options={[
                                            { value: 'newsletter', label: 'Newsletter' },
                                            { value: 'promotional', label: 'Promotional Offer' },
                                            { value: 'welcome', label: 'Welcome Email' },
                                            { value: 'transactional', label: 'Transactional' },
                                            { value: 'followup', label: 'Follow-up' }
                                        ]}
                                    />
                                </label>

                                <label className="block mb-3">
                                    <span className="text-sm text-gray-400 mb-1 block">Goal</span>
                                    <CustomSelect
                                        value={formData.goal}
                                        onChange={(val) => setFormData(prev => ({ ...prev, goal: val }))}
                                        options={[
                                            { value: 'lead_generation', label: 'Lead Generation' },
                                            { value: 'sales', label: 'Drive Sales' },
                                            { value: 'engagement', label: 'Engagement' },
                                            { value: 'announcement', label: 'Announcement' },
                                            { value: 'nurture', label: 'Nurture Relationship' }
                                        ]}
                                    />
                                </label>

                                <label className="block mb-3">
                                    <span className="text-sm text-gray-400 mb-1 block">Tone</span>
                                    <CustomSelect
                                        value={formData.tone}
                                        onChange={(val) => setFormData(prev => ({ ...prev, tone: val }))}
                                        options={[
                                            { value: 'professional', label: 'Professional' },
                                            { value: 'friendly', label: 'Friendly & Casual' },
                                            { value: 'urgent', label: 'Urgent / Scarcity' },
                                            { value: 'witty', label: 'Witty / Humorous' },
                                            { value: 'empathetic', label: 'Empathetic' }
                                        ]}
                                    />
                                </label>

                                <label className="block mb-3">
                                    <span className="text-sm text-gray-400 mb-1 block">Language</span>
                                    <CustomSelect
                                        value={formData.language}
                                        onChange={(val) => setFormData(prev => ({ ...prev, language: val }))}
                                        options={[
                                            { value: 'english', label: 'English' },
                                            { value: 'urdu', label: 'Urdu' },
                                            { value: 'spanish', label: 'Spanish' },
                                            { value: 'french', label: 'French' },
                                            { value: 'german', label: 'German' }
                                        ]}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Right Panel: Prompt & Action */}
                        <div className="lg:col-span-2">
                            <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-2 h-full flex flex-col">
                                <textarea
                                    name="prompt"
                                    value={formData.prompt}
                                    onChange={handleChange}
                                    placeholder="Describe your email specifically... e.g. 'Announce our new summer collection with 50% discount for early birds. Mention free shipping on orders over $50.'"
                                    className="w-full bg-[#0f172a] border-none rounded-lg p-4 text-white outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[200px] resize-none text-base flex-1"
                                ></textarea>

                                <div className="p-3 border-t border-gray-800 flex justify-end">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${generating
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                            }`}
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} /> Generating Magic...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={18} /> Generate My Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PREVIEW MODAL */}
                {showPreview && generatedContent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#1e293b] w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-[#0f172a]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">AI Result</h3>
                                        <p className="text-xs text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Content Generated Successfully
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                                {/* Email Preview Card */}
                                <div className="bg-white text-gray-900 rounded-lg shadow-sm overflow-hidden mb-6">
                                    <div className="bg-gray-50 px-4 py-3 border-b text-sm flex gap-2">
                                        <span className="text-gray-500 font-medium">Subject:</span>
                                        <span className="font-semibold text-gray-800">{generatedContent.subject}</span>
                                    </div>
                                    <div
                                        className="p-8 prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: generatedContent.body }}
                                    ></div>
                                </div>

                                {/* Follow Up Preview if available */}
                                {generatedContent.followUp && (
                                    <div className="mt-8">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Suggested Follow-up</h4>
                                        <div className="bg-white text-gray-900 rounded-lg shadow-sm overflow-hidden opacity-90">
                                            <div className="bg-gray-50 px-4 py-3 border-b text-sm flex gap-2">
                                                <span className="text-gray-500 font-medium">Subject:</span>
                                                <span className="font-semibold text-gray-800">{generatedContent.followUp.subject}</span>
                                            </div>
                                            <div
                                                className="p-6 prose max-w-none text-sm"
                                                dangerouslySetInnerHTML={{ __html: generatedContent.followUp.body }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-700 bg-[#0f172a] flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex-1 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={saveName}
                                        onChange={(e) => setSaveName(e.target.value)}
                                        placeholder="Enter template name to save..."
                                        className="w-full bg-[#1e293b] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGenerate}
                                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw size={16} /> Regenerate
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                    >
                                        <Save size={16} /> {saving ? 'Saving...' : 'Save Template'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
