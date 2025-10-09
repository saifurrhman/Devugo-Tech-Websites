import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); setSolutionsOpen(false); }, [location.pathname]);

  // Elevate navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Primary">
      <div className="container">
        <div className="nav-inner">
          <div className="nav-left">
            <Link to="/" className="logo" onClick={close}>Devugo Tech</Link>
          </div>
          <div className="nav-center">
            <NavLink to="/" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Home</NavLink>
            <NavLink to="/about" onClick={close} className={({isActive})=> isActive? 'active': undefined}>About</NavLink>
            <NavLink to="/services" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Services</NavLink>
            {/* Solutions with dropdown (desktop) */}
            <div
              className={`dropdown${solutionsOpen ? ' open' : ''}`}
              onMouseEnter={()=>setSolutionsOpen(true)}
              onMouseLeave={()=>setSolutionsOpen(false)}
            >
              <NavLink
                to="/solutions"
                onClick={close}
                className={({isActive})=> isActive? 'active': undefined}
                aria-haspopup="true"
                aria-expanded={solutionsOpen}
              >
                Solutions
              </NavLink>
              <div className="dropdown-menu" role="menu">
                <Link to="/solutions#cro" role="menuitem" onClick={close}>CRO Optimization</Link>
                <Link to="/solutions#ecommerce" role="menuitem" onClick={close}>E‑commerce</Link>
                <Link to="/solutions#saas" role="menuitem" onClick={close}>SaaS</Link>
                <Link to="/solutions#landing" role="menuitem" onClick={close}>Landing Pages</Link>
              </div>
            </div>
            <NavLink to="/pricing" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Pricing</NavLink>
            <NavLink to="/portfolio" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Portfolio</NavLink>
            <NavLink to="/team" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Team</NavLink>
            <NavLink to="/contact" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Contact</NavLink>
          </div>
          <div className="nav-right">
            <Link to="/contact" className="btn cta-dark" onClick={close}>FREE CRO AUDIT</Link>
            <button className={`mobile-toggle ${open ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={open} onClick={toggle}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        {/* Mobile menu (always mounted for smooth animation) */}
        <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
          <NavLink to="/" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Home</NavLink>
          <NavLink to="/about" onClick={close} className={({isActive})=> isActive? 'active': undefined}>About</NavLink>
          <NavLink to="/services" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Services</NavLink>
          {/* Mobile: Solutions collapsible */}
          <button
            className="mobile-collapsible"
            aria-expanded={solutionsOpen}
            onClick={()=>setSolutionsOpen(v=>!v)}
          >
            <span>Solutions</span>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={solutionsOpen? 'rot': ''}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          <div className={`mobile-submenu ${solutionsOpen? 'open':''}`}> 
            <Link to="/solutions#cro" onClick={close}>CRO Optimization</Link>
            <Link to="/solutions#ecommerce" onClick={close}>E‑commerce</Link>
            <Link to="/solutions#saas" onClick={close}>SaaS</Link>
            <Link to="/solutions#landing" onClick={close}>Landing Pages</Link>
          </div>
          <NavLink to="/pricing" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Pricing</NavLink>
          <NavLink to="/portfolio" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Portfolio</NavLink>
          <NavLink to="/team" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Team</NavLink>
          <NavLink to="/contact" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Contact</NavLink>
          <Link to="/contact" className="btn cta-dark" onClick={close} style={{ width: '100%', textAlign: 'center' }}>FREE CRO AUDIT</Link>
          {/* Social icons */}
          <div className="social-row" style={{ justifyContent: 'center', marginTop: '.75rem', marginBottom: '.5rem' }}>
            <a href="https://facebook.com/devugo" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-btn" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 2 6.48 2 12.06c0 4.9 3.5 8.97 8.09 9.86v-6.98H7.56v-2.88h2.53V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.88h-2.34v6.98C18.5 21.03 22 16.96 22 12.06Z"/></svg>
            </a>
            <a href="https://instagram.com/devugo" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-btn" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/></svg>
            </a>
            <a href="https://twitter.com/devugo" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-btn" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.18 11.82-11.82 11.82-2.35 0-4.53-.68-6.37-1.86.33.04.65.05.99.05 1.95 0 3.75-.66 5.18-1.77-1.82-.04-3.36-1.23-3.89-2.87.26.04.51.06.78.06.38 0 .76-.05 1.12-.15-1.9-.38-3.33-2.06-3.33-4.07v-.05c.56.31 1.2.5 1.88.52-1.11-.74-1.84-2-1.84-3.43 0-.76.2-1.47.56-2.09 2.05 2.51 5.12 4.16 8.58 4.33-.06-.31-.09-.64-.09-.97 0-2.34 1.9-4.24 4.24-4.24 1.22 0 2.32.51 3.1 1.33.97-.2 1.89-.54 2.71-1.03-.32 1-1 1.85-1.9 2.38.86-.1 1.68-.33 2.44-.67-.57.85-1.3 1.6-2.13 2.2Z"/></svg>
            </a>
            <a href="https://linkedin.com/company/devugo" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-btn" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8h4V23h-4V8Zm7.5 0h3.84v2.05h.06c.54-1.02 1.86-2.09 3.83-2.09 4.1 0 4.86 2.7 4.86 6.22V23h-4v-6.63c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-3.86V8Z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
