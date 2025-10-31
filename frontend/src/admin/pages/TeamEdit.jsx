import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TeamAPI, UploadAPI } from '../../lib/api';

export default function TeamEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', role: '', bio: '', avatar: '', socials: { linkedin:'', twitter:'', github:'', website:'' }
  });
  const [avatarOk, setAvatarOk] = useState(true);

  async function onAvatarFileChange(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try{
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        setAvatarOk(true);
        setForm(f=>({...f, avatar:url }));
        setMessage('Avatar uploaded');
      }catch(err){
        setError(err.message || 'Failed to upload avatar');
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(()=>{
    if (isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { member } = await TeamAPI.get(id);
        if(!mounted) return;
        setForm({
          name: member.name || '',
          role: member.role || '',
          bio: member.bio || '',
          avatar: member.avatar || '',
          socials: {
            linkedin: member.socials?.linkedin || '',
            twitter: member.socials?.twitter || '',
            github: member.socials?.github || '',
            website: member.socials?.website || '',
          }
        });
      }catch(err){ if(mounted) setError(err.message||'Failed to load member'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = { ...form };
      if (isNew){ await TeamAPI.create(payload); navigate('/admin/team'); }
      else { await TeamAPI.update(id, payload); setMessage('Saved'); }
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if (isNew) return;
    if(!window.confirm('Remove this member?')) return;
    setSaving(true); setError(''); setMessage('');
    try{ await TeamAPI.remove(id); navigate('/admin/team'); }
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
            <Link to="/admin/team">Team</Link>
            <span>/</span>
            <strong className="active" aria-current="page">{isNew ? 'Create' : 'Edit'}</strong>
          </div>
        </div>

        <h1 className="page-title" style={{marginTop:'.25rem'}}>{isNew? 'Add Member' : 'Edit Member'}</h1>
        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}

        <form onSubmit={handleSave} style={{marginTop:'1rem'}}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <div className="stack" style={{display:'grid',gap:'1rem'}}>
              <section className="section-card">
                <h3>Basic details</h3>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Name</label>
                  <input className="form-field ux-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g., Jane Doe" required />
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Role</label>
                  <input className="form-field ux-input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g., Senior Designer" />
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Bio</label>
                  <textarea className="form-field ux-input" rows={5} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="A short intro about this member" />
                </div>
              </section>
            </div>
            <aside className="section-card" aria-label="Sidebar settings">
              <h3>Profile</h3>
              <div className="form-grid" style={{marginTop:'.5rem'}}>
                <label className="form-label">Avatar URL</label>
                <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
                  <input className="form-field ux-input" value={form.avatar} onChange={e=>{ setAvatarOk(true); setForm(f=>({...f,avatar:e.target.value})); }} placeholder="https://..." style={{flex:1}} />
                  <input id="avatar-file" type="file" accept="image/*" onChange={onAvatarFileChange} style={{display:'none'}} />
                  <button type="button" className="btn-secondary" onClick={()=>document.getElementById('avatar-file').click()}>Upload image</button>
                </div>
                {(form.avatar || form.name) && (
                  <div className="preview" style={{marginTop:'.6rem',display:'flex',alignItems:'center',gap:'.6rem'}}>
                    <div className="avatar-preview">
                      {form.avatar && avatarOk ? (
                        <img src={form.avatar} alt="avatar preview" onError={()=>setAvatarOk(false)} style={{width:56,height:56,borderRadius:'50%',objectFit:'cover'}} />
                      ) : (
                        <div className="avatar-fallback" style={{width:56,height:56,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'#eef2f7',color:'#0f172a',fontWeight:800}}>
                          {(form.name||'').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <small className="muted">Preview</small>
                      {!/^https?:\/\/.*\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(form.avatar||'') && form.avatar && (
                        <div className="hint" style={{marginTop:'.15rem'}}>Use a direct image URL ending in .png, .jpg, .jpeg, .webp, or .gif</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="divider" style={{margin:'1rem 0'}}/>
              <h4 style={{margin:'0 0 .4rem'}}>Social links</h4>
              <div className="form-grid">
                <label className="form-label">LinkedIn</label>
                <input className="form-field ux-input" value={form.socials.linkedin} onChange={e=>setForm(f=>({...f,socials:{...f.socials, linkedin:e.target.value}}))} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="form-grid" style={{marginTop:'.6rem'}}>
                <label className="form-label">Twitter/X</label>
                <input className="form-field ux-input" value={form.socials.twitter} onChange={e=>setForm(f=>({...f,socials:{...f.socials, twitter:e.target.value}}))} placeholder="https://x.com/..." />
              </div>
              <div className="form-grid" style={{marginTop:'.6rem'}}>
                <label className="form-label">GitHub</label>
                <input className="form-field ux-input" value={form.socials.github} onChange={e=>setForm(f=>({...f,socials:{...f.socials, github:e.target.value}}))} placeholder="https://github.com/..." />
              </div>
              <div className="form-grid" style={{marginTop:'.6rem'}}>
                <label className="form-label">Website</label>
                <input className="form-field ux-input" value={form.socials.website} onChange={e=>setForm(f=>({...f,socials:{...f.socials, website:e.target.value}}))} placeholder="https://..." />
              </div>
            </aside>
          </div>

           <div className="bottom-actions">
            <div className="container flex flex-row items-center justify-end gap-3">
              <button type="button" className="btn-secondary lg" onClick={()=>navigate('/admin/team')} style={{backgroundColor: 'white', color: 'black', padding: '8px 16px', borderRadius: '8px'}}>Cancel</button>
              {!isNew && <button type="button" className="btn-secondary lg" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444', backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px'}}>Delete</button>}
              <button type="submit" className="btn lg" disabled={saving} style={{backgroundColor: '#0f2b5b', color: 'white', padding: '8px 16px', borderRadius: '8px'}}>{saving? 'Saving…':'Save'}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}