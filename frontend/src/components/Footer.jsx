import React, { useEffect, useState } from 'react';
import { SocialLinksAPI } from '../services/socialLinks';
import { CompanyInfoAPI } from '../services/companyInfo';
import SocialIcon from './SocialIcon';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [links, setLinks] = useState([]);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [socialRes, infoRes] = await Promise.all([
          SocialLinksAPI.listPublic(),
          CompanyInfoAPI.getPublic()
        ]);
        setLinks(socialRes.items || []);
        setInfo(infoRes.info);
      } catch (_e) {}
    })();
  }, []);

  function submitNewsletter(e) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
      return alert('Please enter a valid email');
    alert(`Subscribed with: ${email}`);
    setEmail('');
  }

  return (
    <footer className="site-footer footer--overlap">
      <div className="site-footer__inner">
        <section className="footer-col brand">
          <a href="/" className="footer-logo">
            {info?.companyName || 'Devugo Tech'}
          </a>
          <p className="muted">
            {info?.tagline || 'We build modern websites, products and brands that people love. Let\'s ship something great together.'}
          </p>
          <div className="footer-meta">
            <span>{info?.workingHours || 'Mon–Fri · 9am–6pm PKT'}</span>
            <span>{info?.email || 'hello@devugo.tech'}</span>
          </div>
          <ul className="contact-list">
            <li>
              <span className="icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 9.81 19.86 19.86 0 0 1 .08 1.18 2 2 0 0 1 2.06 0h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L6 7a16 16 0 0 0 7 7l.56-.2a2 2 0 0 1 2.11.45c.84.27 1.71.47 2.61.59A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <a href={`tel:${info?.phone || '+923001234567'}`}>
                {info?.phone || '+92 300 123 4567'}
              </a>
            </li>
            <li>
              <span className="icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16a2 2 0 0 1 2 2v.4l-10 6.25L2 6.4V6a2 2 0 0 1 2-2Zm18 5.2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.2l10 6.25 10-6.25Z"/>
                </svg>
              </span>
              <a href={`mailto:${info?.email || 'hello@devugo.tech'}`}>
                {info?.email || 'hello@devugo.tech'}
              </a>
            </li>
            <li>
              <span className="icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
                </svg>
              </span>
              <a href="https://maps.google.com/?q=Devugo" target="_blank" rel="noreferrer">
                {info?.address || 'Lahore, Pakistan'}
              </a>
            </li>
          </ul>
        </section>

        <nav className="footer-col links">
          <h4>Important links</h4>
          <ul>
            <li><a href="/about">About us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/portfolio">Portfolio</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy-policy">Privacy policy</a></li>
          </ul>
        </nav>

        <section className="footer-col newsletter">
          <h4>Newsletter</h4>
          <p className="muted">Get monthly tips, case studies and Devugo updates.</p>
          <form onSubmit={submitNewsletter} className="newsletter-form">
            <input
              className="newsletter-input"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="btn" type="submit">Subscribe</button>
          </form>
          <small className="muted">We respect your privacy. Unsubscribe any time.</small>
        </section>

        <section className="footer-col social">
          <h4>Follow us</h4>
          <div className="social-row">
            {links.map(link => (
              <a 
                key={link._id} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer" 
                aria-label={link.platform} 
                className="social-btn"
              >
                <SocialIcon name={link.platform} size={20} />
              </a>
            ))}
          </div>
          <div className="app-badges">
            <a className="badge ghost" href="#">Get a quote</a>
            <a className="badge ghost" href="#">Support</a>
          </div>
        </section>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} {info?.companyName || 'Devugo Tech Agency'}. All rights reserved.</p>
        <div className="bottom-links">
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}