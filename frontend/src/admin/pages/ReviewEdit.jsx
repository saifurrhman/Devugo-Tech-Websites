import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientReviewAPI, UploadAPI } from '../../lib/api'; // ✅ UploadAPI add kiya
import { useConfirm } from '../../contexts/ConfirmContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import Spinner from '../../components/Spinner';

export default function ReviewEdit(){
  const confirm = useConfirm();
  const notify = useNotification();
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name:'', role:'', company:'', rating:5, summary:'', avatar:'', featured:true });
  const [avatarOk, setAvatarOk] = useState(true);

  // ✅ Team Jaisa Upload Function - UploadAPI Use Karta Hai
  async function onAvatarFileChange(e){
    const file = e.target.files?.[0];
    if(!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      notify.error('Only image files are allowed (jpeg, jpg, png, gif, webp)');
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      notify.error('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    
    try {
      // ✅ Use UploadAPI (Team jaisa)
      const { data } = await UploadAPI.uploadSingle(file);
      
      if (data && data.url) {
        setForm(f => ({ ...f, avatar: data.url }));
        setAvatarOk(true);
        notify.success('Avatar uploaded successfully!');
      } else {
        throw new Error('Upload failed - no URL returned');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      notify.error(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  }

  useEffect(()=>{
    if(isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true);
      try{
        const { item } = await ClientReviewAPI.get(id);
        if(mounted) setForm({
          name: item.name||'', role:item.role||'', company:item.company||'', rating: item.rating||5,
          summary:item.summary||'', avatar:item.avatar||'', featured: !!item.featured,
        });
      }catch(err){ if(mounted) notify.error(err.message||'Failed to load'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true);
    try{
      const payload = { ...form, rating: Math.min(5, Math.max(1, Number(form.rating)||5)) };
      if (isNew) { 
        await ClientReviewAPI.create(payload); 
        notify.success('Review created');
        navigate('/admin/reviews'); 
      }
      else { 
        await ClientReviewAPI.update(id, payload); 
        notify.success('Review saved'); 
      }
    }catch(err){ notify.error(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if(isNew) return;
    await confirm.show({
      title: 'Delete Review',
      message: 'Delete this review?',
      variant: 'danger',
      confirmText: 'Delete',
      action: async () => {
        await ClientReviewAPI.remove(id); 
        notify.success('Review deleted');
        navigate('/admin/reviews'); 
      }
    });
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:'.6rem',padding:'0.5rem'}}>
          <h1 style={{fontSize: 'clamp(1.5rem, 5vw, 2rem)'}}>{isNew? 'Add Review':'Edit Review'}</h1>
        </div>

        {loading ? <LoadingState message="Loading review details..." /> : (
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {uploading && <Spinner size="sm" />}
                      {uploading ? 'Uploading' : 'Upload'}
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

            <div className="admin-sticky-footer">
              <button type="button" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm text-gray-300" onClick={()=>navigate('/admin/reviews')}>Cancel</button>
              {!isNew && <button type="button" className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-sm" onClick={handleDelete}>Delete</button>}
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium" disabled={saving || uploading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: (saving || uploading) ? 0.7 : 1 }}>
                {saving && <Spinner size="sm" />}
                <span>{saving? 'Saving...':'Save'}</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}