import React from 'react';
import { useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function ServiceEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>{isNew ? 'Create Service' : 'Edit Service'}</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <label className="form-label">Title
              <input className="form-field" placeholder="Service title" />
            </label>
            <label className="form-label">Slug
              <input className="form-field" placeholder="service-slug" />
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Short Description
              <textarea className="form-field" placeholder="Brief description" />
            </label>
          </div>
          <div className="settings-actions">
            <button className="btn-secondary">Save draft</button>
            <button className="btn">Publish</button>
          </div>
        </div>
      </main>
    </div>
  );
}
