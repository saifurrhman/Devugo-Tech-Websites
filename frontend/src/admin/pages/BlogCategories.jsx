import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { BlogCategoryAPI } from '../../lib/api';

export default function BlogCategories(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');

  async function load(){
    setLoading(true); setError('');
    try{ const { items } = await BlogCategoryAPI.list(); setItems(items||[]); }
    catch(err){ setError(err.message||'Failed to load categories'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if(!term) return items;
    return items.filter(x => (x.name||'').toLowerCase().includes(term) || (x.slug||'').toLowerCase().includes(term));
  },[q, items]);

  async function addCategory(){
    const name = newName.trim();
    if(!name) return;
    setSaving(true);
    try{
      const { item } = await BlogCategoryAPI.create({ name });
      setItems(prev=>[...prev, item]);
      setNewName('');
    }catch(err){ alert(err.message||'Failed to create'); }
    finally{ setSaving(false); }
  }

  async function renameCategory(cat){
    const name = window.prompt('Rename category', cat.name);
    if(!name || name === cat.name) return;
    setSaving(true);
    try{
      const { item } = await BlogCategoryAPI.update(cat._id, { name });
      setItems(prev=>prev.map(x=>x._id===cat._id? item : x));
    }catch(err){ alert(err.message||'Failed to update'); }
    finally{ setSaving(false); }
  }

  async function removeCategory(cat){
    if(!window.confirm(`Delete category \"${cat.name}\"?`)) return;
    setSaving(true);
    try{
      await BlogCategoryAPI.remove(cat._id);
      setItems(prev=>prev.filter(x=>x._id!==cat._id));
    }catch(err){ alert(err.message||'Failed to delete'); }
    finally{ setSaving(false); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="toolbar" style={{display:'flex',gap:'.6rem',alignItems:'center',justifyContent:'space-between'}}>
          <h1>Blog Categories</h1>
          <Link to="/admin/blog" className="btn-secondary" style={{ color: 'white', textDecoration: 'none' }}>Back to Blog</Link>
        </div>

        <div className="section-card" style={{marginTop:'.6rem'}}>
          <label className="form-label">Category name</label>
          <input
            className="form-field"
            placeholder="e.g. Tutorials"
            value={newName}
            onChange={e=>setNewName(e.target.value)}
          />
          <div style={{display:'flex',alignItems:'center',gap:'.6rem',marginTop:'.6rem'}}>
            <button className="btn" onClick={addCategory} disabled={saving || !newName.trim()}>Add Category</button>
            <span className="badge">Total: {items.length}</span>
          </div>
        </div>

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {filtered.map(cat => (
                <div key={cat._id} className="card" style={{display:'grid',gap:'.5rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{cat.name}</h3>
                    <span className="badge">{cat.slug}</span>
                  </div>
                  <div style={{display:'flex',gap:'.4rem'}}>
                    <button className="btn-secondary" onClick={()=>renameCategory(cat)} disabled={saving}>Rename</button>
                    <button className="btn-secondary" onClick={()=>removeCategory(cat)} disabled={saving} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
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
