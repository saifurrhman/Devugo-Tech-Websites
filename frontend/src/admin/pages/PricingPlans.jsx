import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PricingAPI } from '../../lib/api';

function PlanForm({ initial, onCancel, onSave }){
  const [form, setForm] = useState(()=>({
    name: initial?.name || '',
    priceMonthly: initial?.priceMonthly ?? 0,
    priceYearly: initial?.priceYearly ?? 0,
    features: (initial?.features||[]).join(', '),
    recommended: !!initial?.recommended,
    published: initial?.published ?? true,
    order: initial?.order ?? 0,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    setSaving(true); setError('');
    try{
      const payload = {
        name: form.name,
        priceMonthly: Number(form.priceMonthly)||0,
        priceYearly: Number(form.priceYearly)||0,
        features: form.features.split(',').map(s=>s.trim()).filter(Boolean),
        recommended: !!form.recommended,
        published: !!form.published,
        order: Number(form.order)||0,
      };
      await onSave(payload);
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{marginTop:'1rem'}}>
      {error && <div className="chip chip-error" style={{marginBottom:'.5rem'}}>{error}</div>}
      <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <label className="form-label">Name
          <input className="form-field ux-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Starter / Pro / Business" required />
        </label>
        <label className="form-label">Order
          <input type="number" className="form-field ux-input" value={form.order} onChange={e=>setForm(f=>({...f,order:e.target.value}))} />
        </label>
        <label className="form-label">Price Monthly
          <input type="number" className="form-field ux-input" value={form.priceMonthly} onChange={e=>setForm(f=>({...f,priceMonthly:e.target.value}))} />
          <div className="hint">Number only, without currency symbol.</div>
        </label>
        <label className="form-label">Price Yearly
          <input type="number" className="form-field ux-input" value={form.priceYearly} onChange={e=>setForm(f=>({...f,priceYearly:e.target.value}))} />
          <div className="hint">Usually ~10× monthly price with discount.</div>
        </label>
        <label className="form-label" style={{gridColumn:'1 / -1'}}>Features (comma separated)
          <input className="form-field ux-input" value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} placeholder="feature one, feature two" />
          <div className="hint">Separate with commas. Example: 10 pages, Contact form, Basic SEO</div>
        </label>
        <label style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
          <input type="checkbox" checked={form.recommended} onChange={e=>setForm(f=>({...f,recommended:e.target.checked}))} />
          Recommended
        </label>
        <label style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
          <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
          Published
        </label>
      </div>
      <div className="bottom-actions" style={{position:'sticky'}}>
        <div className="container" style={{display:'flex',justifyContent:'space-between',gap:'.75rem'}}>
          <button type="button" className="btn-secondary lg" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn lg" disabled={saving}>{saving? 'Saving…':'Save'}</button>
        </div>
      </div>
    </form>
  );
}

export default function PricingPlans(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const total = items.length;
  const publishedCount = items.filter(p=>!!p.published).length;

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await PricingAPI.list();
        if(mounted) setItems(items||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load plans'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if(!term) return items;
    return items.filter(p => (p.name||'').toLowerCase().includes(term));
  },[q, items]);

  async function handleCreate(payload){
    const { item } = await PricingAPI.create(payload);
    setItems(prev=>[item, ...prev]);
    setShowForm(false);
  }

  async function handleUpdate(id, payload){
    const { item } = await PricingAPI.update(id, payload);
    setItems(prev=>prev.map(p=>p._id===id? item : p));
    setEditItem(null);
  }

  async function handleDelete(id){
    if(!window.confirm('Delete this plan?')) return;
    await PricingAPI.remove(id);
    setItems(prev=>prev.filter(p=>p._id!==id));
  }

  async function toggleField(plan, field){
    const { item } = await PricingAPI.update(plan._id, { [field]: !plan[field] });
    setItems(prev=>prev.map(p=>p._id===plan._id? item : p));
  }

  async function addPreset(type){
    const presets = {
      starter: { name:'Starter', priceMonthly:199, priceYearly:1990, features:['Up to 5 pages','Responsive design','Basic SEO'], recommended:false, published:true, order:1 },
      pro:     { name:'Pro',     priceMonthly:399, priceYearly:3990, features:['Up to 15 pages','Blog','SEO + Analytics'], recommended:true,  published:true, order:2 },
      business:{ name:'Business',priceMonthly:799, priceYearly:7990, features:['Unlimited pages','E-commerce','Priority support'], recommended:false, published:true, order:3 },
    };
    const payload = presets[type];
    const { item } = await PricingAPI.create(payload);
    setItems(prev=>[item, ...prev]);
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1 style={{margin:0}}>Pricing Plans</h1>
          <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search plans..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <div className="btn-group" style={{display:'flex',gap:'.35rem'}}>
              <button className="btn" onClick={()=>{ setShowForm(true); setEditItem(null); }}>Add Plan</button>
              <button className="btn-secondary" onClick={()=>addPreset('starter')}>Add Starter</button>
              <button className="btn-secondary" onClick={()=>addPreset('pro')}>Add Pro</button>
              <button className="btn-secondary" onClick={()=>addPreset('business')}>Add Business</button>
            </div>
          </div>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center'}}>
            <span className="badge">Total: {total}</span>
            <span className="badge">Published: {publishedCount}</span>
          </div>
        )}

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="card" style={{marginTop:'1rem'}}>
              <div className="table" role="table">
                <div className="table-row head" role="row">
                  <div role="columnheader">Name</div>
                  <div role="columnheader">Monthly</div>
                  <div role="columnheader">Yearly</div>
                  <div role="columnheader">Recommended</div>
                  <div role="columnheader">Published</div>
                  <div role="columnheader">Actions</div>
                </div>
                {filtered.map(p => (
                  <div className="table-row" role="row" key={p._id}>
                    <div role="cell">{p.name}</div>
                    <div role="cell">${p.priceMonthly}</div>
                    <div role="cell">${p.priceYearly}</div>
                    <div role="cell">
                      <button className="btn-secondary" onClick={()=>toggleField(p,'recommended')}>
                        {p.recommended ? 'Recommended' : 'Not recommended'}
                      </button>
                    </div>
                    <div role="cell">
                      <button className="btn-secondary" onClick={()=>toggleField(p,'published')}>
                        {p.published ? 'Published' : 'Draft'}
                      </button>
                    </div>
                    <div role="cell" style={{display:'flex',gap:'.4rem'}}>
                      <button className="btn-secondary" onClick={()=>{ setEditItem(p); setShowForm(false); }}>Edit</button>
                      <button className="btn-secondary" onClick={()=>handleDelete(p._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Plans Yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Add pricing plans to display on the public site.</p>
              <button className="btn" style={{marginTop:'.5rem'}} onClick={()=>{ setShowForm(true); setEditItem(null); }}>Add a Plan</button>
            </div>
          )
        )}

        {showForm && (
          <PlanForm
            initial={null}
            onCancel={()=>setShowForm(false)}
            onSave={handleCreate}
          />
        )}

        {editItem && (
          <PlanForm
            initial={editItem}
            onCancel={()=>setEditItem(null)}
            onSave={(payload)=>handleUpdate(editItem._id, payload)}
          />
        )}
      </main>
    </div>
  );
}
