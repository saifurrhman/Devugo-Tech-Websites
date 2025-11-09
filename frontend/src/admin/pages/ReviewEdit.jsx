import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientReviewAPI, UploadAPI } from '../../lib/api'; // ✅ UploadAPI add kiya

export default function ReviewEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name:'', role:'', company:'', rating:5, summary:'', avatar:'', featured:true });
  const [avatarOk, setAvatarOk] = useState(true);

  // ✅ Team Jaisa Upload Function - UploadAPI Use Karta Hai
  async function onAvatarFileChange(e){
    const file = e.target.files?.[0];
    if(!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only image files are allowed (jpeg, jpg, png, gif, webp)');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setUploading(true);
    setError('');
    setMessage('');
    
    try {
      // ✅ Use UploadAPI (Team jaisa)
      const { data } = await UploadAPI.uploadSingle(file);
      
      if (data && data.url) {
        setForm(f => ({ ...f, avatar: data.url }));
        setAvatarOk(true);
        setMessage('Avatar uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Upload failed - no URL returned');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload avatar');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  }

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
        <div className="toolbar" style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:'.6rem',padding:'0.5rem'}}>
          <h1 style={{fontSize: 'clamp(1.5rem, 5vw, 2rem)'}}>{isNew? 'Add Review':'Edit Review'}</h1>
        </div>

        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}
        {uploading && <div className="chip" style={{marginTop:'.5rem'}}>Uploading...</div>}

        {loading ? <div className="card" style={{marginTop:'1rem'}}>Loading…</div> : (
          <form onSubmit={handleSave} className="create-post" style={{marginTop:'.9rem'}}>
            <div className="grid two" style={{
              alignItems: 'start',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              <section className="section-card">
                <h3>Details</h3>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Name</label>
                  <input className="form-field ux-input w-full" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Enter your name" required />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Role / Title</label>
                  <input className="form-field ux-input w-full" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g. CEO, Manager" />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Company</label>
                  <input className="form-field ux-input w-full" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Enter company name" />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Rating (1–5)</label>
                  <input type="number" min="1" max="5" className="form-field ux-input w-full" value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))} placeholder="5" />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Summary (short)</label>
                  <textarea className="form-field ux-input w-full" rows={3} value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))} placeholder="Short highlight or testimonial" />
                </div>
              </section>

              <aside className="section-card">
                <h3>Settings</h3>
                
                {/* ✅ Avatar Upload Section - Team Style */}
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Avatar URL</label>
                  
                  {/* ✅ Input aur Button Ek Line Mein */}
                  <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
                    <input 
                      className="form-field ux-input" 
                      value={form.avatar} 
                      onChange={e=>{ 
                        setAvatarOk(true); 
                        setForm(f=>({...f,avatar:e.target.value})); 
                      }} 
                      placeholder="https://..." 
                      style={{flex:1}} 
                    />
                    <input 
                      id="avatar-file-review" 
                      type="file" 
                      accept="image/*" 
                      onChange={onAvatarFileChange} 
                      style={{display:'none'}} 
                    />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={()=>document.getElementById('avatar-file-review').click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  
                  {/* ✅ Avatar Preview - Team Style */}
                  {(form.avatar || form.name) && (
                    <div className="preview" style={{marginTop:'.6rem',display:'flex',alignItems:'center',gap:'.6rem'}}>
                      <div className="avatar-preview">
                        {form.avatar && avatarOk ? (
                          <img 
                            src={form.avatar} 
                            alt="avatar preview" 
                            onError={()=>setAvatarOk(false)} 
                            style={{width:56,height:56,borderRadius:'50%',objectFit:'cover'}} 
                          />
                        ) : (
                          <div className="avatar-fallback" style={{width:56,height:56,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'#eef2f7',color:'#0f172a',fontWeight:800}}>
                            {(form.name||'?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <small className="muted">Preview</small>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <input type="checkbox" checked={!!form.featured} onChange={e=>setForm(f=>({...f, featured:e.target.checked}))} />
                    <span className="form-label" style={{margin:0}}>Featured Review</span>
                  </label>
                </div>
              </aside>
            </div>

            <div className="bottom-actions">
              <div className="container flex flex-row items-center justify-end gap-3">
                <button type="button" className="btn-secondary lg" onClick={()=>navigate('/admin/reviews')} style={{backgroundColor: 'white', color: 'black', padding: '8px 16px', borderRadius: '8px'}}>Cancel</button>
                {!isNew && <button type="button" className="btn-secondary lg" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444', backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px'}}>Delete</button>}
                <button type="submit" className="btn lg" disabled={saving || uploading} style={{backgroundColor: '#0f2b5b', color: 'white', padding: '8px 16px', borderRadius: '8px'}}>{saving? 'Saving…':'Save'}</button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}