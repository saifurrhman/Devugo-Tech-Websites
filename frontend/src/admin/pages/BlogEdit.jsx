import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function BlogEdit(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Blog Edit</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Blog Edit (CRUD placeholder)
        </div>
      </main>
    </div>
  );
}
