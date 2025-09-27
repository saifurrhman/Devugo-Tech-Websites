import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function PricingPlans(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Pricing Plans</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
            <div>
              <strong>All Plans</strong>
              <div className="muted">Manage pricing tiers displayed on the site</div>
            </div>
            <a className="btn-secondary" href="/admin/pricing/new">Add Plan</a>
          </div>
          <div className="divider"></div>
          <div className="muted">Plans table coming soon...</div>
        </div>
      </main>
    </div>
  );
}
