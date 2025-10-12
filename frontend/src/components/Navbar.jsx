import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SocialLinksAPI } from '../services/socialLinks';
import SocialIcon from './SocialIcon';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();
  const [socialLinks, setSocialLinks] = useState([]);

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

  // Load social links for mobile menu
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{ const { items } = await SocialLinksAPI.listPublic(); if(mounted) setSocialLinks(items||[]); }catch(_e){}
    })();
    return ()=>{ mounted = false };
  },[]);

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
          {/* Social icons from admin */}
          {socialLinks.length > 0 && (
            <div className="social-row" style={{ justifyContent: 'center', marginTop: '.75rem', marginBottom: '.5rem' }}>
              {socialLinks.map(link => (
                <a key={link._id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform} className="social-btn" onClick={close}>
                  <SocialIcon name={link.platform} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
