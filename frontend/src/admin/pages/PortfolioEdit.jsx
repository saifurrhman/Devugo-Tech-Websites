import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function PortfolioEdit(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h1>Portfolio Edit</h1>
        <div className="card" style={{marginTop: '1rem'}}>
          Portfolio Edit (CRUD placeholder)
        </div>
      </main>
    </div>
  );
}
