import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function Contacts(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h1>Contacts</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Contacts Submissions (placeholder)
        </div>
      </main>
    </div>
  );
}
