import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function BlogList(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Blog</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Blog List (CRUD placeholder)
        </div>
      </main>
    </div>
  );
}
