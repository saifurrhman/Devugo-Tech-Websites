import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function SettingsIntegrations(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Settings & Integrations</h1>
        <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'1rem'}}>
          <div className="card" style={{padding:'1rem'}}>
            <strong>SMTP</strong>
            <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'.6rem'}}>
              <label className="form-label">Host
                <input className="form-field" placeholder="smtp.example.com" />
              </label>
              <label className="form-label">Port
                <input className="form-field" placeholder="587" />
              </label>
              <label className="form-label">Username
                <input className="form-field" placeholder="user" />
              </label>
              <label className="form-label">Password
                <input className="form-field" type="password" placeholder="••••••" />
              </label>
              <label className="form-label" style={{gridColumn:'1 / -1'}}>From Email
                <input className="form-field" placeholder="noreply@domain.com" />
              </label>
            </div>
            <div className="settings-actions">
              <button className="btn-secondary">Test</button>
              <button className="btn">Save</button>
            </div>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Social API Keys</strong>
            <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'.6rem'}}>
              <label className="form-label">Twitter/X API Key
                <input className="form-field" placeholder="" />
              </label>
              <label className="form-label">LinkedIn Access Token
                <input className="form-field" placeholder="" />
              </label>
              <label className="form-label" style={{gridColumn:'1 / -1'}}>Facebook App Token
                <input className="form-field" placeholder="" />
              </label>
            </div>
            <div className="settings-actions">
              <button className="btn">Save</button>
            </div>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>n8n Workflows</strong>
            <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr',gap:'1rem', marginTop:'.6rem'}}>
              <label className="form-label">Webhook URL
                <input className="form-field" placeholder="https://n8n.yourdomain.com/webhook/..." />
              </label>
            </div>
            <div className="settings-actions">
              <button className="btn">Save</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
