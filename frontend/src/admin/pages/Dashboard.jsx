import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function Dashboard() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h1>Admin Dashboard</h1>
      </main>
    </div>
  );
}
