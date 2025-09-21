import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // Public site theme (site-light | site-dark)
  const [siteTheme, setSiteTheme] = useState(() => localStorage.getItem('siteTheme') || 'site-dark');
  useEffect(()=>{
    document.body.classList.remove('site-light','site-dark');
    document.body.classList.add(siteTheme);
    localStorage.setItem('siteTheme', siteTheme);
  },[siteTheme]);
  const toggleTheme = () => setSiteTheme(t => t==='site-light' ? 'site-dark' : 'site-light');

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-inner">
          <div className="nav-left">
            <Link to="/" className="logo" onClick={close}>Devugo Tech</Link>
          </div>
          <div className="nav-center">
            <Link to="/" onClick={close}>Home</Link>
            <Link to="/about" onClick={close}>About</Link>
            <Link to="/services" onClick={close}>Services</Link>
            {/* <div className="dropdown">
              <button className="dropbtn">Solutions ▾</button>
            </div> */}
            <Link to="/privacy-policy" onClick={close}>Privacy</Link>
            <Link to="/team" onClick={close}>Careers</Link>
            <Link to="/contact" onClick={close}>Contact</Link>
          </div>
          <div className="nav-right">
            <button className="icon-btn desktop-only" title={siteTheme==='site-light'?'Switch to dark':'Switch to light'} aria-label="Toggle theme" onClick={toggleTheme} style={{borderRadius:12}}>
              {siteTheme==='site-light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.2A8.5 8.5 0 1 1 11.8 3a7 7 0 1 0 9.2 9.2z" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M7.4 17.6L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
            <Link to="/contact" className="btn cta-dark" onClick={close}>FREE CRO AUDIT</Link>
            <button className={`mobile-toggle ${open ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={open} onClick={toggle}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="mobile-menu">
            <button className="icon-btn" onClick={toggleTheme} title={siteTheme==='site-light'?'Switch to dark':'Switch to light'} aria-label="Toggle theme" style={{marginBottom:'.5rem'}}>
              {siteTheme==='site-light' ? 'Switch to Dark' : 'Switch to Light'}
            </button>
            <Link to="/" onClick={close}>Home</Link>
            <Link to="/about" onClick={close}>About</Link>
            <Link to="/services" onClick={close}>Services</Link>
            <Link to="/privacy-policy" onClick={close}>Privacy</Link>
            <Link to="/team" onClick={close}>Careers</Link>
            <Link to="/contact" onClick={close}>Contact</Link>
            <Link to="/contact" className="btn cta-dark" onClick={close} style={{ width: '100%', textAlign: 'center' }}>FREE CRO AUDIT</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
