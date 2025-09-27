import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function ServicesList(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Services</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
            <div>
              <strong>All Services</strong>
              <div className="muted">Manage your services shown on the public site</div>
            </div>
            <a className="btn-secondary" href="/admin/services/new">Add Service</a>
          </div>
          <div className="divider"></div>
          <div className="muted">Table coming soon...</div>
        </div>
      </main>
    </div>
  );
}
