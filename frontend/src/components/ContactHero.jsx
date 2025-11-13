import React from 'react';

export default function ContactHero() {
  return (
    <section className="page-hero" aria-labelledby="contact-hero-title">
      <div className="container">
        <span className="eyebrow">
          <span className="dot" /> Contact
        </span>
        <h1 id="contact-hero-title">Let's work together</h1>
        <p className="sub">
          Ready to take your business to the next level? Reach out, and let's discuss how we can help.
        </p>
        
        <div className="actions">
          <a href="#contact-form" className="btn">
            Send a message
          </a>
          <a href="tel:+923001234567" className="btn outline">
            Call us
          </a>
        </div>
      </div>
    </section>
  );
}