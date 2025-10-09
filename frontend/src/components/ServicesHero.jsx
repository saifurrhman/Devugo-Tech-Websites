  import React from 'react';
  import './ServicesHero.css';

  export default function ServicesHero(){
    return (
      <section className="services-hero" aria-labelledby="services-hero-title">
        <div className="container">
          <span className="services-hero__eyebrow">
            <span className="dot" /> Our capabilities
          </span>
          <h1 id="services-hero-title" className="services-hero__title">Build faster. Launch better.</h1>
          <p className="services-hero__sub">From strategy to execution — we craft high‑performing websites, apps, and AI products that look beautiful and convert. Explore what we can build for you.</p>

          <div className="services-hero__actions">
            <a href="#services" className="services-hero__cta" aria-label="Explore our services">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explore services
            </a>
            <a href="/contact" className="services-hero__ghost" aria-label="Get a quote">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Get a quote
            </a>
          </div>

          <div className="services-hero__badges">
            <span className="badge">
              <svg viewBox="0 0 24 24" aria-hidden><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Fast delivery
            </span>
            <span className="badge">
              <svg viewBox="0 0 24 24" aria-hidden><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Pixel‑perfect
            </span>
            <span className="badge">
              <svg viewBox="0 0 24 24" aria-hidden><path d="M4 12h16M4 6h16M4 18h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Scalable
            </span>
          </div>
        </div>
      </section>
    );
  }
