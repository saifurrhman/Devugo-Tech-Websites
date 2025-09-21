import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function Analytics(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Analytics</h1>
        <div className="grid three" style={{marginTop:'1rem'}}>
          <div className="card">
            <h3>Visitors</h3>
            <p>—</p>
          </div>
          <div className="card">
            <h3>Form Submissions</h3>
            <p>—</p>
          </div>
          <div className="card">
            <h3>Top Sources</h3>
            <p>—</p>
          </div>
        </div>
      </main>
    </div>
  );
}
