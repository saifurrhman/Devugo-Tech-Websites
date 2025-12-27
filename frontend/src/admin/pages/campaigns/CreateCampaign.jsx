import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, CheckCircle, Upload, Sparkles, Calendar, ArrowRight, ArrowLeft
} from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import CustomSelect from '../../../components/CustomSelect';
import AIPanel from '../../../components/AIPanel';
import RichTextEditor from '../../components/RichTextEditor';
import { CampaignAPI, TemplateAPI, ContactAPI, AIAPI, SenderAPI, ListAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const { success, error } = useNotification();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTargetField, setAiTargetField] = useState(null); // 'subject', 'content', 'followup'

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    previewText: '', // preheader
    senderName: '',
    senderEmail: '', // Let user select or default to first loaded
    replyTo: '',
    audienceList: [], // List IDs
    audienceCsv: null,
    templateId: '',
    contentHtml: '',
    enableFollowUp: false,
    followUpSubject: '',
    followUpBody: '',
    followUpDelay: 3, // Days
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: '',
    individualEmail: '',
  });

  const [lists, setLists] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [senders, setSenders] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [tplData, contactData, senderData, listData] = await Promise.all([
        TemplateAPI.list(),
        ContactAPI.list(),
        SenderAPI.list(),
        ListAPI.list()
      ]);

      setTemplates(Array.isArray(tplData) ? tplData : (tplData.data || []));

      const loadedSenders = Array.isArray(senderData) ? senderData : (senderData.data || []);
      setSenders(loadedSenders);

      const loadedLists = Array.isArray(listData) ? listData : (listData.data || []);
      setCustomLists(loadedLists);

      // Auto-select first sender if none selected
      if (loadedSenders.length > 0 && !formData.senderEmail) {
        setFormData(prev => ({ ...prev, senderEmail: loadedSenders[0].email }));
      }

      const rawContacts = Array.isArray(contactData) ? contactData : (contactData.data || []);
      const verified = rawContacts.filter(c => c.status === 'Verified').length;

      setLists([
        { _id: 'all', name: 'All Subscribers', count: rawContacts.length, icon: Users },
        { _id: 'verified', name: 'Verified Only', count: verified, icon: CheckCircle },
      ]);

      if (campaignId) {
        // Here we could load existing campaign data
        // const existing = await CampaignAPI.get(campaignId);
        // setFormData(existing);
      }
    } catch (e) {
      console.error(e);
      // Fallback if APIs fail
      setLists([
        { _id: 'all', name: 'All Subscribers', count: 0, icon: Users },
        { _id: 'verified', name: 'Verified Only', count: 0, icon: CheckCircle }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // --- Handlers ---

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }



  // AI Handlers
  function openAI(target) {
    setAiTargetField(target);
    if (target === 'subject') {
      setAiPrompt(`Generate 5 catchy subject lines for an email campaign about: ${formData.name}`);
    } else if (target === 'content') {
      setAiPrompt(`Write a professional email body for a campaign named "${formData.name}". Goal: Sales. Tone: Professional.`);
    } else if (target === 'followup') {
      setAiPrompt(`Write a polite follow-up email for "${formData.name}" sent 3 days ago. Ask if they have questions.`);
    }
    setAiPanelOpen(true);
  }

  async function handleAIGenerate(promptText) {
    try {
      const res = await AIAPI.generate({
        action: 'campaign', // General campaign action for text gen
        goal: formData.name,
        audience: 'Subscribers',
        tone: 'Professional',
        service: 'Devugo Tech',
        customPrompt: promptText // Pass custom prompt if backend supports it or relies on action context
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  function handleAIAccept(content) {
    if (aiTargetField === 'subject') {
      // Helper: if AI returns complex structure or list, just take raw string for now
      // ideally we'd parse or let user select from list in AIPanel if it returned an array
      setFormData(prev => ({ ...prev, subject: typeof content === 'string' ? content : JSON.stringify(content) }));
    } else if (aiTargetField === 'content') {
      setFormData(prev => ({ ...prev, contentHtml: typeof content === 'string' ? content : content.body || '' }));
    } else if (aiTargetField === 'followup') {
      setFormData(prev => ({ ...prev, followUpBody: typeof content === 'string' ? content : content.body || '' }));
    }
    setAiPanelOpen(false);
  }

  // --- Wizard Navigation ---
  function nextStep() {
    if (step < 4) setStep(step + 1);
  }
  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  async function handleLaunch() {
    setLoading(true);
    try {
      await CampaignAPI.create({
        ...formData,
        audience: formData.audienceList,
        status: formData.scheduleType === 'now' ? 'sending' : 'scheduled'
      });
      success('Campaign launched successfully!');
      navigate('/admin/campaigns');
    } catch (e) {
      error('Failed to launch campaign');
    } finally {
      setLoading(false);
    }
  }

  // --- Render Steps ---

  const renderStepIndicator = () => {
    const steps = ['Basics', 'Content', 'Follow-ups', 'Schedule'];
    return (
      <div
        className="w-full max-w-4xl mx-auto mb-12 px-2 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center justify-between relative min-w-[300px] py-4">
          {steps.map((label, idx) => {
            const num = idx + 1;
            const isCompleted = step > num;
            const isActive = step === num;
            const isLast = idx === steps.length - 1;

            return (
              <React.Fragment key={label}>
                {/* Step Circle & Label */}
                <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => step > num ? setStep(num) : null}>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg border-2 transition-all duration-300 ${isActive
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110'
                      : isCompleted
                        ? 'bg-[#0f172a] border-blue-500 text-blue-500'
                        : 'bg-[#0f172a] border-gray-700 text-gray-500'
                      }`}
                  >
                    {isCompleted ? <CheckCircle size={18} /> : num}
                  </div>
                  <span
                    className={`absolute -bottom-8 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-blue-400' : 'text-gray-600'} ${isActive ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}
                  >
                    {label}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-2 sm:mx-4 h-[2px] bg-gray-800 relative rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="max-w-5xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{campaignId ? 'Edit Campaign' : 'Create Campaign'}</h1>
              <p className="text-gray-400 text-sm">Design, target, and schedule your email campaign.</p>
            </div>
            <button onClick={() => navigate('/admin/campaigns')} className="text-gray-400 hover:text-white text-sm">Cancel</button>
          </div>

          {renderStepIndicator()}

          <div className="bg-[#003560] border border-white/10 rounded-xl p-4 sm:p-8 min-h-[400px] shadow-xl">

            {/* STEP 1: BASICS */}
            {step === 1 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Campaign Basics</h2>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. Winter Sale 2024"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sender Name</label>
                    <input
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                      placeholder="Devugo Team"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sender Email</label>
                    {senders.filter(s => s.status === 'verified').length > 0 ? (
                      <CustomSelect
                        value={formData.senderEmail}
                        onChange={(val) => setFormData(prev => ({ ...prev, senderEmail: val }))}
                        options={senders
                          .filter(s => s.status === 'verified')
                          .map(sender => ({ value: sender.email, label: sender.email }))
                        }
                        placeholder="Select a verified sender..."
                      />
                    ) : (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-yellow-400 text-sm">No verified senders found.</span>
                        <button
                          onClick={() => navigate('/admin/settings/senders')}
                          className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded transition-colors"
                        >
                          Add & Verify Sender
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Only verified emails can be used as senders. <button onClick={() => navigate('/admin/settings/senders')} className="text-blue-400 hover:underline">Manage Senders</button>
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-300">Audience</label>
                    <button
                      onClick={() => navigate('/admin/recipients/upload?returnUrl=/admin/campaigns/create')}
                      className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline transition-all"
                    >
                      <Upload size={14} /> Import from CSV
                    </button>
                  </div>
                  <CustomSelect
                    value={formData.audienceList[0] || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, audienceList: val ? [val] : [] }))}
                    placeholder="Select Audience..."
                    groups={true}
                    options={[
                      {
                        label: 'Presets',
                        options: [
                          ...lists.map(list => ({
                            value: list._id,
                            label: `${list.name} (${list.count} contacts)`
                          })),
                          { value: 'custom_email', label: 'Individual Email (Manual)' }
                        ]
                      },
                      ...(customLists.length > 0 ? [{
                        label: 'Your Lists',
                        options: customLists.map(list => ({
                          value: list._id,
                          label: `${list.name} (${list.count} contacts)`
                        }))
                      }] : [])
                    ]}
                  />

                  {formData.audienceList.includes('custom_email') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Target Email Address</label>
                      <input
                        type="email"
                        name="individualEmail"
                        value={formData.individualEmail || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                        placeholder="recipient@example.com"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">This campaign will only be sent to this single email.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: CONTENT */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                  <h2 className="text-xl font-bold text-white">Email Content</h2>
                  <button
                    onClick={() => openAI('content')}
                    className="flex items-center gap-2 text-sm bg-purple-600/20 text-purple-400 px-3 py-1.5 rounded-full hover:bg-purple-600/30 transition-colors"
                  >
                    <Sparkles size={14} /> AI Generator
                  </button>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject Line</label>
                  <div className="flex gap-2">
                    <input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="flex-1 bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                      placeholder="Why we build for scale..."
                    />
                    <button onClick={() => openAI('subject')} className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-purple-400 hover:border-purple-500 transition-colors" title="Generate Subjects">
                      <Sparkles size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <label className="block text-sm font-medium text-gray-300">Body Content</label>
                    <RichTextEditor
                      value={formData.contentHtml}
                      onChange={(html) => setFormData(p => ({ ...p, contentHtml: html }))}
                      placeholder="Hello {{name}}, Write your email content here..."
                    />
                    <p className="text-xs text-gray-500">Supports HTML. Use <strong>{'{{name}}'}</strong> for personalization.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">Templates</label>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      <button
                        className="w-full p-3 border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center gap-2"
                        onClick={() => setFormData(p => ({ ...p, contentHtml: '' }))}
                      >
                        Start from Scratch
                      </button>
                      {templates.map(tpl => (
                        <div
                          key={tpl._id}
                          onClick={() => setFormData(p => ({ ...p, templateId: tpl._id, contentHtml: tpl.content || `[Template: ${tpl.name}]` }))}
                          className={`p-3 border rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-colors ${formData.templateId === tpl._id ? 'border-blue-500' : 'border-gray-700'}`}
                        >
                          <div className="h-24 bg-gray-900 rounded mb-2 overflow-hidden relative group">
                            {tpl.preview ? (
                              <img src={tpl.preview} alt={tpl.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-600">No Preview</div>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-white">{tpl.name}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FOLLOW-UPS */}
            {step === 3 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Automated Follow-ups</h2>

                <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                  <div>
                    <h3 className="font-bold text-white">Enable Follow-up</h3>
                    <p className="text-sm text-gray-400">Automatically send a second email if they don't reply.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.enableFollowUp} onChange={(e) => setFormData(p => ({ ...p, enableFollowUp: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.enableFollowUp && (
                  <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 space-y-4 relative">
                    <div className="absolute top-4 right-4">
                      <button onClick={() => openAI('followup')} className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300">
                        <Sparkles size={12} /> AI Suggest
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-300">Send if no reply after</label>
                      <select
                        value={formData.followUpDelay}
                        onChange={handleInputChange}
                        name="followUpDelay"
                        className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white text-sm focus:border-blue-500 outline-none"
                      >
                        <option value="2">2 Days</option>
                        <option value="3">3 Days</option>
                        <option value="5">5 Days</option>
                        <option value="7">7 Days</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Follow-up Subject</label>
                      <input
                        name="followUpSubject"
                        value={formData.followUpSubject}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border-gray-700 rounded-lg p-3 text-white text-sm"
                        placeholder="Re: Previous email..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Follow-up Body</label>
                      <textarea
                        name="followUpBody"
                        value={formData.followUpBody}
                        onChange={handleInputChange}
                        className="w-full h-32 bg-gray-900 border-gray-700 rounded-lg p-3 text-white text-sm font-mono"
                        placeholder="Before I close my file..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SCHEDULE */}
            {step === 4 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Schedule & Review</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData(p => ({ ...p, scheduleType: 'now' }))}
                    className={`p-6 border rounded-xl flex flex-col items-center gap-3 transition-all ${formData.scheduleType === 'now' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                      }`}
                  >
                    <Sparkles size={32} className={formData.scheduleType === 'now' ? 'text-blue-400' : ''} />
                    <span className="font-bold">Send Now</span>
                  </button>
                  <button
                    onClick={() => setFormData(p => ({ ...p, scheduleType: 'scheduled' }))}
                    className={`p-6 border rounded-xl flex flex-col items-center gap-3 transition-all ${formData.scheduleType === 'scheduled' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                      }`}
                  >
                    <Calendar size={32} className={formData.scheduleType === 'scheduled' ? 'text-blue-400' : ''} />
                    <span className="font-bold">Schedule</span>
                  </button>
                </div>

                {formData.scheduleType === 'scheduled' && (
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <label className="block">
                      <span className="text-sm text-gray-400 mb-1 block">Date</span>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-400 mb-1 block">Time</span>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                      />
                    </label>
                  </div>
                )}

                <div className="bg-gray-900/50 p-6 rounded-xl space-y-3 text-sm border border-gray-800">
                  <h3 className="font-bold text-gray-300 uppercase tracking-wider text-xs mb-2">Summary</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subject</span>
                    <span className="text-white font-medium text-right truncate max-w-[200px]">{formData.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipients</span>
                    <span className="text-white font-medium">{formData.audienceList.length} lists selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Follow-up</span>
                    <span className="text-white font-medium">{formData.enableFollowUp ? `${formData.followUpDelay} Days delay` : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                disabled={loading}
                className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"
              >
                {loading ? 'Launching...' : `Launch Campaign 🚀`}
              </button>
            )}
          </div>
        </div>
      </main>

      <AIPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        prompt={aiPrompt}
        onGenerate={handleAIGenerate}
        onAccept={handleAIAccept}
      />
    </div>
  );
}