import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ServiceAPI } from '../../lib/api';

export default function ServicesList(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await ServiceAPI.list();
        if(mounted) setItems(items||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load services'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if(!term) return items;
    return items.filter(s => (s.title||'').toLowerCase().includes(term) || (s.description||'').toLowerCase().includes(term));
  },[q, items]);

  async function handleDelete(id){
    if(!window.confirm('Delete this service?')) return;
    try{
      await ServiceAPI.remove(id);
      setItems(prev=>prev.filter(s=>s._id!==id));
    }catch(err){ alert(err.message||'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1 style={{margin:0}}>Services</h1>
          <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search services..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <Link to="/admin/services/new" className="btn">Add Service</Link>
          </div>
        </div>

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="card" style={{marginTop:'1rem'}}>
              <div className="table" role="table">
                <div className="table-row head" role="row">
                  <div role="columnheader">Title</div>
                  <div role="columnheader">Published</div>
                  <div role="columnheader">Order</div>
                  <div role="columnheader">Actions</div>
                </div>
                {filtered.map(s => (
                  <div className="table-row" role="row" key={s._id}>
                    <div role="cell">{s.title}</div>
                    <div role="cell"><span className="badge">{s.published? 'Yes':'No'}</span></div>
                    <div role="cell">{s.order ?? 0}</div>
                    <div role="cell" style={{display:'flex',gap:'.4rem'}}>
                      <button className="btn-secondary" onClick={()=>navigate(`/admin/services/${s._id}`)}>Edit</button>
                      <button className="btn-secondary" onClick={()=>handleDelete(s._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Services Yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Add your first service to display on the public site.</p>
              <Link to="/admin/services/new" className="btn" style={{marginTop:'.5rem'}}>Add a Service</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}
