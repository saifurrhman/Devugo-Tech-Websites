import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { CompanyInfoAPI } from '../../services/companyInfo';

export default function Settings() {
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
      if (info) setForm(info);
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
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
            Company Settings
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Manage your company information and WhatsApp integration
          </p>
        </div>

        <form onSubmit={onSave}>
          {/* Basic Information Card */}
          <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.25rem 1.5rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>
                Basic Information
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Update your company's basic details
              </p>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Company Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text"
                    className="form-field"
                    name="companyName" 
                    value={form.companyName} 
                    onChange={onChange} 
                    placeholder="e.g., Devugo Tech"
                    required 
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Phone Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="tel"
                    className="form-field"
                    name="phone" 
                    value={form.phone} 
                    onChange={onChange} 
                    placeholder="+92 300 123 4567"
                    required 
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Tagline
                  </label>
                  <input 
                    type="text"
                    className="form-field"
                    name="tagline" 
                    value={form.tagline} 
                    onChange={onChange} 
                    placeholder="We build modern websites, products and brands"
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="email"
                    className="form-field"
                    name="email" 
                    value={form.email} 
                    onChange={onChange} 
                    placeholder="hello@devugo.tech"
                    required 
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text"
                    className="form-field"
                    name="address" 
                    value={form.address} 
                    onChange={onChange} 
                    placeholder="Lahore, Pakistan"
                    required 
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Working Hours
                  </label>
                  <input 
                    type="text"
                    className="form-field"
                    name="workingHours" 
                    value={form.workingHours} 
                    onChange={onChange} 
                    placeholder="Mon–Fri · 9am–6pm PKT"
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Settings Card */}
          <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(34, 197, 94, 0.1))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.25rem 1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#25d366'
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>
                    WhatsApp Integration
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Configure WhatsApp floating button settings
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    WhatsApp Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="tel"
                    className="form-field"
                    name="whatsappNumber" 
                    value={form.whatsappNumber} 
                    onChange={onChange} 
                    placeholder="+923001234567 (no spaces)"
                    required 
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.375rem' }}>
                    Enter number without spaces or dashes
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Show WhatsApp Float Button
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, showWhatsappFloat: !f.showWhatsappFloat }))}
                    style={{
                      width: '56px',
                      height: '28px',
                      borderRadius: '999px',
                      background: form.showWhatsappFloat ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: form.showWhatsappFloat ? '30px' : '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                      transition: 'left 0.2s ease'
                    }} />
                  </button>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem' }}>
                    Default WhatsApp Message
                  </label>
                  <textarea 
                    className="form-field"
                    name="whatsappMessage" 
                    value={form.whatsappMessage} 
                    onChange={onChange} 
                    rows="3"
                    placeholder="Hello! I would like to discuss a project."
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.375rem' }}>
                    This message will be pre-filled when users click the WhatsApp button
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)'
          }}>
            <button
              type="button"
              onClick={() => load()}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'transparent',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 2rem',
                borderRadius: '0.5rem',
                background: saving ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              {saving ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .form-field:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5) !important;
          background: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
    </div>
  );
}