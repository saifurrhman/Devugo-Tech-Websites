import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { FormAPI } from '../../lib/api';

const KEYS = ['contact','services'];

function defaultTemplate(key){
  if(key === 'contact'){
    return {
      key: 'contact', enabled: true,
      title: "Let’s work together",
      subtitle: 'Ready to take your business to the next level? Reach out, and let’s discuss how we can help.',
      buttonText: 'Submit', successMessage: 'Thanks! Your message has been sent.',
      fields: [
        { name:'name', label:'Name', type:'text', placeholder:'Your name', required:true, order:0 },
        { name:'email', label:'Email', type:'email', placeholder:'Email address', required:true, order:1 },
        { name:'company', label:'Company', type:'text', placeholder:'Company name', required:false, order:2 },
        { name:'phone', label:'Phone', type:'tel', placeholder:'Phone (optional)', required:false, order:3 },
        { name:'website', label:'Website (if any)', type:'text', placeholder:'https://', required:false, order:4 },
        { name:'budget', label:'Budget', type:'select', required:false, order:5,
          options:[{label:'< $1k',value:'<1k'},{label:'$1k–$5k',value:'1k-5k'},{label:'$5k–$10k',value:'5k-10k'},{label:'$10k+',value:'10k+'}] },
        { name:'message', label:'Tell us more about your project', type:'textarea', placeholder:'Share a bit about goals, timeline, and scope.', required:true, order:6 },
      ],
    };
  }
  // services
  return {
    key: 'services', enabled: true,
    title: 'Let’s build something great',
    subtitle: 'Tell us briefly about your goals. We’ll reply within 1 business day.',
    buttonText: 'Submit', successMessage: 'Thanks! We\'ll get back to you shortly.',
    fields: [
      { name:'name', label:'Name', type:'text', placeholder:'Your name', required:true, order:0 },
      { name:'email', label:'Email', type:'email', placeholder:'Email address', required:true, order:1 },
      { name:'phone', label:'Phone', type:'tel', placeholder:'Phone (optional)', required:false, order:2 },
      { name:'message', label:'Message', type:'textarea', placeholder:'What do you want to build?', required:true, order:3 },
    ],
  };
}

function TypeBadge({ type }){
  const map = { text:'#3b82f6', email:'#06b6d4', tel:'#22c55e', textarea:'#a855f7', select:'#f59e0b' };
  const bg = map[type] || '#64748b';
  return <span className="badge" style={{background:bg, color:'#fff'}}>{type}</span>;
}

function Preview({ model }){
  const fields = (model?.fields||[]);
  const typeToInput = (f)=>{
    if(f.type==='textarea') return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <textarea placeholder={f.placeholder||''} rows="4" readOnly />
      </div>
    );
    if(f.type==='select') return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <select disabled>
          <option>{f.placeholder||'Select'}</option>
          {(f.options||[]).map(o=> <option key={o.value||o.label}>{o.label}</option>)}
        </select>
      </div>
    );
    const t = (f.type==='email'?'email': f.type==='tel'?'tel':'text');
    return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <input type={t} placeholder={f.placeholder||''} readOnly />
      </div>
    );
  };
  return (
    <div className="card" style={{padding:'1rem'}}>
      <strong style={{display:'block',marginBottom:'.5rem'}}>Live preview</strong>
      {model?.title && <h3 style={{margin:'0 0 .25rem'}}>{model.title}</h3>}
      {model?.subtitle && <p className="muted" style={{margin:'0 0 .75rem'}}>{model.subtitle}</p>}
      <div className="grid two">
        {fields.slice(0,2).map(typeToInput)}
      </div>
      <div className="grid two">
        {fields.slice(2,4).map(typeToInput)}
      </div>
      {fields.slice(4).map(typeToInput)}
      <div className="actions" style={{marginTop:'.5rem'}}>
        <button className="btn cta-solid" disabled>{model?.buttonText||'Submit'}</button>
      </div>
    </div>
  );
}

export default function Forms(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const byKey = useMemo(()=> Object.fromEntries(items.map(i=>[i.key, i])), [items]);

  const [editingKey, setEditingKey] = useState('contact');
  const editing = byKey[editingKey] || defaultTemplate(editingKey);
  const [model, setModel] = useState(editing);

  useEffect(()=>{ setModel(editing); }, [editingKey, items]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const res = await FormAPI.list();
        setItems(res.items || []);
      }catch(e){ setError(e.message||'Failed to load form configs'); }
      finally{ setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  async function save(){
    try{
      const exists = byKey[model.key];
      const payload = { ...model, fields: (model.fields||[]).map((f,i)=>({ ...f, order: i })) };
      if(exists){
        const updated = await FormAPI.update(exists._id || exists.id, payload);
        setItems(prev=> prev.map(it=> (it.key===updated.key? updated : it)));
      }else{
        const created = await FormAPI.create(payload);
        setItems(prev=> [...prev, created]);
      }
      alert('Saved');
    }catch(e){ alert(e.message||'Save failed'); }
  }

  // Save directly without modal

  function addField(){
    setModel(m=> ({ ...m, fields:[...(m.fields||[]), { name:'field'+((m.fields?.length||0)+1), label:'Field', type:'text', placeholder:'', required:false }] }));
  }
  function removeField(idx){
    setModel(m=> ({ ...m, fields: (m.fields||[]).filter((_,i)=> i!==idx) }));
  }
  function moveField(idx, dir){
    setModel(m=>{
      const arr=[...(m.fields||[])];
      const j=idx+dir; if(j<0||j>=arr.length) return m;
      const t=arr[idx]; arr[idx]=arr[j]; arr[j]=t; return { ...m, fields: arr };
    });
  }

  return (
    <div className="admin-layout create-post">
      <AdminSidebar />
      <main className="admin-content forms-page">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <div>
            <h1>Forms</h1>
            <small className="muted">Editing: <strong>{editingKey}</strong> → {editingKey==='contact' ? 'Contact page' : 'Services page (bottom form)'}</small>
          </div>
          <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
            <button className="btn-secondary" onClick={save}>Save</button>
          </div>
        </div>
        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem',color:'#ef4444'}}>{error}</div>}
        {!loading && !error && (
          <div className="cards-grid two" style={{marginTop:'1rem'}}>
            <div className="card forms-selector" style={{padding:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <strong>Select form</strong>
              </div>
              <div style={{display:'grid',gap:'.5rem',marginTop:'.6rem'}}>
                {KEYS.map(k=> {
                  const st = byKey[k];
                  const isOn = !!st?.enabled;
                  return (
                    <button key={k} className={`btn selector-btn ${editingKey===k?'cta-solid':'secondary'}`} onClick={()=>setEditingKey(k)} style={{display:'flex',justifyContent:'space-between'}}>
                      <span style={{textTransform:'lowercase'}}>{k}</span>
                      <span className="badge" style={{background:isOn?'rgba(34,197,94,.16)':'rgba(239,68,68,.16)',borderColor:isOn?'rgba(34,197,94,.45)':'rgba(239,68,68,.45)',color:isOn?'#22c55e':'#ef4444'}}>
                        {isOn? 'Published' : 'Disabled'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="divider" style={{margin:'1rem 0'}}></div>
            </div>
            <div className="section-card" style={{display:'grid', gap:'.9rem', position:'sticky', top: 84}}>
              <strong>Settings</strong>
              <div className="grid two">
                <div className="form-field">
                  <label>Enabled <small className="muted" style={{marginLeft:'.25rem'}}>{model.enabled? '(Published)' : '(Disabled)'}</small></label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!model.enabled}
                    onClick={()=> setModel(m=> ({...m, enabled: !m.enabled}))}
                    className="toggle"
                    style={{
                      display:'inline-flex', alignItems:'center', width:'54px', height:'30px', borderRadius:'999px',
                      background: model.enabled ? 'linear-gradient(180deg,#34d399,#10b981)' : 'rgba(148,163,184,0.35)',
                      border: model.enabled ? '1px solid rgba(16,185,129,.55)' : '1px solid rgba(148,163,184,.45)',
                      position:'relative', padding:'2px', transition:'all .18s ease'
                    }}
                  >
                    <span style={{
                      width:'26px', height:'26px', borderRadius:'50%', background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,.2)',
                      transform: model.enabled ? 'translateX(24px)' : 'translateX(0)', transition:'transform .18s ease'
                    }} />
                  </button>
                </div>
                <div className="form-field">
                  <label>Notify Email (optional)</label>
                  <input value={model.notifyEmail||''} onChange={e=>setModel(m=>({...m, notifyEmail:e.target.value}))} placeholder="hello@devugo.tech" />
                </div>
              </div>
              <div className="grid two">
                <div className="form-field">
                  <label>Title</label>
                  <input value={model.title||''} onChange={e=>setModel(m=>({...m, title:e.target.value}))} />
                  <div className="hint">Shown as the form heading on the page.</div>
                </div>
                <div className="form-field">
                  <label>Button text</label>
                  <input value={model.buttonText||''} onChange={e=>setModel(m=>({...m, buttonText:e.target.value}))} />
                  <div className="hint">Separate for Contact vs Services.</div>
                </div>
              </div>
              <div className="form-field">
                <label>Subtitle</label>
                <input value={model.subtitle||''} onChange={e=>setModel(m=>({...m, subtitle:e.target.value}))} />
                <div className="hint">A short helper sentence under the title.</div>
              </div>
              <div className="form-field">
                <label>Success message</label>
                <input value={model.successMessage||''} onChange={e=>setModel(m=>({...m, successMessage:e.target.value}))} />
                <div className="hint">Shown after successful submit.</div>
              </div>
              <div className="divider" style={{margin:'1rem 0'}}></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <strong>Fields</strong>
                <button className="btn-secondary" onClick={addField}>Add field</button>
              </div>
              <div style={{display:'grid',gap:'.6rem',marginTop:'.6rem', maxHeight:'unset', overflow:'visible', paddingRight:'.25rem'}}>
                {(model.fields||[]).map((f,idx)=> (
                  <div key={idx} className="card" style={{padding:'.75rem', display:'grid', gap:'.5rem'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.5rem'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'.5rem', minWidth:0}}>
                        <strong style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{f.name||'field'}</strong>
                        <TypeBadge type={f.type||'text'} />
                        {f.required && <span className="badge" style={{background:'#ef4444', color:'#fff'}}>required</span>}
                      </div>
                      <div style={{display:'flex', gap:'.35rem', flexWrap:'wrap'}}>
                        <button className="btn-secondary" onClick={()=>moveField(idx,-1)} disabled={idx===0}>Up</button>
                        <button className="btn-secondary" onClick={()=>moveField(idx,1)} disabled={idx===(model.fields?.length||0)-1}>Down</button>
                        <button className="btn-secondary" onClick={()=>removeField(idx)}>Remove</button>
                      </div>
                    </div>
                    <div className="grid two">
                      <div className="form-field">
                        <label>Name (key)</label>
                        <input value={f.name} onChange={e=>setModel(m=>{ const arr=[...m.fields]; arr[idx]={...arr[idx],name:e.target.value}; return {...m,fields:arr}; })} />
                      </div>
                      <div className="form-field">
                        <label>Label</label>
                        <input value={f.label} onChange={e=>setModel(m=>{ const arr=[...m.fields]; arr[idx]={...arr[idx],label:e.target.value}; return {...m,fields:arr}; })} />
                      </div>
                    </div>
                    <div className="grid two">
                      <div className="form-field">
                        <label>Type</label>
                        <select value={f.type} onChange={e=>setModel(m=>{ const arr=[...m.fields]; arr[idx]={...arr[idx],type:e.target.value}; return {...m,fields:arr}; })}>
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Placeholder</label>
                        <input value={f.placeholder||''} onChange={e=>setModel(m=>{ const arr=[...m.fields]; arr[idx]={...arr[idx],placeholder:e.target.value}; return {...m,fields:arr}; })} />
                      </div>
                    </div>
                    {f.type==='select' && (
                      <div className="form-field">
                        <label>Options (label:value per line)</label>
                        <textarea rows="3" value={(f.options||[]).map(o=>`${o.label}:${o.value}`).join('\n')} onChange={e=>{
                          const lines=e.target.value.split('\n').map(s=>s.trim()).filter(Boolean);
                          const opts=lines.map(l=>{ const [label,...rest]=l.split(':'); return { label, value: rest.join(':')||label } });
                          setModel(m=>{ const arr=[...m.fields]; arr[idx]={...arr[idx],options:opts}; return {...m,fields:arr}; });
                        }} />
                      </div>
                    )}
                    <label style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}>
                      <input type="checkbox" checked={!!f.required} onChange={e=>setModel(m=>{ const arr=[...m.fields]; arr[idx]={...arr[idx],required:e.target.checked}; return {...m,fields:arr}; })} /> Required
                    </label>
                  </div>
                ))}
              </div>
              <aside className="section-card">
                <Preview model={model} />
              </aside>
            </div>
          </div>
        )}
        {/* No confirmation modal — save applies immediately */}
      </main>
    </div>
  );
}
