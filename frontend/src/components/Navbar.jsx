import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

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
