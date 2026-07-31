import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { SettingsAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import Spinner from '../../components/Spinner';

const AGENT_SCOPES = [
  { value: 'all', label: 'General / Fallback (Use for everything)' },
  { value: 'campaigns', label: 'Campaign Generation Only' },
  { value: 'replies', label: 'Inbox Replies Only' },
  { value: 'leads', label: 'Lead Qualification Only' },
  { value: 'blog', label: 'Blog Post Generation Only' },
  { value: 'whatsapp', label: 'WhatsApp Auto Replies Only' },
];

const PLATFORMS = [
  { value: 'n8n', label: 'n8n' },
  { value: 'make', label: 'Make.com' },
  { value: 'zapier', label: 'Zapier' },
  { value: 'custom', label: 'Custom Webhook' },
];

const AI_MODELS = [
  { value: 'gemini-flash', label: 'Gemini Flash (Fast & Cheap)' },
  { value: 'gemini-pro', label: 'Gemini Pro (Advanced)' },
];

const DEFAULT_FORM = {
  geminiApiKey: '',
  chatbotApiKey: '',
  model: 'gemini-flash',
  strictFiltering: true,
  trainingData: '',
  pdfNames: [],
  agents: [],
};

const EMPTY_AGENT = {
  name: '',
  platform: 'n8n',
  scope: 'all',
  webhook: '',
  apiKey: '',
};

export default function AISettings() {
  const notify = useNotification();
  const [config, setConfig] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT);
  const [editingAgentIdx, setEditingAgentIdx] = useState(null);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showChatbotKey, setShowChatbotKey] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await SettingsAPI.getAI();
      if (data) setConfig({ ...DEFAULT_FORM, ...data, agents: data.agents || [] });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setConfig(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await SettingsAPI.updateAI(config);
      notify.success('AI Settings saved successfully!');
    } catch (e) {
      notify.error('Failed to save AI settings');
    }
    setSaving(false);
  }

  // ---- Agent Modal ----
  function openAddAgent() {
    setAgentForm(EMPTY_AGENT);
    setEditingAgentIdx(null);
    setShowAgentModal(true);
  }

  function openEditAgent(idx) {
    setAgentForm({ ...EMPTY_AGENT, ...config.agents[idx] });
    setEditingAgentIdx(idx);
    setShowAgentModal(true);
  }

  function saveAgent() {
    if (!agentForm.name.trim() || !agentForm.webhook.trim()) {
      notify.error('Agent name and webhook URL are required');
      return;
    }
    const agents = [...config.agents];
    if (editingAgentIdx !== null) {
      agents[editingAgentIdx] = agentForm;
    } else {
      agents.push(agentForm);
    }
    setConfig(c => ({ ...c, agents }));
    setShowAgentModal(false);
    notify.success(editingAgentIdx !== null ? 'Agent updated!' : 'Agent added!');
  }

  function deleteAgent(idx) {
    const agents = config.agents.filter((_, i) => i !== idx);
    setConfig(c => ({ ...c, agents }));
    notify.success('Agent removed');
  }

  // ---- PDF Upload ----
  async function onPdfUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('pdfs', f));
      const res = await fetch('/api/settings/ai/upload-pdf', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        notify.success('PDF training data uploaded!');
        await load();
      } else {
        notify.error(data.message || 'Upload failed');
      }
    } catch (err) {
      notify.error('PDF upload failed');
    }
    setUploadingPdf(false);
    e.target.value = '';
  }

  async function onClearTraining() {
    if (!window.confirm('Clear all AI training data?')) return;
    setClearingData(true);
    try {
      const res = await fetch('/api/settings/ai/clear-training', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const data = await res.json();
      if (data.success) {
        notify.success('Training data cleared!');
        await load();
      } else {
        notify.error(data.message);
      }
    } catch (e) {
      notify.error('Failed to clear training data');
    }
    setClearingData(false);
  }

  const getScopLabel = (val) => AGENT_SCOPES.find(s => s.value === val)?.label || val;
  const getPlatformLabel = (val) => PLATFORMS.find(p => p.value === val)?.label || val;

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Spinner />
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout" style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div style={{ maxWidth: '860px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              🤖 AI Configuration
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Configure Gemini API keys, AI model, external agents, and training data
            </p>
          </div>

          <form onSubmit={onSave}>
            {/* ─── API Keys ─── */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <span style={iconStyle}>🔑</span>
                <div>
                  <h2 style={cardTitleStyle}>API Keys</h2>
                  <p style={cardSubStyle}>Connect your Gemini API for AI features</p>
                </div>
              </div>
              <div style={cardBodyStyle}>
                <div style={formGridStyle}>
                  {/* Gemini API Key */}
                  <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Gemini API Key <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        name="geminiApiKey"
                        value={config.geminiApiKey || ''}
                        onChange={onChange}
                        placeholder="AIzaSy..."
                        style={{ ...inputStyle, paddingRight: '5rem', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(v => !v)}
                        style={showBtnStyle}
                      >
                        {showGeminiKey ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    <p style={hintStyle}>Get your key from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Google AI Studio</a></p>
                  </div>

                  {/* Chatbot API Key */}
                  <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Chatbot API Key <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>(Optional — overrides main key for chatbot)</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showChatbotKey ? 'text' : 'password'}
                        name="chatbotApiKey"
                        value={config.chatbotApiKey || ''}
                        onChange={onChange}
                        placeholder="AIzaSy... (optional)"
                        style={{ ...inputStyle, paddingRight: '5rem', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowChatbotKey(v => !v)}
                        style={showBtnStyle}
                      >
                        {showChatbotKey ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    <p style={hintStyle}>Use a separate key to isolate chatbot usage from other AI features</p>
                  </div>

                  {/* Model Selection */}
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>AI Model</label>
                    <select name="model" value={config.model || 'gemini-flash'} onChange={onChange} style={inputStyle}>
                      {AI_MODELS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Strict Filtering Toggle */}
                  <div style={{ ...formGroupStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <label style={labelStyle}>Strict Content Filtering</label>
                      <p style={{ ...hintStyle, marginTop: 0 }}>Block off-topic AI responses</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig(c => ({ ...c, strictFiltering: !c.strictFiltering }))}
                      style={{
                        width: '52px', height: '26px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        background: config.strictFiltering ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                        left: config.strictFiltering ? '26px' : '4px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── External Agents ─── */}
            <div style={cardStyle}>
              <div style={{ ...cardHeaderStyle, background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(109,40,217,0.08))' }}>
                <span style={{ ...iconStyle, background: '#7c3aed' }}>🔌</span>
                <div>
                  <h2 style={cardTitleStyle}>External AI Agents</h2>
                  <p style={cardSubStyle}>Connect n8n, Make.com, Zapier or custom webhooks to handle AI tasks</p>
                </div>
              </div>
              <div style={cardBodyStyle}>
                {config.agents.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.75rem', border: '2px dashed rgba(255,255,255,0.1)'
                  }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🤖</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      No agents connected yet. Add an agent to route AI tasks to external workflows.
                    </p>
                    <button type="button" onClick={openAddAgent} style={addAgentBtnStyle}>
                      + Add First Agent
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      {config.agents.map((agent, idx) => (
                        <div key={idx} style={agentCardStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <span style={{ fontSize: '1.5rem' }}>
                              {agent.platform === 'n8n' ? '⚡' : agent.platform === 'make' ? '🔄' : agent.platform === 'zapier' ? '⚡' : '🔗'}
                            </span>
                            <div>
                              <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{agent.name}</p>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                                {getPlatformLabel(agent.platform)} · {getScopLabel(agent.scope)}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button type="button" onClick={() => openEditAgent(idx)} style={iconBtnStyle('#3b82f6')}>Edit</button>
                            <button type="button" onClick={() => deleteAgent(idx)} style={iconBtnStyle('#ef4444')}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={openAddAgent} style={addAgentBtnStyle}>
                      + Add Another Agent
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ─── Training Data ─── */}
            <div style={cardStyle}>
              <div style={{ ...cardHeaderStyle, background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.08))' }}>
                <span style={{ ...iconStyle, background: '#059669' }}>📚</span>
                <div>
                  <h2 style={cardTitleStyle}>AI Training Data</h2>
                  <p style={cardSubStyle}>Upload PDFs or write custom context for your AI to learn from</p>
                </div>
              </div>
              <div style={cardBodyStyle}>
                {/* PDF Upload */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Upload PDF Documents</label>
                  <div style={{
                    border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '0.75rem',
                    padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={onPdfUpload}
                      id="pdfUpload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="pdfUpload" style={{ cursor: 'pointer' }}>
                      <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📄</p>
                      {uploadingPdf ? (
                        <p style={{ color: '#60a5fa', fontSize: '0.875rem' }}>Uploading & processing PDFs...</p>
                      ) : (
                        <>
                          <p style={{ color: '#60a5fa', fontSize: '0.875rem', fontWeight: 600 }}>Click to upload PDFs</p>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                            Company info, product docs, FAQs — up to 10MB each
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  {config.pdfNames && config.pdfNames.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      {config.pdfNames.map((name, i) => (
                        <span key={i} style={{
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem',
                          background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)'
                        }}>
                          📄 {name}
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={onClearTraining}
                        disabled={clearingData}
                        style={{ ...iconBtnStyle('#ef4444'), fontSize: '0.78rem', padding: '0.25rem 0.75rem' }}
                      >
                        {clearingData ? 'Clearing...' : '🗑 Clear All'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual Training Text */}
                <div>
                  <label style={labelStyle}>Custom Training Context</label>
                  <textarea
                    name="trainingData"
                    value={config.trainingData || ''}
                    onChange={onChange}
                    rows={6}
                    placeholder="Write custom context here — company description, products, FAQs, policies, tone guidelines..."
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                  />
                  <p style={hintStyle}>This text is injected into every AI prompt as background context</p>
                </div>
              </div>
            </div>

            {/* ─── Save Button ─── */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '1rem',
              padding: '1.25rem 1.5rem', borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
              marginBottom: '2rem'
            }}>
              <button type="button" onClick={load} style={{
                padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.875rem'
              }}>
                Reset
              </button>
              <button type="submit" disabled={saving} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 2rem', borderRadius: '0.5rem', border: 'none',
                background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: '#fff',
                fontWeight: 600, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1, boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                transition: 'all 0.2s'
              }}>
                {saving ? <><Spinner size="sm" /> Saving...</> : <>✓ Save AI Settings</>}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Add/Edit Agent Modal ─── */}
        {showAgentModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            backdropFilter: 'blur(4px)', padding: '1rem'
          }}>
            <div style={{
              background: '#1e293b', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.12)',
              width: '100%', maxWidth: '520px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(109,40,217,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>
                  {editingAgentIdx !== null ? '✏️ Edit Agent' : '🔌 New Connection'}
                </h3>
                <button type="button" onClick={() => setShowAgentModal(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '1.25rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Agent Name */}
                <div>
                  <label style={labelStyle}>Agent Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Bot"
                    value={agentForm.name}
                    onChange={e => setAgentForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* Platform */}
                <div>
                  <label style={labelStyle}>Platform</label>
                  <select
                    value={agentForm.platform}
                    onChange={e => setAgentForm(f => ({ ...f, platform: e.target.value }))}
                    style={inputStyle}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Agent Function / Scope */}
                <div>
                  <label style={labelStyle}>Agent Function (Where to use?)</label>
                  <select
                    value={agentForm.scope}
                    onChange={e => setAgentForm(f => ({ ...f, scope: e.target.value }))}
                    style={inputStyle}
                  >
                    {AGENT_SCOPES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <p style={hintStyle}>When this scope is triggered, the agent's webhook will be called instead of Gemini</p>
                </div>

                {/* Webhook URL */}
                <div>
                  <label style={labelStyle}>Webhook URL <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="url"
                    placeholder="https://n8n.yourdomain.com/webhook/..."
                    value={agentForm.webhook}
                    onChange={e => setAgentForm(f => ({ ...f, webhook: e.target.value }))}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>

                {/* API Key */}
                <div>
                  <label style={labelStyle}>API Key <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>(Optional)</span></label>
                  <input
                    type="password"
                    placeholder="Bearer token or API key for auth"
                    value={agentForm.apiKey}
                    onChange={e => setAgentForm(f => ({ ...f, apiKey: e.target.value }))}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAgentModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                    color: '#fff', cursor: 'pointer', fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAgent}
                  style={{
                    padding: '0.6rem 1.75rem', borderRadius: '0.5rem', border: 'none',
                    background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: '#fff',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                  }}
                >
                  {editingAgentIdx !== null ? 'Update Agent' : 'Add Agent'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────
const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.875rem',
  marginBottom: '1.5rem',
  overflow: 'hidden'
};

const cardHeaderStyle = {
  background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(37,99,235,0.08))',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.875rem'
};

const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#2563eb',
  fontSize: '1.1rem',
  flexShrink: 0
};

const cardTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#fff',
  margin: 0
};

const cardSubStyle = {
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.5)',
  marginTop: '2px'
};

const cardBodyStyle = {
  padding: '1.5rem'
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1.25rem'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#e2e8f0'
};

const inputStyle = {
  width: '100%',
  padding: '0.625rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const hintStyle = {
  fontSize: '0.75rem',
  color: 'rgba(255,255,255,0.45)',
  marginTop: '0.25rem'
};

const showBtnStyle = {
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.72rem',
  fontWeight: 700,
  cursor: 'pointer',
  padding: '0.25rem',
  letterSpacing: '0.05em'
};

const agentCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.875rem 1rem',
  borderRadius: '0.625rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)'
};

const addAgentBtnStyle = {
  padding: '0.6rem 1.25rem',
  borderRadius: '0.5rem',
  border: '1px dashed rgba(139,92,246,0.5)',
  background: 'rgba(139,92,246,0.08)',
  color: '#a78bfa',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s'
};

const iconBtnStyle = (color) => ({
  padding: '0.375rem 0.875rem',
  borderRadius: '0.375rem',
  border: `1px solid ${color}40`,
  background: `${color}15`,
  color: color,
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 500
});
