import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function TeamEdit(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h1>Team Edit</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Team Edit (CRUD placeholder)
        </div>
      </main>
    </div>
  );
}
