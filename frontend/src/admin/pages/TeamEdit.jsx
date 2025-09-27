import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { TeamAPI } from '../../lib/api';

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
        <h1>{isNew? 'Add Member' : 'Edit Member'}</h1>
        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}
        <form onSubmit={handleSave} className="card" style={{marginTop:'1rem'}}>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <label className="form-label">Name
              <input className="form-field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
            </label>
            <label className="form-label">Role
              <input className="form-field" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} />
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Bio
              <textarea className="form-field" rows={4} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} />
            </label>
            <label className="form-label">Avatar URL
              <input className="form-field" value={form.avatar} onChange={e=>setForm(f=>({...f,avatar:e.target.value}))} placeholder="https://..." />
            </label>
            <label className="form-label">LinkedIn
              <input className="form-field" value={form.socials.linkedin} onChange={e=>setForm(f=>({...f,socials:{...f.socials, linkedin:e.target.value}}))} placeholder="https://linkedin.com/in/..." />
            </label>
            <label className="form-label">Twitter/X
              <input className="form-field" value={form.socials.twitter} onChange={e=>setForm(f=>({...f,socials:{...f.socials, twitter:e.target.value}}))} placeholder="https://x.com/..." />
            </label>
            <label className="form-label">GitHub
              <input className="form-field" value={form.socials.github} onChange={e=>setForm(f=>({...f,socials:{...f.socials, github:e.target.value}}))} placeholder="https://github.com/..." />
            </label>
            <label className="form-label">Website
              <input className="form-field" value={form.socials.website} onChange={e=>setForm(f=>({...f,socials:{...f.socials, website:e.target.value}}))} placeholder="https://..." />
            </label>
          </div>
          <div className="settings-actions" style={{display:'flex',justifyContent:'space-between',gap:'.5rem'}}>
            <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/team')}>Back</button>
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
