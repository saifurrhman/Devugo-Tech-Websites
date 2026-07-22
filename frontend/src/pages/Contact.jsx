import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ContactHero from '../components/ContactHero';
import Footer from '../components/Footer';
import BudgetSelect from '../components/BudgetSelect';
import { ContactAPI, FormAPI } from '../lib/api';
import { SocialLinksAPI } from '../services/socialLinks';
import { CompanyInfoAPI } from '../services/companyInfo';
import SocialIcon from '../components/SocialIcon';
import SEO from '../components/SEO';

export default function Contact() {
  const [cfg, setCfg] = useState(null);
  const [cfgLoading, setCfgLoading] = useState(true);
  const [vals, setVals] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    budget: '',
    message: ''
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [formRes, socialRes, infoRes] = await Promise.all([
          FormAPI.getPublic('contact'),
          SocialLinksAPI.listPublic(),
          CompanyInfoAPI.getPublic()
        ]);
        if (mounted) {
          setCfg(formRes && formRes.enabled ? formRes : null);
          setSocialLinks(socialRes.items || []);
          setInfo(infoRes.info);
        }
      } catch (_e) {
        if (mounted) setCfg(null);
      } finally {
        if (mounted) setCfgLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = cfg && cfg.enabled && Array.isArray(cfg.fields) && cfg.fields.length
        ? Object.fromEntries((cfg.fields || []).map(f => [f.name, vals[f.name] || '']))
        : form;
      payload.source = 'Contact page';
      await ContactAPI.create(payload);
      setForm({ name: '', email: '', company: '', phone: '', website: '', budget: '', message: '' });
      setVals({});
      alert('Thanks! Your message has been sent.');
    } catch (err) {
      alert(err.message || 'Failed to submit. Please try again.');
    }
  }

  function renderField(f) {
    const common = {
      name: f.name,
      placeholder: f.placeholder || '',
      required: !!f.required,
      value: vals[f.name] || '',
      onChange: (e) => setVals(v => ({ ...v, [f.name]: e.target.value }))
    };
    if (f.name === 'budget') {
      return (
        <div className="form-field" key={f.name}>
          <label>{f.label}</label>
          <BudgetSelect
            name="budget"
            value={vals[f.name] || ''}
            onChange={(e) => setVals(v => ({ ...v, [f.name]: e.target.value }))}
            placeholder={f.placeholder || 'Select a range'}
            options={f.options || []}
          />
        </div>
      );
    }
    if (f.type === 'textarea') return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <textarea rows="5" {...common} />
      </div>
    );
    if (f.type === 'select') return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <select {...common}>
          <option value="">Select</option>
          {(f.options || []).map(opt => <option key={opt.value || opt.label} value={opt.value || opt.label}>{opt.label}</option>)}
        </select>
      </div>
    );
    const typeMap = { email: 'email', tel: 'tel', text: 'text' };
    return (
      <div className="form-field" key={f.name}>
        <label>{f.label}</label>
        <input type={typeMap[f.type] || 'text'} {...common} />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Contact Devugo Tech | Start Your Project"
        description="Get in touch with Devugo Tech to discuss your next web development, AI automation, or SaaS project. We are ready to help you scale."
        url="/contact"
      />
      <Navbar />
      <ContactHero />
      <main className="contact-page">
        <div className="container">
          <div className="contact-grid">
            <section className="contact-intro">
              <h1 className="contact-title">Get in touch</h1>
              <p className="contact-sub">We're here to help bring your ideas to life. Reach out through any channel below.</p>

              <ul className="contact-list">
                <li>
                  <span className="icon">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h2.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.02l-2.2 2.21z"/>
                    </svg>
                  </span>
                  <a href={`tel:${info?.phone || '+923001234567'}`}>
                    {info?.phone || '+92 300 123 4567'}
                  </a>
                </li>
                <li>
                  <span className="icon">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2l-8 5L4 6h16zm0 12H4V8l8 5 8-5v10z"/>
                    </svg>
                  </span>
                  <a href={`mailto:${info?.email || 'hello@devugo.tech'}`}>
                    {info?.email || 'hello@devugo.tech'}
                  </a>
                </li>
                <li>
                  <span className="icon">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                    </svg>
                  </span>
                  {info?.address || 'Lahore, Pakistan'}
                </li>
              </ul>

              <div className="contact-social">
                {socialLinks.map(link => (
                  <a key={link._id} className="social-btn" href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform}>
                    <SocialIcon name={link.platform} size={18} color="#fff" />
                  </a>
                ))}
              </div>
            </section>

            <section className="contact-card">
              {cfgLoading ? (
                <div className="card">Loading form…</div>
              ) : (cfg && cfg.enabled && (cfg.fields || []).length ? (
                <form className="contact-form" onSubmit={onSubmit}>
                  {cfg.title && <h2 style={{ marginTop: 0 }}>{cfg.title}</h2>}
                  {cfg.subtitle && <p className="muted" style={{ marginTop: '.25rem' }}>{cfg.subtitle}</p>}
                  <div className="grid two">
                    {(cfg.fields || []).filter(f => !['message', 'budget'].includes(f.name)).slice(0, 2).map(renderField)}
                  </div>
                  <div className="grid two">
                    {(cfg.fields || []).filter(f => !['message'].includes(f.name)).slice(2, 4).map(renderField)}
                  </div>
                  {(cfg.fields || []).filter(f => ['message'].includes(f.name)).map(renderField)}
                  <div className="actions">
                    <button type="submit" className="btn cta-solid">{cfg.buttonText || 'Submit'}</button>
                  </div>
                </form>
              ) : (
                <div className="card" style={{ padding: '1rem' }}>
                  <strong>Form unavailable</strong>
                  <p className="muted" style={{ margin: '.25rem 0 0' }}>The contact form is currently disabled.</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}