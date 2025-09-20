import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function Dashboard() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Admin Dashboard</h1>
        <div className="card" style={{marginTop:'1rem'}}>Welcome to your admin dashboard.</div>
      </main>
    </div>
  );
}
