import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function BlogList(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h1>Blog</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Blog List (CRUD placeholder)
        </div>
      </main>
    </div>
  );
}
