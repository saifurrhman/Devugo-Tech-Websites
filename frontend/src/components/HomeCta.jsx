import React from 'react';
import './HomeCta.css';

export default function HomeCta(){
  return (
    <section className="home-cta" aria-labelledby="home-cta-title">
      <div className="container">
        <div className="cta-card">
          <h2 id="home-cta-title">Ready to make your business standout?</h2>
          <p>Take the first step toward transforming your business with impactful design and tailored, high‑converting software solutions.</p>
          <a href="/contact" className="btn outline light">Book a 30 minutes Discovery Call</a>
        </div>
      </div>
    </section>
  );
}
