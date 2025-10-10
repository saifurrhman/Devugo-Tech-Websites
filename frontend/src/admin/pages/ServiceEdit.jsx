import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ServiceAPI, PricingAPI } from '../../lib/api';

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
  const [plans, setPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]); // array of plan ids

  useEffect(()=>{
    if (isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const [{ item }, { items: allPlans }] = await Promise.all([
          ServiceAPI.get(id),
          PricingAPI.list(),
        ]);
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
        setPlans(allPlans||[]);
        const preselected = (item.pricingRelations||[]).map(String);
        // also include any plans that already point to this service
        const also = (allPlans||[]).filter(p=>String(p.service||'')===String(id)).map(p=>String(p._id));
        const merged = Array.from(new Set([ ...preselected, ...also ]));
        setSelectedPlans(merged);
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
        pricingRelations: selectedPlans,
      };
      if (isNew){
        const { item } = await ServiceAPI.create(payload);
        // assign plans to this new service
        await syncPlanLinks(item._id, [], selectedPlans);
        // Notify lists to refresh
        try{ window.dispatchEvent(new Event('services:updated')); }catch(_e){}
        navigate('/admin/services');
      } else {
        const before = selectedPlansBefore;
        const { item } = await ServiceAPI.update(id, payload);
        await syncPlanLinks(item._id, before, selectedPlans);
        // Notify lists to refresh
        try{ window.dispatchEvent(new Event('services:updated')); }catch(_e){}
        setMessage('Saved');
      }
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  // Keep a snapshot of preselected for diffing on save
  const [selectedPlansBefore, setSelectedPlansBefore] = useState([]);
  useEffect(()=>{ if (selectedPlans.length && !selectedPlansBefore.length) setSelectedPlansBefore(selectedPlans); },[selectedPlans]);

  async function syncPlanLinks(serviceId, beforeIds, afterIds){
    const beforeSet = new Set((beforeIds||[]).map(String));
    const afterSet = new Set((afterIds||[]).map(String));
    const toAdd = Array.from(afterSet).filter(id=>!beforeSet.has(id));
    const toRemove = Array.from(beforeSet).filter(id=>!afterSet.has(id));
    // Assign service on added plans
    await Promise.all(toAdd.map(pid => PricingAPI.update(pid, { service: serviceId })));
    // Unassign service on removed plans (only if they currently point to this service)
    await Promise.all(toRemove.map(pid => PricingAPI.update(pid, { service: null })));
  }

  async function handleDelete(){
    if (isNew) return;
    if(!window.confirm('Delete this service?')) return;
    setSaving(true); setError(''); setMessage('');
    try{ await ServiceAPI.remove(id); try{ window.dispatchEvent(new Event('services:updated')); }catch(_e){}; navigate('/admin/services'); }
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
      <main className="admin-content create-post">
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

        <h1 className="page-title" style={{marginTop:'.25rem'}}>
          {isNew ? 'Create Service' : 'Edit Service'}
          <span className="badge" style={{marginLeft:'.6rem'}}>{form.published ? 'Published' : 'Draft'}</span>
        </h1>
        {error && <div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>}
        {message && <div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>}

        <form onSubmit={handleSave} style={{marginTop:'1rem'}}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <div className="stack" style={{display:'grid',gap:'1rem'}}>
              <section className="section-card">
                <h3>Basic details</h3>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Title</label>
                  <input className="form-field ux-input" placeholder="e.g., UX UI Design" value={form.title} onChange={e=>syncSlug(e.target.value)} required minLength={3} />
                  <div className="hint">Keep it short and action‑oriented (e.g., "UX UI Design").</div>
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Slug</label>
                  <input className="form-field ux-input" placeholder="service-slug" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} aria-describedby="slug-hint" />
                  <div className="hint">Auto‑generated from title. You can customize it.</div>
                </div>
                <div className="form-grid" style={{marginTop:'.75rem'}}>
                  <label className="form-label">Short Description</label>
                  <textarea className="form-field ux-input" rows={4} placeholder="1–2 sentences that summarize the service" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
                  <div className="hint" id="slug-hint">1–2 sentences that summarize the service.</div>
                </div>
              </section>

              <section className="section-card">
                <h3>Content</h3>
                <div className="form-grid">
                  <label className="form-label">Features (comma separated)</label>
                  <input className="form-field ux-input" placeholder="feature one, feature two" value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} aria-label="Service features" />
                  <div className="hint">Separate with commas. Example: strategy workshop, prototypes, design system</div>
                </div>
              </section>
            </div>

            <aside className="section-card" aria-label="Sidebar settings">
              <h3>Settings</h3>
              <div className="form-grid" style={{marginTop:'.5rem'}}>
                <label className="form-label">Icon URL</label>
                <input className="form-field ux-input" placeholder="https://cdn.example.com/icon.png" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} />
                {form.icon && (
                  <div className="preview" style={{marginTop:'.5rem',display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <img src={form.icon} alt="icon preview" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}}/>
                    <small className="muted">Preview</small>
                  </div>
                )}
              </div>
              <div className="form-grid" style={{marginTop:'.75rem'}}>
                <label className="form-label">Order</label>
                <input type="number" className="form-field ux-input" value={form.order} onChange={e=>setForm(f=>({...f,order:e.target.value}))} />
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

              <div className="divider" style={{margin:'1rem 0'}}/>
              <div>
                <h4 style={{margin:'0 0 .4rem'}}>Related Pricing Plans</h4>
                {!plans.length && <div className="muted">No plans yet. Create plans first in Pricing.</div>}
                {!!plans.length && (
                  <div style={{display:'grid',gap:'.35rem'}}>
                    {plans.map(p => (
                      <label key={p._id} style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                        <input
                          type="checkbox"
                          checked={selectedPlans.includes(p._id)}
                          onChange={e=>{
                            const checked = e.target.checked;
                            setSelectedPlans(prev => checked ? Array.from(new Set([...prev, p._id])) : prev.filter(id=>id!==p._id));
                          }}
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="bottom-actions">
            <div className="container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
              <button type="button" className="btn-secondary lg order-2 sm:order-1" onClick={()=>navigate('/admin/services')}>Back</button>
              <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
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
