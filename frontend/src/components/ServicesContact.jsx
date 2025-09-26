import React, { useState } from 'react';
import { ContactAPI } from '../lib/api';

export default function ServicesContact(){
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  function onChange(e){
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e){
    e.preventDefault();
    try{
      setLoading(true);
      await ContactAPI.create({ ...form, message: `${form.message}\n\nSource: Services page` });
      setLoading(false);
      setForm({ name:'', email:'', phone:'', message:'' });
      alert('Thanks! We\'ll get back to you shortly.');
    }catch(err){
      setLoading(false);
      alert(err.message || 'Failed to submit. Please try again.');
    }
  }

  return (
    <section className="services-contact" aria-labelledby="services-contact-title">
      <div className="container" style={{maxWidth:'1040px'}}>
        <div className="contact-card">
          <div className="contact-intro" style={{marginBottom: '.5rem'}}>
            <h2 id="services-contact-title" className="contact-title" style={{fontSize:'1.65rem'}}>Let’s build something great</h2>
            <p className="contact-sub" style={{margin:'0 0 .75rem'}}>Tell us briefly about your goals. We’ll reply within 1 business day.</p>
          </div>
          <form className="contact-form" onSubmit={onSubmit}>
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
              <textarea name="message" rows="5" value={form.message} onChange={onChange} placeholder="What do you want to build?" required />
            </div>
            <div className="actions" style={{justifyContent:'center', width:'100%'}}>
              <button type="submit" className="btn cta-solid" style={{width:'100%'}} disabled={loading}>{loading ? 'Sending…' : 'Submit'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
