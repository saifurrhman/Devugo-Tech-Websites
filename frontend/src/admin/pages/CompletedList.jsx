import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function CompletedList(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Completed Projects</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
            <div>
              <strong>All Completed</strong>
              <div className="muted">Track completed client work and case studies</div>
            </div>
            <a className="btn-secondary" href="/admin/completed/new">Add Entry</a>
          </div>
          <div className="divider"></div>
          <div className="muted">List coming soon...</div>
        </div>
      </main>
    </div>
  );
}