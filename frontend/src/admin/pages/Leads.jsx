import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function Leads(){
  const [status, setStatus] = useState('all');
  const [fileName, setFileName] = useState('');

  const leads = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'New', source: 'Contact Form' },
    { id: 2, name: 'Sara Khan', email: 'sara@example.com', status: 'Contacted', source: 'Manual' },
    { id: 3, name: 'Chris Lee', email: 'chris@example.com', status: 'Converted', source: 'Campaign A' },
  ];

  const filtered = status==='all' ? leads : leads.filter(l => l.status.toLowerCase() === status);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Leads</h1>

        <div className="card" style={{marginTop:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
            <div>
              <strong>All Leads</strong>
              <div className="muted">Import CSV or add manually</div>
            </div>
            <div style={{display:'flex',gap:'.5rem'}}>
              <label className="btn-secondary" style={{cursor:'pointer'}}>
                Import CSV
                <input type="file" accept=".csv" style={{display:'none'}} onChange={(e)=>setFileName(e.target.files?.[0]?.name||'')} />
              </label>
              <a className="btn" href="/admin/leads/new">Add Lead</a>
            </div>
          </div>
          {fileName && <div className="muted" style={{marginTop:'.5rem'}}>Selected: {fileName}</div>}
          <div className="divider"></div>

          <div style={{display:'flex',gap:'.5rem',alignItems:'center',marginBottom:'.5rem'}}>
            <span className="muted">Filter:</span>
            <select className="form-field" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          <div className="table" role="table">
            <div className="table-row head" role="row">
              <div role="columnheader">Name</div>
              <div role="columnheader">Email</div>
              <div role="columnheader">Status</div>
              <div role="columnheader">Source</div>
              <div role="columnheader">Actions</div>
            </div>
            {filtered.map(l => (
              <div className="table-row" role="row" key={l.id}>
                <div role="cell">{l.name}</div>
                <div role="cell">{l.email}</div>
                <div role="cell"><span className={`badge ${l.status.toLowerCase()}`}>{l.status}</span></div>
                <div role="cell">{l.source}</div>
                <div role="cell"><a className="link" href={`/admin/leads/${l.id}`}>Edit</a></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}