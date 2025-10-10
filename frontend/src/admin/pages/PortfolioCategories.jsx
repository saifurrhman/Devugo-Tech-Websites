import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PortfolioCategoryAPI } from '../../lib/api';

export default function PortfolioCategories(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await PortfolioCategoryAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message || 'Failed to load categories'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  async function addCategory(e){
    e?.preventDefault?.();
    if(!name.trim()) return;
    try{
      await PortfolioCategoryAPI.create({ name: name.trim() });
      setName('');
      fetchAll();
    }catch(err){ alert(err.message || 'Failed to add'); }
  }

  async function removeCategory(id){
    if(!window.confirm('Delete this category?')) return;
    try{ await PortfolioCategoryAPI.remove(id); fetchAll(); }
    catch(err){ alert(err.message || 'Failed to delete'); }
  }

  const total = useMemo(()=> items.length, [items]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>Portfolio Categories</h1>
          <Link to="/admin/portfolio" className="btn-secondary">Back to Portfolio</Link>
        </div>

        {/* Quick add */}
        <form onSubmit={addCategory} className="card" style={{marginTop:'.75rem', display:'grid', gap:'.6rem'}}>
          <div className="form-grid">
            <label className="form-label">Category name</label>
            <input className="form-field ux-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Websites" required />
          </div>
          <div style={{display:'flex',gap:'.5rem'}}>
            <button type="submit" className="btn">Add Category</button>
            <span className="badge">Total: {total}</span>
          </div>
        </form>

        {/* List */}
        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        {!loading && !error && (
          items.length ? (
            <div className="grid two" style={{marginTop:'1rem'}}>
              {items.map(cat => (
                <div key={cat._id} className="card" style={{display:'grid',gap:'.4rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{cat.name}</h3>
                    <span className="badge">{cat.slug}</span>
                  </div>
                  {/* description removed */}
                  <div style={{display:'flex',gap:'.4rem'}}>
                    <button className="btn-secondary" onClick={()=>removeCategory(cat._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No categories yet.</div>
          )
        )}
      </main>
    </div>
  );
}
