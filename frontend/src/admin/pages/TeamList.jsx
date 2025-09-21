import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function TeamList(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Team</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Team List (CRUD placeholder)
        </div>
      </main>
    </div>
  );
}
