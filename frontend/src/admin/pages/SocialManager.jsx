import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function SocialManager(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Social Media Manager</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <strong>Compose Post</strong>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'.6rem'}}>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Message
              <textarea className="form-field" rows={4} placeholder="Write your post..." />
            </label>
            <label className="form-label">Platforms
              <div style={{display:'flex', gap:'.8rem', alignItems:'center'}}>
                <label><input type="checkbox" defaultChecked /> LinkedIn</label>
                <label><input type="checkbox" /> X (Twitter)</label>
                <label><input type="checkbox" /> Facebook</label>
              </div>
            </label>
            <label className="form-label">Schedule
              <input className="form-field" type="datetime-local" />
            </label>
          </div>
          <div className="settings-actions">
            <button className="btn-secondary">Save draft</button>
            <button className="btn">Schedule</button>
          </div>
        </div>

        <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'1rem'}}>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Auto-post on publish</strong>
            <div className="muted">Enable auto-posting for blog/portfolio publish. (Placeholder)</div>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Analytics</strong>
            <div className="muted">Likes, shares, clicks (Placeholder)</div>
          </div>
        </div>
      </main>
    </div>
  );
}