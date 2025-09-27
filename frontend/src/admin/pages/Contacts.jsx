import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function Contacts(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Contacts</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Contacts Submissions 
        </div>
      </main>
    </div>
  );
}
