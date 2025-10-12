import React, { useEffect, useRef, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import SocialIcon from '../../components/SocialIcon';
import { SocialLinksAPI } from '../../services/socialLinks';

export default function SocialLinks(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ platform: '', url: '', enabled: true });
  const [saving, setSaving] = useState(false);
  const presets = ['Facebook','Instagram','X','LinkedIn','YouTube','GitHub','WhatsApp','TikTok','Telegram','Pinterest','Dribbble','Behance','Reddit','Discord','Slack','Medium','Vimeo'];
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ platform:'', url:'', enabled:true });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState('');
  const [modalUrl, setModalUrl] = useState('https://');
  const [modalSaving, setModalSaving] = useState(false);
  const modalInputRef = useRef(null);

  useEffect(()=>{
    if(modalOpen && modalInputRef.current){
      try{ modalInputRef.current.focus(); }catch(_e){}
    }
  },[modalOpen]);

  useEffect(()=>{
    if(!modalOpen) return;
    const onKey = (e)=>{ if(e.key === 'Escape') setModalOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[modalOpen]);

  async function load(){
    setLoading(true);
    try{
      const { items } = await SocialLinksAPI.list();
      setItems(items);
    }catch(e){ console.error(e); }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  function onChange(e){
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onCreate(e){
    e.preventDefault();
    setSaving(true);
    try{
      await SocialLinksAPI.create(form);
      setForm({ platform: '', url: '', enabled: true });
      await load();
    }catch(e){ console.error(e); alert('Failed to create'); }
    setSaving(false);
  }

  async function onUpdate(id, patch){
    try{
      await SocialLinksAPI.update(id, patch);
      await load();
    }catch(e){ console.error(e); alert('Failed to update'); }
  }

  async function onDelete(id){
    if(!window.confirm('Delete this social link?')) return;
    try{
      await SocialLinksAPI.remove(id);
      await load();
    }catch(e){ console.error(e); alert('Failed to delete'); }
  }

  function quickAdd(preset){
    setModalPlatform(preset);
    setModalUrl('https://');
    setModalOpen(true);
  }

  async function confirmQuickAdd(){
    if(!modalUrl || !/^https?:\/\//i.test(modalUrl)){
      alert('Please enter a valid URL starting with http or https');
      return;
    }
    setModalSaving(true);
    try{
      await SocialLinksAPI.create({ platform: modalPlatform, url: modalUrl, enabled: true });
      setModalOpen(false);
      await load();
    }catch(_e){ alert('Failed to create'); }
    setModalSaving(false);
  }

  function cancelQuickAdd(){ setModalOpen(false); }

  function startEdit(item){
    setEditId(item._id);
    setEditForm({ platform: item.platform || '', url: item.url || '', enabled: !!item.enabled });
  }

  async function saveEdit(){
    try{
      await SocialLinksAPI.update(editId, editForm);
      setEditId(null);
      await load();
    }catch(e){ console.error(e); alert('Failed to save changes'); }
  }

  function cancelEdit(){ setEditId(null); }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Social Links</h1>

        <div className="card" style={{marginTop:'1rem'}}>
          <strong>Add new link</strong>
          <form className="form-grid" onSubmit={onCreate} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem', marginTop:'.6rem'}}>
            <label className="form-label">Platform
              <input className="form-field" name="platform" value={form.platform} onChange={onChange} placeholder="e.g. Facebook, X, LinkedIn" required />
            </label>
            <label className="form-label">URL
              <input className="form-field" name="url" value={form.url} onChange={onChange} placeholder="https://your-profile-or-page" required />
            </label>
            <div className="form-label" style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
              <span>Enabled</span>
              <button
                type="button"
                onClick={()=> setForm(f=>({...f, enabled: !f.enabled}))}
                aria-pressed={!!form.enabled}
                aria-label={`Toggle enabled`}
                style={{
                  width: '48px', height: '28px', borderRadius: '999px',
                  background: form.enabled ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)', position:'relative',
                  transition:'background .2s ease',
                }}
              >
                <span style={{
                  position:'absolute', top:'50%', transform:'translateY(-50%)',
                  left: form.enabled ? '24px' : '4px', width:'20px', height:'20px', borderRadius:'50%',
                  background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left .2s ease'
                }} />
              </button>
            </div>
            <div style={{gridColumn:'1 / -1'}}>
              <button className="btn" disabled={saving}>{saving?'Saving...':'Add link'}</button>
            </div>
          </form>
          <div className="muted" style={{marginTop:'.5rem'}}>Quick select</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem', marginTop:'.4rem'}}>
            {presets.map(p => (
              <div key={p} className="card" style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.5rem .6rem'}}>
                <SocialIcon name={p} size={18} />
                <span className="ql-name" style={{minWidth:'96px'}}>{p}</span>
                <div style={{marginLeft:'auto',display:'flex',gap:'.4rem'}}>
                  <button type="button" className="btn-secondary" onClick={()=>setForm(f=>({...f, platform: p}))}>Fill</button>
                  <button type="button" className="btn" onClick={()=>quickAdd(p)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{marginTop:'1rem'}}>
          <strong>All links</strong>
          {loading ? <div className="muted" style={{marginTop:'.5rem'}}>Loading...</div> : (
            <table className="table" style={{width:'100%', marginTop:'.5rem'}}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Platform</th>
                  <th>URL</th>
                  <th>Enabled</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it._id}>
                    <td>
                      <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'28px'}}>
                        <SocialIcon name={it.platform} size={18} />
                      </div>
                    </td>
                    {editId === it._id ? (
                      <>
                        <td>
                          <input className="form-field" value={editForm.platform} onChange={e=>setEditForm(f=>({...f, platform:e.target.value}))} />
                        </td>
                        <td>
                          <input className="form-field" value={editForm.url} onChange={e=>setEditForm(f=>({...f, url:e.target.value}))} />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={()=> setEditForm(f=>({...f, enabled: !f.enabled}))}
                            aria-pressed={!!editForm.enabled}
                            aria-label={`Toggle enabled`}
                            style={{
                              width: '44px', height: '24px', borderRadius: '999px',
                              background: editForm.enabled ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                              border: '1px solid rgba(255,255,255,0.2)', position:'relative',
                              transition:'background .2s ease',
                            }}
                          >
                            <span style={{
                              position:'absolute', top:'50%', transform:'translateY(-50%)',
                              left: editForm.enabled ? '22px' : '4px', width:'16px', height:'16px', borderRadius:'50%',
                              background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left .2s ease'
                            }} />
                          </button>
                        </td>
                        <td style={{whiteSpace:'nowrap'}}>
                          <button className="btn" onClick={saveEdit}>Save</button>
                          <button className="btn-secondary" onClick={cancelEdit} style={{marginLeft:'.4rem'}}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{it.platform}</td>
                        <td><a href={it.url} target="_blank" rel="noreferrer">{it.url}</a></td>
                        <td>
                          <button
                            type="button"
                            onClick={()=> onUpdate(it._id, { enabled: !it.enabled })}
                            aria-pressed={!!it.enabled}
                            aria-label={`Toggle enabled`}
                            style={{
                              width: '44px', height: '24px', borderRadius: '999px',
                              background: it.enabled ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                              border: '1px solid rgba(255,255,255,0.2)', position:'relative',
                              transition:'background .2s ease',
                            }}
                          >
                            <span style={{
                              position:'absolute', top:'50%', transform:'translateY(-50%)',
                              left: it.enabled ? '22px' : '4px', width:'16px', height:'16px', borderRadius:'50%',
                              background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left .2s ease'
                            }} />
                          </button>
                        </td>
                        <td style={{whiteSpace:'nowrap'}}>
                          <button className="btn" onClick={()=>startEdit(it)}>Edit</button>
                          <button className="btn-secondary" onClick={()=>onDelete(it._id)} style={{marginLeft:'.4rem'}}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {modalOpen && (
          <div className="admin-modal-backdrop" onClick={(e)=>{ if(e.target === e.currentTarget) cancelQuickAdd(); }} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div className="card" role="dialog" aria-modal="true" style={{width:'min(520px, 92vw)', padding:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                <SocialIcon name={modalPlatform} size={20} />
                <strong>Add {modalPlatform} link</strong>
              </div>
              <label className="form-label" style={{marginTop:'.8rem'}}>Profile/Page URL
                <input ref={modalInputRef} className="form-field" value={modalUrl} onChange={e=>setModalUrl(e.target.value)} placeholder="https://" />
              </label>
              <div className="settings-actions" style={{marginTop:'.8rem'}}>
                <button className="btn-secondary" onClick={cancelQuickAdd} disabled={modalSaving}>Cancel</button>
                <button className="btn" onClick={confirmQuickAdd} disabled={modalSaving || !/^https?:\/\//i.test(modalUrl)}>{modalSaving? 'Adding…':'Add link'}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
