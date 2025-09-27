import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function UsersRoles(){
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Users & Roles</h1>
        <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'1rem'}}>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Users</strong>
            <div className="table" role="table" style={{marginTop:'.6rem'}}>
              <div className="table-row head" role="row">
                <div role="columnheader">Name</div>
                <div role="columnheader">Email</div>
                <div role="columnheader">Role</div>
                <div role="columnheader">Actions</div>
              </div>
              {[{name:'Admin',email:'admin@site.com',role:'Admin'},{name:'Writer',email:'writer@site.com',role:'Editor'}].map((u,i)=> (
                <div className="table-row" role="row" key={i}>
                  <div role="cell">{u.name}</div>
                  <div role="cell">{u.email}</div>
                  <div role="cell">{u.role}</div>
                  <div role="cell"><button className="btn-secondary">Edit</button></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Roles</strong>
            <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'.6rem'}}>
              <label className="form-label">Create Role
                <input className="form-field" placeholder="Role name (e.g., Editor)" />
              </label>
              <label className="form-label">Permissions
                <select className="form-field" multiple>
                  <option>Blog: read</option>
                  <option>Blog: write</option>
                  <option>Pricing: manage</option>
                  <option>Leads: manage</option>
                </select>
              </label>
            </div>
            <div className="settings-actions">
              <button className="btn">Create</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
