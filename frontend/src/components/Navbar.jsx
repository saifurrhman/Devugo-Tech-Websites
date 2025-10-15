import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SocialLinksAPI } from '../services/socialLinks';
import SocialIcon from './SocialIcon';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();
  const [socialLinks, setSocialLinks] = useState([]);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); setSolutionsOpen(false); setAboutOpen(false); setServicesOpen(false); }, [location.pathname]);

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

  // Lock body scroll when mobile menu is open and close on ESC
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }
  }, [open]);

  // Close mobile menu when resizing back to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 1024 && open) setOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [open]);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Primary">
      <div className="container">
        <div className="nav-inner">
          <div className="nav-left">
            <Link to="/" className="logo" onClick={close}>Devugo Tech</Link>
          </div>
          <div className="nav-center">
            <NavLink to="/" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Home</NavLink>
            {/* About dropdown: About Us + Team */}
            <div 
              className={`dropdown${aboutOpen ? ' open' : ''}`}
              onMouseEnter={()=>setAboutOpen(true)} 
              onMouseLeave={()=>setAboutOpen(false)}
            >
              <NavLink to="/about" onClick={close} className={({isActive})=> isActive? 'active': undefined}>About</NavLink>
              {aboutOpen && (
                <div className="dropdown-menu" role="menu" aria-label="About submenu">
                  <Link to="/about" onClick={close}>About Us</Link>
                  <Link to="/team" onClick={close}>Team</Link>
                </div>
              )}
            </div>
            {/* Services dropdown: Services + Pricing */}
            <div 
              className={`dropdown${servicesOpen ? ' open' : ''}`}
              onMouseEnter={()=>setServicesOpen(true)} 
              onMouseLeave={()=>setServicesOpen(false)}
            >
              <NavLink to="/services" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Services</NavLink>
              {servicesOpen && (
                <div className="dropdown-menu" role="menu" aria-label="Services submenu">
                  <Link to="/services" onClick={close}>All Services</Link>
                  <Link to="/pricing" onClick={close}>Pricing</Link>
                </div>
              )}
            </div>
            <NavLink to="/solutions" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Solutions</NavLink>
            <NavLink to="/portfolio" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Portfolio</NavLink>
            <NavLink to="/blog" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Blog</NavLink>
            <NavLink to="/contact" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Contact</NavLink>
          </div>
          <div className="nav-right">
            <Link to="/contact" className="btn cta-dark" onClick={close}>FREE CRO AUDIT</Link>
            <button
              className={`mobile-toggle ${open ? 'open' : ''}`}
              aria-label="Toggle menu"
              aria-expanded={open}
              aria-controls="primary-mobile-menu"
              onClick={toggle}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        {/* Mobile menu (always mounted for smooth animation) */}
        <div id="primary-mobile-menu" className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
          <NavLink to="/" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Home</NavLink>
          {/* Mobile: About collapsible */}
          <button
            className="mobile-collapsible"
            aria-expanded={aboutOpen}
            onClick={()=>setAboutOpen(v=>!v)}
          >
            <span>About</span>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={aboutOpen? 'rot': ''}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          <div className={`mobile-submenu ${aboutOpen? 'open':''}`}>
            <Link to="/about" onClick={close}>About Us</Link>
            <Link to="/team" onClick={close}>Team</Link>
          </div>
          {/* Mobile: Services collapsible */}
          <button
            className="mobile-collapsible"
            aria-expanded={servicesOpen}
            onClick={()=>setServicesOpen(v=>!v)}
          >
            <span>Services</span>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={servicesOpen? 'rot': ''}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          <div className={`mobile-submenu ${servicesOpen? 'open':''}`}>
            <Link to="/services" onClick={close}>All Services</Link>
            <Link to="/pricing" onClick={close}>Pricing</Link>
          </div>
          {/* Mobile: Solutions collapsible */}
          <button
            className="mobile-collapsible"
            aria-expanded={solutionsOpen}
            onClick={()=>setSolutionsOpen(v=>!v)}
          >
            <span>Solutions</span>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={solutionsOpen? 'rot': ''}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          <div className={`mobile-submenu ${solutionsOpen? 'open':''}`}> 
            <Link to="/solutions#cro" onClick={close}>CRO Optimization</Link>
            <Link to="/solutions#ecommerce" onClick={close}>E‑commerce</Link>
            <Link to="/solutions#saas" onClick={close}>SaaS</Link>
            <Link to="/solutions#landing" onClick={close}>Landing Pages</Link>
          </div>
          <NavLink to="/portfolio" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Portfolio</NavLink>
          <NavLink to="/blog" onClick={close} className={({isActive})=> isActive? 'active': undefined}>Blog</NavLink>
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
