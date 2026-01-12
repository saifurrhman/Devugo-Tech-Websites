import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { CompanyInfoAPI } from '../../lib/api';

export default function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    whatsappNumber: '',
    whatsappMessage: '',
    workingHours: '',
    showWhatsappFloat: true,
    showChatBot: true,
    chatBotWelcomeMessage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { info } = await CompanyInfoAPI.get();
      if (info) setForm(prev => ({ ...prev, ...info }));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await CompanyInfoAPI.update(form);
      alert('Settings saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '4px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading...</span>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout settings-page">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        {/* Page Header */}
        <div className="settings-header flex justify-between items-end">
          <div>
            <h1>Settings</h1>
            <p>Manage your company information and WhatsApp integration</p>
          </div>
          <button
            onClick={() => navigate('/admin/settings/integrations')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 mb-1"
          >
            <span>🔌</span> Integrations
          </button>
        </div>

        <form onSubmit={onSave}>
          {/* Basic Information Card */}
          <div className="card settings-card">
            <div className="card-header">
              <h2>Basic Information</h2>
              <p>Update your company's basic details</p>
            </div>

            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Company Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    name="companyName"
                    value={form.companyName}
                    onChange={onChange}
                    placeholder="e.g., Devugo Tech"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="+92 300 123 4567"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    name="tagline"
                    value={form.tagline}
                    onChange={onChange}
                    placeholder="We build modern websites, products and brands"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="hello@devugo.tech"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Lahore, Pakistan"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Working Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    name="workingHours"
                    value={form.workingHours}
                    onChange={onChange}
                    placeholder="Mon–Fri · 9am–6pm PKT"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Settings Card */}
          <div className="card settings-card whatsapp-card">
            <div className="card-header whatsapp-header">
              <div className="header-content">
                <div className="whatsapp-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h2>WhatsApp Integration</h2>
                  <p>Configure WhatsApp floating button settings</p>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    WhatsApp Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    name="whatsappNumber"
                    value={form.whatsappNumber}
                    onChange={onChange}
                    placeholder="+923001234567"
                    required
                  />
                  <p className="field-hint">Enter number without spaces or dashes</p>
                </div>

                <div className="form-group toggle-group">
                  <label>Show WhatsApp Float Button</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, showWhatsappFloat: !f.showWhatsappFloat }))}
                    className={`toggle-btn ${form.showWhatsappFloat ? 'active' : ''}`}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="form-group full-width">
                  <label>Default WhatsApp Message</label>
                  <textarea
                    className="form-input"
                    name="whatsappMessage"
                    value={form.whatsappMessage}
                    onChange={onChange}
                    rows="3"
                    placeholder="Hello! I would like to discuss a project."
                  />
                  <p className="field-hint">This message will be pre-filled when users click the WhatsApp button</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot Settings Card */}
          <div className="card settings-card chatbot-card">
            <div className="card-header chatbot-header">
              <div className="header-content">
                <div className="chatbot-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div>
                  <h2>Chatbot Integration</h2>
                  <p>Configure website AI chatbot settings</p>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="form-grid">
                <div className="form-group toggle-group full-width">
                  <label>Show Chatbot</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, showChatBot: !f.showChatBot }))}
                    className={`toggle-btn ${form.showChatBot ? 'active' : ''}`}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="form-group full-width">
                  <label>Welcome Message</label>
                  <textarea
                    className="form-input"
                    name="chatBotWelcomeMessage"
                    value={form.chatBotWelcomeMessage}
                    onChange={onChange}
                    rows="3"
                    placeholder="Hi there! 👋 How can I help you today?"
                  />
                  <p className="field-hint">The first message the bot sends to visitors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="form-actions">
            <button type="button" onClick={() => load()} className="btn-reset">
              Reset
            </button>
            <button type="submit" disabled={saving} className="btn-save">
              {saving ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <style>{`
        /* Settings Page Styles */
        .settings-page {
          width: 100%;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .settings-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .settings-card {
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .card-header {
          background: rgba(59, 130, 246, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem 1.5rem;
        }

        .whatsapp-header {
          background: linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(34, 197, 94, 0.1));
        }

        .chatbot-header {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .whatsapp-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #25d366;
          flex-shrink: 0;
        }

        .chatbot-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
        }

        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .card-header p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .card-body {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .required {
          color: #ef4444;
        }

        .form-input {
          width: 100%;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 0.875rem;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        textarea.form-input {
          resize: vertical;
          min-height: 80px;
        }

        .field-hint {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.375rem;
        }

        .toggle-group {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .toggle-btn {
          width: 56px;
          height: 28px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          transition: background 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
        }

        .toggle-btn.active {
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }

        .toggle-slider {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          transition: left 0.2s ease;
        }

        .toggle-btn.active .toggle-slider {
          left: 30px;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }

        .btn-reset,
        .btn-save {
          padding: 0.625rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-reset {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #fff;
        }

        .btn-reset:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-save {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 2rem;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          color: #fff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .settings-header h1 {
            font-size: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-group.full-width {
            grid-column: 1;
          }

          .card-body {
            padding: 1rem;
          }

          .card-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .whatsapp-icon {
            width: 36px;
            height: 36px;
          }

          .card-header h2 {
            font-size: 1.125rem;
          }

          .form-actions {
            flex-direction: column-reverse;
            padding: 1rem;
          }

          .btn-reset,
          .btn-save {
            width: 100%;
            justify-content: center;
          }

          .toggle-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .settings-header {
            margin-bottom: 1.5rem;
          }

          .settings-header h1 {
            font-size: 1.25rem;
          }

          .card-header h2 {
            font-size: 1rem;
          }

          .card-header p {
            font-size: 0.8125rem;
          }

          .form-input {
            font-size: 0.8125rem;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}