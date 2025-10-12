import React, { useEffect, useState } from 'react';
import { ContactAPI, FormAPI } from '../lib/api';
import BudgetSelect from './BudgetSelect';

export default function ServicesContact(){
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState(null);
  const [cfgLoading, setCfgLoading] = useState(true);
  const [vals, setVals] = useState({});

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        const res = await FormAPI.getPublic('services');
        if(mounted) setCfg(res && res.enabled ? res : null);
      }catch(_e){ if(mounted) setCfg(null); }
      finally{ if(mounted) setCfgLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  function onChange(e){
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e){
    e.preventDefault();
    try{
      setLoading(true);
      const payload = cfg && cfg.enabled && Array.isArray(cfg.fields) && cfg.fields.length
        ? Object.fromEntries((cfg.fields||[]).map(f=>[f.name, vals[f.name]||'']))
        : form;
      payload.source = 'Services page';
      await ContactAPI.create(payload);
      setLoading(false);
      setForm({ name:'', email:'', phone:'', message:'' });
      setVals({});
      alert('Thanks! We\'ll get back to you shortly.');
    }catch(err){
      setLoading(false);
      alert(err.message || 'Failed to submit. Please try again.');
    }
  }

  function renderField(f){
    const common = {
      name: f.name,
      placeholder: f.placeholder || '',
      required: !!f.required,
      value: vals[f.name] || '',
      onChange: (e)=> setVals(v=> ({ ...v, [f.name]: e.target.value }))
    };
    if(f.name === 'budget'){
      return (
        <div className="form-field" key={f.name}>
          <label>{f.label}</label>
          <BudgetSelect
            name="budget"
            value={vals[f.name] || ''}
            onChange={(e)=> setVals(v=> ({ ...v, [f.name]: e.target.value }))}
            placeholder={f.placeholder || 'Select a range'}
            options={f.options || []}
          />
        </div>
      );
    }
    if(f.type === 'textarea') return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <textarea rows="5" {...common} />
      </div>
    );
    if(f.type === 'select') return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <select {...common}>
          <option value="">Select</option>
          {(f.options||[]).map(opt=> <option key={opt.value||opt.label} value={opt.value||opt.label}>{opt.label}</option>)}
        </select>
      </div>
    );
    const typeMap = { email:'email', tel:'tel', text:'text' };
    return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <input type={typeMap[f.type]||'text'} {...common} />
      </div>
    );
  }

  return (
    <section className="services-contact" aria-labelledby="services-contact-title">
      <div className="container" style={{maxWidth:'1040px'}}>
        <div className="contact-card">
          <div className="contact-intro" style={{marginBottom: '.5rem'}}>
            <h2 id="services-contact-title" className="contact-title" style={{fontSize:'1.65rem'}}>{cfg?.title || 'Let’s build something great'}</h2>
            <p className="contact-sub" style={{margin:'0 0 .75rem'}}>{cfg?.subtitle || 'Tell us briefly about your goals. We’ll reply within 1 business day.'}</p>
          </div>
          {cfgLoading ? (
            <div className="card">Loading form…</div>
          ) : (cfg && cfg.enabled && (cfg.fields||[]).length ? (
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="grid two">
                {(cfg.fields||[]).filter(f=>!['message'].includes(f.name)).slice(0,2).map(renderField)}
              </div>
              {(cfg.fields||[]).filter(f=>!['message'].includes(f.name)).slice(2,4).map(renderField)}
              {(cfg.fields||[]).filter(f=>['message'].includes(f.name)).map(renderField)}
              <div className="actions" style={{justifyContent:'center', width:'100%'}}>
                <button type="submit" className="btn cta-solid" style={{width:'100%'}} disabled={loading}>{loading ? 'Sending…' : (cfg.buttonText || 'Submit')}</button>
              </div>
            </form>
          ) : (
            <div className="card" style={{padding:'1rem'}}>
              <strong>Form unavailable</strong>
              <p className="muted" style={{margin:'.25rem 0 0'}}>The services form is currently disabled.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
