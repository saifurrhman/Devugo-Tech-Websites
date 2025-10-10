import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TechStackAPI } from '../../lib/api';

export default function TechStack(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await TechStackAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message || 'Failed to load tech stack'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  async function addItem(e){
    e?.preventDefault?.();
    if(!name.trim()) return;
    try{
      await TechStackAPI.create({ name: name.trim() });
      setName('');
      fetchAll();
    }catch(err){ alert(err.message || 'Failed to add'); }
  }

  async function removeItem(id){
    if(!window.confirm('Delete this item?')) return;
    try{ await TechStackAPI.remove(id); fetchAll(); }
    catch(err){ alert(err.message || 'Failed to delete'); }
  }

  const total = useMemo(()=> items.length, [items]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>Tech Stack</h1>
          <Link to="/admin/portfolio" className="btn-secondary">Back to Portfolio</Link>
        </div>

        <form onSubmit={addItem} className="card" style={{marginTop:'.75rem', display:'grid', gap:'.6rem'}}>
          <div className="form-grid">
            <label className="form-label">Technology name</label>
            <input className="form-field ux-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. React" required />
          </div>
          <div style={{display:'flex',gap:'.5rem'}}>
            <button type="submit" className="btn">Add</button>
            <span className="badge">Total: {total}</span>
          </div>
        </form>

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        {!loading && !error && (
          items.length ? (
            <div className="grid two" style={{marginTop:'1rem'}}>
              {items.map(it => (
                <div key={it._id} className="card" style={{display:'grid',gap:'.4rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{it.name}</h3>
                    <span className="badge">{it.slug}</span>
                  </div>
                  <div style={{display:'flex',gap:'.4rem'}}>
                    <button className="btn-secondary" onClick={()=>removeItem(it._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No tech stack items yet.</div>
          )
        )}
      </main>
    </div>
  );
}
