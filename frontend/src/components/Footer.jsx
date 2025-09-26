import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  function submitNewsletter(e){
    e.preventDefault();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Please enter a valid email');
    // Placeholder action – integrate with backend/email tool later
    alert(`Subscribed with: ${email}`);
    setEmail('');
  }

  return (
    <footer className="site-footer footer--overlap">
      <div className="site-footer__inner">
        <section className="footer-col brand">
          <a href="/" className="footer-logo">Devugo Tech</a>
          <p className="muted">We build modern websites, products and brands that people love. Let’s ship something great together.</p>
          <div className="footer-meta">
            <span>Mon–Fri · 9am–6pm PKT</span>
            <span>hello@devugo.tech</span>
          </div>
          <ul className="contact-list">
            <li>
              <span className="icon" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 9.81 19.86 19.86 0 0 1 .08 1.18 2 2 0 0 1 2.06 0h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L6 7a16 16 0 0 0 7 7l.56-.2a2 2 0 0 1 2.11.45c.84.27 1.71.47 2.61.59A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <a href="tel:+923001234567">+92 300 123 4567</a>
            </li>
            <li>
              <span className="icon" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v.4l-10 6.25L2 6.4V6a2 2 0 0 1 2-2Zm18 5.2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.2l10 6.25 10-6.25Z"/></svg>
              </span>
              <a href="mailto:hello@devugo.tech">hello@devugo.tech</a>
            </li>
            <li>
              <span className="icon" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
              </span>
              <a href="https://maps.google.com/?q=Devugo" target="_blank" rel="noreferrer">Lahore, Pakistan</a>
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
              onChange={e=>setEmail(e.target.value)}
            />
            <button className="btn" type="submit">Subscribe</button>
          </form>
          <small className="muted">We respect your privacy. Unsubscribe any time.</small>
        </section>

        <section className="footer-col social">
          <h4>Follow us</h4>
          <div className="social-row">
            <a href="https://facebook.com/devugo" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 2 6.48 2 12.06c0 4.9 3.5 8.97 8.09 9.86v-6.98H7.56v-2.88h2.53V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.88h-2.34v6.98C18.5 21.03 22 16.96 22 12.06Z"/></svg>
            </a>
            <a href="https://instagram.com/devugo" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/></svg>
            </a>
            <a href="https://twitter.com/devugo" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.18 11.82-11.82 11.82-2.35 0-4.53-.68-6.37-1.86.33.04.65.05.99.05 1.95 0 3.75-.66 5.18-1.77-1.82-.04-3.36-1.23-3.89-2.87.26.04.51.06.78.06.38 0 .76-.05 1.12-.15-1.9-.38-3.33-2.06-3.33-4.07v-.05c.56.31 1.2.5 1.88.52-1.11-.74-1.84-2-1.84-3.43 0-.76.2-1.47.56-2.09 2.05 2.51 5.12 4.16 8.58 4.33-.06-.31-.09-.64-.09-.97 0-2.34 1.9-4.24 4.24-4.24 1.22 0 2.32.51 3.1 1.33.97-.2 1.89-.54 2.71-1.03-.32 1-1 1.85-1.9 2.38.86-.1 1.68-.33 2.44-.67-.57.85-1.3 1.6-2.13 2.2Z"/></svg>
            </a>
            <a href="https://linkedin.com/company/devugo" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8h4V23h-4V8Zm7.5 0h3.84v2.05h.06c.54-1.02 1.86-2.09 3.83-2.09 4.1 0 4.86 2.7 4.86 6.22V23h-4v-6.63c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-3.86V8Z"/></svg>
            </a>
          </div>
          <div className="app-badges">
            <a className="badge ghost" href="#">Get a quote</a>
            <a className="badge ghost" href="#">Support</a>
          </div>
        </section>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} Devugo Tech Agency. All rights reserved.</p>
        <div className="bottom-links">
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
