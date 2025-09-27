import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function EmailCampaigns(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Email Campaigns</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <strong>Compose</strong>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'.6rem'}}>
            <label className="form-label">Subject
              <input className="form-field" placeholder="Your subject" />
            </label>
            <label className="form-label">From
              <input className="form-field" placeholder="Your Name <you@domain.com>" />
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Audience
              <select className="form-field">
                <option>All leads</option>
                <option>Only New</option>
                <option>Only Contacted</option>
                <option>Only Converted</option>
              </select>
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Message
              <textarea className="form-field" rows={6} placeholder="Write email..." />
            </label>
          </div>
          <div className="settings-actions">
            <button className="btn-secondary">Save as draft</button>
            <button className="btn">Send now</button>
          </div>
        </div>

        <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'1rem'}}>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Sequences</strong>
            <div className="muted">Create follow-up sequences. (Placeholder)</div>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Analytics</strong>
            <div className="muted">Open rate, click rate (Placeholder)</div>
          </div>
        </div>
      </main>
    </div>
  );
}
