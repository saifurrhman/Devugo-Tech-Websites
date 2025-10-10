import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PricingAPI } from '../../lib/api';

function PlanForm({ initial, onCancel, onSave }){
  const [form, setForm] = useState(()=>({
    name: initial?.name || '',
    priceMonthly: initial?.priceMonthly ?? 0,
    priceYearly: initial?.priceYearly ?? 0,
    priceOneTime: initial?.priceOneTime ?? 0,
    features: (initial?.features||[]).join(', '),
    recommended: !!initial?.recommended,
    published: initial?.published ?? true,
    order: initial?.order ?? 0,
    planType: initial?.planType || 'subscription',
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
        priceOneTime: Number(form.priceOneTime)||0,
        features: form.features.split(',').map(s=>s.trim()).filter(Boolean),
        recommended: !!form.recommended,
        published: !!form.published,
        order: Number(form.order)||0,
        planType: form.planType,
      };
      await onSave(payload);
    }catch(err){ 
      setError(err.message||'Failed to save'); 
    }
    finally{ setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{marginTop:'1rem', padding: '1.5rem'}}>
      {error && <div style={{marginBottom:'.5rem',padding:'.75rem',background:'#fee2e2',color:'#991b1b',borderRadius:'6px',fontSize:'.875rem'}}>{error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <label style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
          <span style={{fontWeight:500,fontSize:'.875rem'}}>Plan Name</span>
          <input 
            className="form-field ux-input" 
            value={form.name} 
            onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
            placeholder="Starter / Pro / Business" 
            required 
            style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem'}}
          />
        </label>

        <label style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
          <span style={{fontWeight:500,fontSize:'.875rem'}}>Plan Type</span>
          <select 
            className="form-field ux-input" 
            value={form.planType} 
            onChange={e=>setForm(f=>({...f,planType:e.target.value}))}
            style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem'}}
          >
            <option value="subscription">Subscription (Monthly/Yearly)</option>
            <option value="one-time">One-Time Setup</option>
            <option value="custom">Custom Quote</option>
          </select>
        </label>

        {form.planType === 'subscription' && (
          <>
            <label style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
              <span style={{fontWeight:500,fontSize:'.875rem'}}>Price Monthly ($)</span>
              <input 
                type="number" 
                className="form-field ux-input" 
                value={form.priceMonthly} 
                onChange={e=>setForm(f=>({...f,priceMonthly:e.target.value}))} 
                min="0"
                step="0.01"
                style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem'}}
              />
              <span style={{fontSize:'.75rem',color:'#6b7280'}}>Monthly subscription price</span>
            </label>
            <label style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
              <span style={{fontWeight:500,fontSize:'.875rem'}}>Price Yearly ($)</span>
              <input 
                type="number" 
                className="form-field ux-input" 
                value={form.priceYearly} 
                onChange={e=>setForm(f=>({...f,priceYearly:e.target.value}))} 
                min="0"
                step="0.01"
                style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem'}}
              />
              <span style={{fontSize:'.75rem',color:'#6b7280'}}>Usually ~10× monthly with discount</span>
            </label>
          </>
        )}

        {form.planType === 'one-time' && (
          <label style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
            <span style={{fontWeight:500,fontSize:'.875rem'}}>One-Time Price ($)</span>
            <input 
              type="number" 
              className="form-field ux-input" 
              value={form.priceOneTime} 
              onChange={e=>setForm(f=>({...f,priceOneTime:e.target.value}))} 
              min="0"
              step="0.01"
              style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem'}}
            />
            <span style={{fontSize:'.75rem',color:'#6b7280'}}>One-time setup fee</span>
          </label>
        )}

        <label style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
          <span style={{fontWeight:500,fontSize:'.875rem'}}>Display Order</span>
          <input 
            type="number" 
            className="form-field ux-input" 
            value={form.order} 
            onChange={e=>setForm(f=>({...f,order:e.target.value}))} 
            style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem'}}
          />
          <span style={{fontSize:'.75rem',color:'#6b7280'}}>Lower numbers appear first</span>
        </label>
        
        <label style={{gridColumn:'1 / -1',display:'flex',flexDirection:'column',gap:'.35rem'}}>
          <span style={{fontWeight:500,fontSize:'.875rem'}}>Features (comma separated)</span>
          <textarea 
            className="form-field ux-input" 
            value={form.features} 
            onChange={e=>setForm(f=>({...f,features:e.target.value}))} 
            placeholder="10 pages, Contact form, Basic SEO, 24/7 Support"
            rows="3"
            style={{padding:'.625rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'.9375rem',fontFamily:'inherit',resize:'vertical'}}
          />
          <span style={{fontSize:'.75rem',color:'#6b7280'}}>Separate with commas. Example: 10 pages, Contact form, Basic SEO</span>
        </label>

        <label style={{display:'flex',alignItems:'center',gap:'.5rem',cursor:'pointer'}}>
          <input 
            type="checkbox" 
            checked={form.recommended} 
            onChange={e=>setForm(f=>({...f,recommended:e.target.checked}))} 
            style={{width:'18px',height:'18px',cursor:'pointer'}}
          />
          <span style={{fontSize:'.9375rem'}}>Mark as Recommended</span>
        </label>
        <label style={{display:'flex',alignItems:'center',gap:'.5rem',cursor:'pointer'}}>
          <input 
            type="checkbox" 
            checked={form.published} 
            onChange={e=>setForm(f=>({...f,published:e.target.checked}))} 
            style={{width:'18px',height:'18px',cursor:'pointer'}}
          />
          <span style={{fontSize:'.9375rem'}}>Published (visible on site)</span>
        </label>
      </div>
      
      <div style={{marginTop:'1.5rem',display:'flex',justifyContent:'flex-end',gap:'.75rem'}}>
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onCancel}
          style={{padding:'.625rem 1.5rem',fontSize:'.9375rem',borderRadius:'6px',border:'1px solid #d1d5db',background:'white',cursor:'pointer'}}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn" 
          disabled={saving}
          style={{padding:'.625rem 1.5rem',fontSize:'.9375rem',borderRadius:'6px',background:'#3b82f6',color:'white',border:'none',cursor:saving?'not-allowed':'pointer',opacity:saving?0.6:1}}
        >
          {saving ? 'Saving…' : (initial ? 'Update Plan' : 'Create Plan')}
        </button>
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
        const { items: fetchedItems } = await PricingAPI.list();
        if(mounted) {
          setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
        }
      }catch(err){ 
        if(mounted) setError(err.message||'Failed to load plans'); 
      }
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
    try {
      const { item } = await PricingAPI.create(payload);
      setItems(prev=>[item, ...prev]);
      setShowForm(false);
    } catch(err) {
      throw err;
    }
  }

  async function handleUpdate(id, payload){
    try {
      const { item } = await PricingAPI.update(id, payload);
      setItems(prev=>prev.map(p=>p._id===id? item : p));
      setEditItem(null);
    } catch(err) {
      throw err;
    }
  }

  async function handleDelete(id){
    if(!window.confirm('Delete this plan? This cannot be undone.')) return;
    try {
      await PricingAPI.remove(id);
      setItems(prev=>prev.filter(p=>p._id!==id));
    } catch(err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  async function toggleField(plan, field){
    try {
      const { item } = await PricingAPI.update(plan._id, { [field]: !plan[field] });
      setItems(prev=>prev.map(p=>p._id===plan._id? item : p));
    } catch(err) {
      alert('Failed to update: ' + err.message);
    }
  }

  async function addPreset(type){
    const presets = {
      starter: { 
        name:'Starter', 
        priceMonthly:199, 
        priceYearly:1990, 
        priceOneTime: 0,
        features:['Up to 5 pages','Responsive design','Basic SEO','Contact form','1 month support'], 
        recommended:false, 
        published:true, 
        order:1,
        planType: 'subscription'
      },
      pro: { 
        name:'Pro', 
        priceMonthly:399, 
        priceYearly:3990, 
        priceOneTime: 0,
        features:['Up to 15 pages','Blog integration','Advanced SEO + Analytics','Priority email support','3 months support'], 
        recommended:true, 
        published:true, 
        order:2,
        planType: 'subscription'
      },
      business: { 
        name:'Business', 
        priceMonthly:799, 
        priceYearly:7990, 
        priceOneTime: 0,
        features:['Unlimited pages','E-commerce integration','Advanced analytics','24/7 priority support','Custom integrations','6 months support'], 
        recommended:false, 
        published:true, 
        order:3,
        planType: 'subscription'
      },
    };
    try {
      const payload = presets[type];
      const { item } = await PricingAPI.create(payload);
      setItems(prev=>[item, ...prev]);
    } catch(err) {
      alert('Failed to add preset: ' + err.message);
    }
  }

  function formatPrice(plan) {
    if (plan.planType === 'custom') return 'Custom';
    if (plan.planType === 'one-time') return `$${plan.priceOneTime || 0}`;
    return `$${plan.priceMonthly || 0}/mo`;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content" style={{padding:'1.5rem'}}>
        <AdminTopbar />
        
        <div className="toolbar flex flex-wrap items-center justify-between gap-2 sm:gap-3" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1 style={{margin:0}}>Pricing Plans</h1>
          <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input 
                className="admin-search__input" 
                placeholder="Search plans..." 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
              />
            </div>
            <button onClick={()=>{ setShowForm(true); setEditItem(null); }} className="btn">+ Add Plan</button>
            <button onClick={()=>addPreset('starter')} className="btn-secondary">+ Starter</button>
            <button onClick={()=>addPreset('pro')} className="btn-secondary">+ Pro</button>
            <button onClick={()=>addPreset('business')} className="btn-secondary">+ Business</button>
          </div>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center'}}>
            <span className="badge">Total: {total}</span>
            <span className="badge">Published: {publishedCount}</span>
            <span className="badge">Draft: {total - publishedCount}</span>
          </div>
        )}

        

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && !showForm && !editItem && (
          filtered.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" style={{marginTop:'1rem'}}>
              {filtered.map(p => (
                <div className="card" key={p._id} style={{display:'grid',gap:'.5rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{p.name}</h3>
                    <span className="badge">{p.planType || 'subscription'}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <strong>{formatPrice(p)}</strong>
                    {p.recommended && <span className="badge">Recommended</span>}
                    <span className="badge">{p.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem',flexWrap:'wrap'}}>
                    <button className="btn-secondary" onClick={()=>{ setEditItem(p); setShowForm(false); }}>Edit</button>
                    <button className="btn-secondary" onClick={()=>toggleField(p,'recommended')}>{p.recommended ? 'Unmark Recommended' : 'Mark Recommended'}</button>
                    <button className="btn-secondary" onClick={()=>toggleField(p,'published')}>{p.published ? 'Unpublish' : 'Publish'}</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(p._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Pricing Plans Yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Create your first pricing plan to display on your website.</p>
              <button className="btn" onClick={()=>{ setShowForm(true); setEditItem(null); }} style={{marginTop:'.5rem'}}>Create First Plan</button>
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