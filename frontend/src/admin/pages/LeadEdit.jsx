import React from 'react';
import { useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function LeadEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>{isNew ? 'Add Lead' : `Edit Lead #${id}`}</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <label className="form-label">Name
              <input className="form-field" placeholder="Full name" />
            </label>
            <label className="form-label">Email
              <input className="form-field" type="email" placeholder="name@example.com" />
            </label>
            <label className="form-label">Phone
              <input className="form-field" placeholder="Optional" />
            </label>
            <label className="form-label">Status
              <select className="form-field" defaultValue="New">
                <option>New</option>
                <option>Contacted</option>
                <option>Converted</option>
              </select>
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Notes
              <textarea className="form-field" placeholder="Notes about this lead" rows={4} />
            </label>
          </div>
          <div className="settings-actions">
            <button className="btn-secondary">Save</button>
            <button className="btn">Save & Close</button>
          </div>
        </div>
      </main>
    </div>
  );
}
