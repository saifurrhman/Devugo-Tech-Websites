import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PortfolioAPI, UploadAPI } from '../../lib/api';

export default function PortfolioEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', thumbnails: [], tags: [], url: '', client: '', featured: false,
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
          thumbnails: item.thumbnails || [],
          tags: item.tags || [],
          url: item.url || '',
          client: item.client || '',
          featured: !!item.featured,
        });
      }catch(err){ if(mounted) setError(err.message||'Failed to load item'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function onFiles(e){
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      const uploads = await Promise.all(files.map(file => new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onload = async () => {
          try{
            const dataUrl = reader.result;
            const { url } = await UploadAPI.image(dataUrl, file.name);
            resolve(url);
          }catch(err){ reject(err); }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
      setForm(f=>({...f, thumbnails: [...f.thumbnails, ...uploads] }));
      setMessage('Images uploaded');
    }catch(err){
      setError(err.message || 'Failed to upload images');
    }finally{
      // clear input so selecting the same files again triggers change
      try{ e.target.value = ''; }catch(_e){}
    }
  }

  function removeThumb(index){
    setForm(f=>({...f, thumbnails: f.thumbnails.filter((_,i)=> i!==index)}));
  }

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = {
        title: form.title,
        description: form.description,
        thumbnails: Array.isArray(form.thumbnails) ? form.thumbnails : String(form.thumbnails||'').split(',').map(s=>s.trim()).filter(Boolean),
        tags: Array.isArray(form.tags) ? form.tags : String(form.tags||'').split(',').map(s=>s.trim()).filter(Boolean),
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
      <main className="admin-content create-post">
        <AdminTopbar />
        <div className="page-bar sticky">
          <div className="breadcrumbs" aria-label="Breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/portfolio">Portfolio</Link>
            <span>/</span>
            <strong className="active" aria-current="page">{isNew? 'Create' : 'Edit'}</strong>
          </div>
        </div>

        <h1 className="page-title" style={{marginTop:'.25rem'}}>{isNew? 'Add Project' : 'Edit Project'}</h1>
        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}

        <form onSubmit={handleSave} style={{marginTop:'1rem'}}>
          <div className="grid two" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:'1rem'}}>
            <div className="stack" style={{display:'grid',gap:'1rem'}}>
              <section className="section-card">
                <h3>Basic details</h3>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Title</label>
                  <input className="form-field ux-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Project title" required />
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Client</label>
                  <input className="form-field ux-input" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} placeholder="Client name" />
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Description</label>
                  <textarea className="form-field ux-input" rows={5} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the work and outcome" />
                </div>
              </section>

              <section className="section-card">
                <h3>Gallery</h3>
                <div className="uploader" onClick={()=>document.getElementById('pf-uploader').click()}>
                  <div className="uploader-empty">
                    <div className="uploader-icon">⬆</div>
                    <div>
                      <strong>Click to upload</strong> or drag and drop
                      <div className="muted">JPG, PNG, WEBP, GIF (multiple)</div>
                    </div>
                  </div>
                  <input id="pf-uploader" type="file" accept="image/*" multiple onChange={onFiles} style={{display:'none'}} />
                </div>
                {!!form.thumbnails.length && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))',gap:'.5rem',marginTop:'.75rem'}}>
                    {form.thumbnails.map((url,idx)=> (
                      <div key={url+idx} className="card" style={{padding:'.25rem',position:'relative'}}>
                        <img src={url} alt="thumb" style={{width:'100%',borderRadius:10,objectFit:'cover',height:100}}/>
                        <button type="button" className="uploader-remove" style={{left:8,bottom:8}} onClick={()=>removeThumb(idx)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="section-card">
                <h3>Tags</h3>
                <div className="form-grid">
                  <label className="form-label">Add tags (comma separated)</label>
                  <input className="form-field ux-input" value={(form.tags||[]).join(', ')} onChange={e=>setForm(f=>({...f,tags:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} placeholder="web, design" />
                </div>
              </section>
            </div>

            <aside className="section-card" aria-label="Sidebar settings">
              <h3>Settings</h3>
              <div className="form-grid" style={{marginTop:'.5rem'}}>
                <label className="form-label">Project URL</label>
                <input className="form-field ux-input" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..." />
              </div>
              <label style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'.75rem'}}>
                <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))} />
                Featured
              </label>
            </aside>
          </div>

          <div className="bottom-actions">
            <div className="container" style={{display:'flex',justifyContent:'space-between',gap:'.75rem'}}>
              <button type="button" className="btn-secondary lg" onClick={()=>navigate('/admin/portfolio')}>Back</button>
              <div style={{display:'flex',gap:'.6rem'}}>
                {!isNew && <button type="button" className="btn-secondary lg" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>}
                <button type="submit" className="btn lg" disabled={saving}>{saving? 'Saving…':'Save'}</button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
