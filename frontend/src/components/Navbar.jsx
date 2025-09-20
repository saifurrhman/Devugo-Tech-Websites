import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <a href="/" className="logo">Agency</a>
        <div className="links">
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/team">Team</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </nav>
  );
}
