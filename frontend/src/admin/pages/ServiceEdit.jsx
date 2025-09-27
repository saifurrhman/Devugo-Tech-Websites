import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ServiceAPI } from '../../lib/api';

export default function ServiceEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '', slug: '', description: '', features: '', icon: '', published: true, order: 0,
  });

  useEffect(()=>{
    if (isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { item } = await ServiceAPI.get(id);
        if(!mounted) return;
        setForm({
          title: item.title || '',
          slug: item.slug || '',
          description: item.description || '',
          features: (item.features||[]).join(', '),
          icon: item.icon || '',
          published: !!item.published,
          order: item.order ?? 0,
        });
      }catch(err){ if(mounted) setError(err.message||'Failed to load service'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  function syncSlug(nextTitle){
    const slug = nextTitle.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    setForm(f=>({...f, title: nextTitle, slug }));
  }

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = {
        title: form.title,
        description: form.description,
        features: form.features.split(',').map(s=>s.trim()).filter(Boolean),
        icon: form.icon,
        published: !!form.published,
        order: Number(form.order)||0,
      };
      if (isNew){
        await ServiceAPI.create(payload);
        navigate('/admin/services');
      } else {
        await ServiceAPI.update(id, payload);
        setMessage('Saved');
      }
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if (isNew) return;
    if(!window.confirm('Delete this service?')) return;
    setSaving(true); setError(''); setMessage('');
    try{ await ServiceAPI.remove(id); navigate('/admin/services'); }
    catch(err){ setError(err.message||'Failed to delete'); }
    finally{ setSaving(false); }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-content create-post">
          <AdminTopbar />
          <div className="card" style={{marginTop:'1rem'}}>Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="page-bar sticky">
          <div className="breadcrumbs" aria-label="Breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/services">Services</Link>
            <span>/</span>
            <strong className="active" aria-current="page">{isNew ? 'Create' : 'Edit'}</strong>
          </div>
        </div>

        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.75rem',marginTop:'.25rem'}}>
          <h1 className="page-title" style={{margin:0}}>
            {isNew ? 'Create Service' : 'Edit Service'}
            <span className="badge" style={{marginLeft:'.6rem'}}>{form.published ? 'Published' : 'Draft'}</span>
          </h1>
          <div style={{display:'flex',gap:'.5rem'}}>
            {!isNew && (
              <button type="button" className="btn-secondary" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
            )}
            <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/services')}>Back</button>
            <button type="button" className="btn" onClick={handleSave} disabled={saving}>{saving? 'Saving…':'Save'}</button>
          </div>
        </div>
        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}

        <form onSubmit={handleSave} style={{marginTop:'1rem'}}>
          <div className="grid two" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:'1rem'}}>
            <div className="stack" style={{display:'grid',gap:'1rem'}}>
              <section className="section-card">
                <h3>Basic details</h3>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Title</label>
                  <input className="form-field" placeholder="e.g., UX UI Design" value={form.title} onChange={e=>syncSlug(e.target.value)} required minLength={3} />
                  <div className="hint">Keep it short and action‑oriented (e.g., "UX UI Design").</div>
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Slug</label>
                  <input className="form-field" placeholder="service-slug" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} aria-describedby="slug-hint" />
                  <div className="hint">Auto‑generated from title. You can customize it.</div>
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Short Description</label>
                  <textarea className="form-field" rows={4} placeholder="1–2 sentences that summarize the service" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
                  <div className="hint" id="slug-hint">1–2 sentences that summarize the service.</div>
                </div>
              </section>

              <section className="section-card">
                <h3>Content</h3>
                <div className="form-grid">
                  <label className="form-label">Features (comma separated)</label>
                  <input className="form-field" placeholder="feature one, feature two" value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} aria-label="Service features" />
                  <div className="hint">Separate with commas. Example: strategy workshop, prototypes, design system</div>
                </div>
              </section>
            </div>

            <aside className="section-card" aria-label="Sidebar settings">
              <h3>Settings</h3>
              <div className="form-grid" style={{marginTop:'.5rem'}}>
                <label className="form-label">Icon URL</label>
                <input className="form-field" placeholder="https://cdn.example.com/icon.png" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} />
                {form.icon && (
                  <div className="preview" style={{marginTop:'.5rem',display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <img src={form.icon} alt="icon preview" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}}/>
                    <small className="muted">Preview</small>
                  </div>
                )}
              </div>
              <div className="form-grid" style={{marginTop:'.75rem'}}>
                <label className="form-label">Order</label>
                <input type="number" className="form-field" value={form.order} onChange={e=>setForm(f=>({...f,order:e.target.value}))} />
              </div>
              <label style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'.75rem'}}>
                <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
                Published
              </label>

              <div className="divider" style={{margin:'1rem 0'}}/>
              <div>
                <h4 style={{margin:'0 0 .25rem 0'}}>Preview</h4>
                <div className="card" style={{padding:'.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                    {form.icon && <img src={form.icon} alt="" style={{width:28,height:28,borderRadius:6,objectFit:'cover'}}/>}
                    <strong>{form.title || 'Service title'}</strong>
                  </div>
                  <p style={{margin:'.5rem 0 0 0', opacity:.9}}>{form.description || 'Short description will appear here.'}</p>
                  {form.features && (
                    <ul style={{margin:'.5rem 0 0 1rem'}}>
                      {form.features.split(',').map((f,i)=>f.trim() && <li key={i}>{f.trim()}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom spacer to avoid overlap on short pages */}
          <div style={{height:'1rem'}} />
        </form>
      </main>
    </div>
  );
}
