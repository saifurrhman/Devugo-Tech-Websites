import React, { useEffect, useRef, useState } from 'react';
import { ContactAPI } from '../lib/api';

export default function PricingQuoteModal({ open, onClose }){
  const ref = useRef(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', projectType:'Custom', budget:'', message:'' });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose?.(); }
    if(open){ document.addEventListener('keydown', onKey); return ()=>document.removeEventListener('keydown', onKey); }
  }, [open, onClose]);

  useEffect(()=>{ if(open){ setTimeout(()=> ref.current?.focus(), 0); } }, [open]);

  function onChange(e){ const { name, value } = e.target; setForm(f=>({...f,[name]:value})); }

  async function onSubmit(e){
    e.preventDefault();
    try{
      setLoading(true);
      await ContactAPI.create({ ...form, message: `${form.message}\n\nPricing Inquiry — Type: ${form.projectType} — Budget: ${form.budget}` });
      setLoading(false); onClose?.();
      setForm({ name:'', email:'', phone:'', projectType:'Custom', budget:'', message:'' });
      alert('Thanks! We\'ll reply with a custom quote.');
    }catch(err){ setLoading(false); alert(err.message || 'Failed to submit.'); }
  }

  if(!open) return null;

  return (
    <div className="modal-backdrop" onClick={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pq-title" tabIndex={-1} ref={ref}>
        <header className="modal-header">
          <h3 id="pq-title">Custom Quote</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="grid two">
            <div className="form-field">
              <label>Name</label>
              <input name="name" value={form.name} onChange={onChange} required placeholder="Your name" />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} required placeholder="Email address" />
            </div>
          </div>
          <div className="grid two">
            <div className="form-field">
              <label>Project type</label>
              <select name="projectType" value={form.projectType} onChange={onChange}>
                <option>Custom</option>
                <option>AI</option>
                <option>Web Platform</option>
                <option>CRM</option>
                <option>Mobile App</option>
                <option>Website</option>
              </select>
            </div>
            <div className="form-field">
              <label>Estimated budget</label>
              <select name="budget" value={form.budget} onChange={onChange}>
                <option value="">Select</option>
                <option>$1k–$3k</option>
                <option>$3k–$7k</option>
                <option>$7k–$15k</option>
                <option>$15k–$30k</option>
                <option>$30k+</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>What do you want to build?</label>
            <textarea rows="4" name="message" value={form.message} onChange={onChange} placeholder="Tell us briefly about scope, timeline, and goals." />
          </div>
          <div className="actions">
            <button type="submit" className="btn cta-solid" disabled={loading}>{loading ? 'Sending…' : 'Request quote'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
