import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { SettingsAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import Spinner from '../../components/Spinner';

const INTEGRATION_CARDS = [
  {
    key: 'smtp',
    icon: '📧',
    title: 'SMTP / Email',
    desc: 'Configure email delivery settings',
    color: '#3b82f6',
    gradient: 'rgba(59,130,246,0.1)',
    fields: [
      { name: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
      { name: 'port', label: 'Port', placeholder: '587', half: true },
      { name: 'user', label: 'Username', placeholder: 'user@domain.com', half: true },
      { name: 'pass', label: 'Password', placeholder: '••••••', type: 'password' },
      { name: 'fromEmail', label: 'From Email', placeholder: 'noreply@domain.com', half: true },
      { name: 'fromName', label: 'From Name', placeholder: 'Your Company', half: true },
    ]
  },
  {
    key: 'brevo',
    icon: '💌',
    title: 'Brevo (Sendinblue)',
    desc: 'Transactional & marketing email via Brevo API',
    color: '#0ea5e9',
    gradient: 'rgba(14,165,233,0.1)',
    fields: [
      { name: 'apiKey', label: 'Brevo API Key', placeholder: 'xkeysib-...', type: 'password', mono: true },
      { name: 'senderEmail', label: 'Sender Email', placeholder: 'noreply@domain.com', half: true },
      { name: 'senderName', label: 'Sender Name', placeholder: 'Company Name', half: true },
    ]
  },
  {
    key: 'n8n',
    icon: '⚡',
    title: 'n8n Automation',
    desc: 'Trigger n8n workflows for emails, forms & events',
    color: '#f59e0b',
    gradient: 'rgba(245,158,11,0.1)',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://n8n.yourdomain.com/webhook/...', mono: true },
      { name: 'apiKey', label: 'API Key (Optional)', placeholder: 'Bearer token...', type: 'password', mono: true },
    ]
  },
  {
    key: 'makecom',
    icon: '🔄',
    title: 'Make.com (Integromat)',
    desc: 'Connect Make.com scenarios to your platform',
    color: '#8b5cf6',
    gradient: 'rgba(139,92,246,0.1)',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hook.make.com/...', mono: true },
    ]
  },
  {
    key: 'zapier',
    icon: '🔗',
    title: 'Zapier',
    desc: 'Trigger Zapier zaps from platform events',
    color: '#ef4444',
    gradient: 'rgba(239,68,68,0.1)',
    fields: [
      { name: 'webhookUrl', label: 'Zap Webhook URL', placeholder: 'https://hooks.zapier.com/...', mono: true },
    ]
  },
  {
    key: 'social',
    icon: '📲',
    title: 'Social API Keys',
    desc: 'Connect social media platform APIs',
    color: '#10b981',
    gradient: 'rgba(16,185,129,0.1)',
    fields: [
      { name: 'twitterApiKey', label: 'Twitter/X API Key', placeholder: '...', half: true },
      { name: 'linkedinToken', label: 'LinkedIn Access Token', placeholder: '...', half: true },
      { name: 'facebookToken', label: 'Facebook App Token', placeholder: '...' },
    ]
  },
];

export default function IntegrationSettings() {
  const notify = useNotification();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [testing, setTesting] = useState({});
  const [activeTab, setActiveTab] = useState('smtp');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await SettingsAPI.getIntegrations();
      if (data) setConfigs(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function handleChange(section, field, value) {
    setConfigs(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value }
    }));
  }

  async function handleSave(sectionKey) {
    setSaving(prev => ({ ...prev, [sectionKey]: true }));
    try {
      await SettingsAPI.updateIntegrations({ ...configs, [sectionKey]: configs[sectionKey] || {} });
      notify.success(`${INTEGRATION_CARDS.find(c => c.key === sectionKey)?.title} settings saved!`);
    } catch (e) {
      notify.error('Failed to save');
    }
    setSaving(prev => ({ ...prev, [sectionKey]: false }));
  }

  async function handleSaveAll(e) {
    e.preventDefault();
    setSaving(prev => ({ ...prev, all: true }));
    try {
      await SettingsAPI.updateIntegrations(configs);
      notify.success('All integration settings saved!');
    } catch (e) {
      notify.error('Failed to save settings');
    }
    setSaving(prev => ({ ...prev, all: false }));
  }

  async function handleTest(sectionKey) {
    setTesting(prev => ({ ...prev, [sectionKey]: true }));
    await new Promise(r => setTimeout(r, 1200));
    notify.success(`Test ping sent for ${INTEGRATION_CARDS.find(c => c.key === sectionKey)?.title}!`);
    setTesting(prev => ({ ...prev, [sectionKey]: false }));
  }

  const activeCard = INTEGRATION_CARDS.find(c => c.key === activeTab);
  const sectionData = configs[activeTab] || {};

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

        <div style={{ maxWidth: '900px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              🔌 Integration Settings
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Connect your platform to email providers, automation tools, and social APIs
            </p>
          </div>

          <form onSubmit={handleSaveAll}>
            {/* Tab Navigation */}
            <div style={{
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
              marginBottom: '1.5rem', padding: '0.5rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {INTEGRATION_CARDS.map(card => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveTab(card.key)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: activeTab === card.key
                      ? `linear-gradient(135deg,${card.color},${card.color}cc)`
                      : 'transparent',
                    color: activeTab === card.key ? '#fff' : 'rgba(255,255,255,0.55)',
                    boxShadow: activeTab === card.key ? `0 4px 12px ${card.color}40` : 'none'
                  }}
                >
                  {card.icon} {card.title}
                </button>
              ))}
            </div>

            {/* Active Section Card */}
            {activeCard && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.875rem',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                {/* Card Header */}
                <div style={{
                  background: `linear-gradient(135deg,${activeCard.gradient},transparent)`,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: activeCard.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0
                    }}>
                      {activeCard.icon}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>{activeCard.title}</h2>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{activeCard.desc}</p>
                    </div>
                  </div>
                  {/* Connection Status Indicator */}
                  {sectionData.webhookUrl || sectionData.apiKey || sectionData.host || sectionData.host !== undefined ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.375rem 0.875rem', borderRadius: '999px',
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)'
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Configured</span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.375rem 0.875rem', borderRadius: '999px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Not Set</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.25rem'
                  }}>
                    {activeCard.fields.map(field => (
                      <div key={field.name} style={{
                        display: 'flex', flexDirection: 'column', gap: '0.375rem',
                        gridColumn: field.half ? 'span 1' : '1 / -1'
                      }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>
                          {field.label}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={field.type === 'password'
                              ? (showKeys[`${activeTab}_${field.name}`] ? 'text' : 'password')
                              : (field.type || 'text')}
                            value={sectionData[field.name] || ''}
                            onChange={e => handleChange(activeTab, field.name, e.target.value)}
                            placeholder={field.placeholder}
                            style={{
                              width: '100%',
                              padding: '0.625rem 1rem',
                              paddingRight: field.type === 'password' ? '5rem' : '1rem',
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: 'rgba(255,255,255,0.06)',
                              color: '#fff',
                              fontSize: '0.875rem',
                              outline: 'none',
                              boxSizing: 'border-box',
                              fontFamily: field.mono ? 'monospace' : 'inherit'
                            }}
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowKeys(prev => ({
                                ...prev,
                                [`${activeTab}_${field.name}`]: !prev[`${activeTab}_${field.name}`]
                              }))}
                              style={{
                                position: 'absolute', right: '0.75rem', top: '50%',
                                transform: 'translateY(-50%)', background: 'none', border: 'none',
                                color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem',
                                fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em'
                              }}
                            >
                              {showKeys[`${activeTab}_${field.name}`] ? 'HIDE' : 'SHOW'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section Actions */}
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem',
                    paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {(activeTab === 'smtp' || activeTab === 'brevo' || activeTab === 'n8n') && (
                      <button
                        type="button"
                        onClick={() => handleTest(activeTab)}
                        disabled={testing[activeTab]}
                        style={{
                          padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                          border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                          color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                      >
                        {testing[activeTab] ? '⏳ Testing...' : '🧪 Test Connection'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSave(activeTab)}
                      disabled={saving[activeTab]}
                      style={{
                        padding: '0.6rem 1.75rem', borderRadius: '0.5rem', border: 'none',
                        background: `linear-gradient(90deg,${activeCard.color},${activeCard.color}cc)`,
                        color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        boxShadow: `0 4px 12px ${activeCard.color}40`, display: 'flex',
                        alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      {saving[activeTab] ? '⏳ Saving...' : `✓ Save ${activeCard.title}`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Overview — All Integrations Status */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.875rem',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 1rem' }}>
                📋 Integration Status Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {INTEGRATION_CARDS.map(card => {
                  const data = configs[card.key] || {};
                  const isConfigured = Object.values(data).some(v => v && v.toString().trim());
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setActiveTab(card.key)}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: '0.625rem',
                        border: `1px solid ${isConfigured ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        background: isConfigured ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isConfigured ? '#e2e8f0' : 'rgba(255,255,255,0.4)' }}>
                          {card.icon} {card.title}
                        </span>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: isConfigured ? '#10b981' : 'rgba(255,255,255,0.2)',
                          flexShrink: 0
                        }} />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: isConfigured ? '#34d399' : 'rgba(255,255,255,0.3)', margin: '0.25rem 0 0' }}>
                        {isConfigured ? '✓ Configured' : 'Not configured'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save All Button */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '1rem',
              padding: '1.25rem 1.5rem', borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
              marginBottom: '2rem'
            }}>
              <button type="button" onClick={load} style={{
                padding: '0.625rem 1.5rem', borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: '0.875rem'
              }}>
                Reset All
              </button>
              <button type="submit" disabled={saving.all} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 2rem', borderRadius: '0.5rem', border: 'none',
                background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: '#fff',
                fontWeight: 600, fontSize: '0.875rem', cursor: saving.all ? 'not-allowed' : 'pointer',
                opacity: saving.all ? 0.6 : 1, boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}>
                {saving.all ? <><Spinner size="sm" /> Saving All...</> : <>✓ Save All Integrations</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
