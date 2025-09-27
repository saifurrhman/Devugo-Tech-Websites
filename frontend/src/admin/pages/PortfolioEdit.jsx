import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { PortfolioAPI } from '../../lib/api';

export default function PortfolioEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', thumbnails: '', tags: '', url: '', client: '', featured: false,
  });

  useEffect(()=>{
    if (isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { item } = await PortfolioAPI.get(id);
        if(!mounted) return;
        setForm({
          title: item.title || '',
          description: item.description || '',
          thumbnails: (item.thumbnails||[]).join(', '),
          tags: (item.tags||[]).join(', '),
          url: item.url || '',
          client: item.client || '',
          featured: !!item.featured,
        });
      }catch(err){ if(mounted) setError(err.message||'Failed to load item'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = {
        title: form.title,
        description: form.description,
        thumbnails: form.thumbnails.split(',').map(s=>s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
        url: form.url,
        client: form.client,
        featured: !!form.featured,
      };
      if (isNew){ await PortfolioAPI.create(payload); navigate('/admin/portfolio'); }
      else { await PortfolioAPI.update(id, payload); setMessage('Saved'); }
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if (isNew) return;
    if(!window.confirm('Delete this item?')) return;
    setSaving(true); setError(''); setMessage('');
    try{ await PortfolioAPI.remove(id); navigate('/admin/portfolio'); }
    catch(err){ setError(err.message||'Failed to delete'); }
    finally{ setSaving(false); }
  }

  if (loading){
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-content">
          <div className="card" style={{marginTop:'1rem'}}>Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h1>{isNew? 'Add Project' : 'Edit Project'}</h1>
        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}
        <form onSubmit={handleSave} className="card" style={{marginTop:'1rem'}}>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <label className="form-label">Title
              <input className="form-field" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required />
            </label>
            <label className="form-label">Client
              <input className="form-field" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} />
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Description
              <textarea className="form-field" rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Thumbnails (comma separated URLs)
              <input className="form-field" value={form.thumbnails} onChange={e=>setForm(f=>({...f,thumbnails:e.target.value}))} placeholder="https://..., https://..." />
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Tags (comma separated)
              <input className="form-field" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="web, design" />
            </label>
            <label className="form-label">Project URL
              <input className="form-field" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..." />
            </label>
            <label style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
              <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))} />
              Featured
            </label>
          </div>
          <div className="settings-actions" style={{display:'flex',justifyContent:'space-between',gap:'.5rem'}}>
            <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/portfolio')}>Back</button>
            <div style={{display:'flex',gap:'.5rem'}}>
              {!isNew && <button type="button" className="btn-secondary" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>}
              <button type="submit" className="btn" disabled={saving}>{saving? 'Saving…':'Save'}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
