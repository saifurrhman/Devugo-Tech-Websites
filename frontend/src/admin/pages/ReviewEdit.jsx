import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientReviewAPI } from '../../lib/api';

export default function ReviewEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name:'', role:'', company:'', rating:5, summary:'', avatar:'', featured:true });

  useEffect(()=>{
    if(isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { item } = await ClientReviewAPI.get(id);
        if(mounted) setForm({
          name: item.name||'', role:item.role||'', company:item.company||'', rating: item.rating||5,
          summary:item.summary||'', avatar:item.avatar||'', featured: !!item.featured,
        });
      }catch(err){ if(mounted) setError(err.message||'Failed to load'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = { ...form, rating: Math.min(5, Math.max(1, Number(form.rating)||5)) };
      if (isNew) { await ClientReviewAPI.create(payload); navigate('/admin/reviews'); }
      else { await ClientReviewAPI.update(id, payload); setMessage('Saved'); }
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if(isNew) return;
    if(!window.confirm('Delete this review?')) return;
    try{ await ClientReviewAPI.remove(id); navigate('/admin/reviews'); }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>{isNew? 'Add Review':'Edit Review'}</h1>
          <Link to="/admin/reviews" className="btn-secondary">Back</Link>
        </div>

        {loading ? <div className="card" style={{marginTop:'1rem'}}>Loading…</div> : (
          <form onSubmit={handleSave} className="create-post" style={{marginTop:'.9rem'}}>
            <div className="grid two" style={{alignItems:'start'}}>
              <section className="section-card">
                <h3>Details</h3>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Name</label>
                  <input className="form-field ux-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Role / Title</label>
                  <input className="form-field ux-input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Company</label>
                  <input className="form-field ux-input" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Rating (1–5)</label>
                  <input type="number" min="1" max="5" className="form-field ux-input" value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))} />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Summary (short)</label>
                  <input className="form-field ux-input" value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))} placeholder="Short highlight" />
                </div>
              </section>

              <aside className="section-card">
                <h3>Settings</h3>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Avatar URL</label>
                  <input className="form-field ux-input" placeholder="https://..." value={form.avatar} onChange={e=>setForm(f=>({...f,avatar:e.target.value}))} />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Featured</label>
                  <input type="checkbox" checked={!!form.featured} onChange={e=>setForm(f=>({...f, featured:e.target.checked}))} />
                </div>
              </aside>
            </div>

            {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
            {message && <div className="card" style={{marginTop:'1rem', color:'#16a34a'}}>{message}</div>}

            <div className="bottom-actions">
              <div className="container flex flex-row items-center justify-end gap-3">
                <button type="button" className="btn-cancel" onClick={() => navigate('/admin/reviews')}>Cancel</button>
                {!isNew && <button type="button" className="btn-secondary" onClick={handleDelete} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>}
                <button type="submit" className="btn-save" disabled={saving}>{saving? 'Saving…':'Save'}</button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
