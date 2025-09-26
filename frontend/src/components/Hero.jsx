import React from 'react';

export default function Hero() {
  return (
    <section className="hero hero-modern">
      <div className="container">
        <div className="hero-card">
          {/* Social proof strip */}
          <div className="hero-proof">
            <div className="avatars" aria-hidden>
              <span className="av a1" />
              <span className="av a2" />
              <span className="av a3" />
              <span className="av a4" />
            </div>
            <span className="label">What clients say about us</span>
            <span className="stars" aria-label="5 stars">★★★★★</span>
            <span className="count">100+ reviews</span>
             
          </div>

          {/* Subtext */} 
          <p className="hero-sub">
            Scale your business with our expert-vetted team specializing in web design, development,
            e‑commerce and CRO, dedicated to driving growth and maximizing engagement.
          </p>

          {/* CTAs */}
          <div className="hero-ctas">
            <a href="/contact" className="btn cta-solid">
              <span className="icon-check" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
              </span>
              Book a 15 min call
            </a>
            <a href="/about" className="btn cta-ghost">Life at Devugo</a>
          </div>

          {/* Trust badges */}
          <div className="hero-badges">
            <span className="badge"><span className="badge-icon" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg></span> Upwork Top Rated</span>
            <span className="badge"><span className="badge-icon" aria-hidden><svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg></span> Clutch 5.0★</span>
            <span className="badge"><span className="badge-icon" aria-hidden><svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" /></svg></span> Shopify Partner</span>
          </div>
        </div>
      </div>
    </section>
  );
}
