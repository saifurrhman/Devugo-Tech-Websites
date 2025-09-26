import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BudgetSelect from '../components/BudgetSelect';
import { ContactAPI } from '../lib/api';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    budget: '',
    message: ''
  });

  function onChange(e){
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e){
    e.preventDefault();
    try{
      await ContactAPI.create(form);
      setForm({ name:'', email:'', company:'', phone:'', website:'', budget:'', message:'' });
      alert('Thanks! Your message has been sent.');
    }catch(err){
      alert(err.message || 'Failed to submit. Please try again.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="contact-page">
        <div className="container">
          <div className="contact-grid">
            <section className="contact-intro">
              <h1 className="contact-title">Let’s work together</h1>
              <p className="contact-sub">Ready to take your business to the next level? Reach out, and let’s discuss how we can help.</p>

              <ul className="contact-list">
                <li>
                  <span className="icon">
                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h2.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.02l-2.2 2.21z"/></svg>
                  </span>
                  <a href="tel:+923001234567">+92 300 123 4567</a>
                </li>
                <li>
                  <span className="icon">
                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2l-8 5L4 6h16zm0 12H4V8l8 5 8-5v10z"/></svg>
                  </span>
                  <a href="mailto:hello@devugo.tech">hello@devugo.tech</a>
                </li>
                <li>
                  <span className="icon">
                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                  </span>
                  Lahore, Pakistan
                </li>
              </ul>

              <div className="contact-social">
                <a className="social-btn" href="https://linkedin.com/company/devugo" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8h4V23h-4V8Zm7.5 0h3.84v2.05h.06c.54-1.02 1.86-2.09 3.83-2.09 4.1 0 4.86 2.7 4.86 6.22V23h-4v-6.63c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-3.86V8Z"/></svg>
                </a>
                <a className="social-btn" href="https://instagram.com/devugo" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5Zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7Zm5 3.5A5.5 5.5 0 116.5 13 5.51 5.51 0 0112 7.5Zm0 2A3.5 3.5 0 1015.5 13 3.5 3.5 0 0012 9.5Zm5.75-2.75a1.25 1.25 0 11-1.25 1.25 1.25 1.25 0 011.25-1.25Z"/></svg>
                </a>
                <a className="social-btn" href="https://twitter.com/devugo" target="_blank" rel="noreferrer" aria-label="Twitter">
                  <svg viewBox="0 0 24 24"><path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.18 11.82-11.82 11.82-2.35 0-4.53-.68-6.37-1.86.33.04.65.05.99.05 1.95 0 3.75-.66 5.18-1.77-1.82-.04-3.36-1.23-3.89-2.87.26.04.51.06.78.06.38 0 .76-.05 1.12-.15-1.9-.38-3.33-2.06-3.33-4.07v-.05c.56.31 1.2.5 1.88.52-1.11-.74-1.84-2-1.84-3.43 0-.76.2-1.47.56-2.09 2.05 2.51 5.12 4.16 8.58 4.33-.06-.31-.09-.64-.09-.97 0-2.34 1.9-4.24 4.24-4.24 1.22 0 2.32.51 3.1 1.33.97-.2 1.89-.54 2.71-1.03-.32 1-1 1.85-1.9 2.38.86-.1 1.68-.33 2.44-.67-.57.85-1.3 1.6-2.13 2.2Z"/></svg>
                </a>
                <a className="social-btn" href="https://facebook.com/devugo" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24"><path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 2 6.48 2 12.06c0 4.9 3.5 8.97 8.09 9.86v-6.98H7.56v-2.88h2.53V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.88h-2.34v6.98C18.5 21.03 22 16.96 22 12.06Z"/></svg>
                </a>
              </div>
            </section>

            <section className="contact-card">
              <form className="contact-form" onSubmit={onSubmit}>
                <div className="grid two">
                  <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
                  </div>
                  <div className="form-field">
                    <label>Company</label>
                    <input name="company" value={form.company} onChange={onChange} placeholder="Company name" />
                  </div>
                </div>
                <div className="grid two">
                  <div className="form-field">
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email address" required />
                  </div>
                  <div className="form-field">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone (optional)" />
                  </div>
                </div>
                <div className="grid two">
                  <div className="form-field">
                    <label>Website (if any)</label>
                    <input name="website" value={form.website} onChange={onChange} placeholder="https://" />
                  </div>
                  <div className="form-field">
                    <label>Budget</label>
                    <BudgetSelect value={form.budget} onChange={onChange} />
                  </div>
                </div>
                <div className="form-field">
                  <label>Tell us more about your project</label>
                  <textarea name="message" rows="5" value={form.message} onChange={onChange} placeholder="Share a bit about goals, timeline, and scope." required />
                </div>
                <div className="actions">
                  <button type="submit" className="btn cta-solid">Submit</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
