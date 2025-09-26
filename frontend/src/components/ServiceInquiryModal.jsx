import React, { useEffect, useRef, useState } from 'react';
import { ContactAPI } from '../lib/api';

export default function ServiceInquiryModal({ open, onClose, service }){
  const dialogRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e){ if(e.key === 'Escape') onClose?.(); }
    if (open){
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [open, onClose]);

  useEffect(() => {
    if(open){
      setTimeout(()=> dialogRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    // Pre-fill message with selected service
    if (service && open){
      setForm(f => ({ ...f, message: f.message || `I am interested in ${service.title}.` }));
    }
  }, [service, open]);

  function onChange(e){
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e){
    e.preventDefault();
    try{
      setLoading(true);
      const payload = { ...form, message: `${form.message}\n\nService: ${service?.title || 'N/A'}` };
      await ContactAPI.create(payload);
      setLoading(false);
      onClose?.();
      setForm({ name:'', email:'', phone:'', message:'' });
      alert('Thanks! We\'ll get back to you shortly.');
    }catch(err){
      setLoading(false);
      alert(err.message || 'Failed to submit. Please try again.');
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={(e)=>{ if(e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="inq-title" tabIndex={-1} ref={dialogRef}>
        <header className="modal-header">
          <h3 id="inq-title">{service?.title || 'Service Inquiry'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="grid two">
            <div className="form-field">
              <label>Name</label>
              <input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email address" required />
            </div>
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone (optional)" />
          </div>
          <div className="form-field">
            <label>Message</label>
            <textarea name="message" rows="4" value={form.message} onChange={onChange} placeholder="Tell us briefly about goals, timeline, and scope." required />
          </div>
          <div className="actions">
            <button type="submit" className="btn cta-solid" disabled={loading}>{loading ? 'Sending…' : 'Send inquiry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
