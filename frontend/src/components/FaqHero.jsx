import React from 'react';

export default function FaqHero() {
  return (
    <section className="page-hero" aria-labelledby="faq-hero-title">
      <div className="container">
        <span className="eyebrow">
          <span className="dot" /> FAQ
        </span>
        <h1 id="faq-hero-title">Frequently Asked Questions</h1>
        <p className="sub">
          Browse all our FAQs by category. If you can't find what you need, email us at hello@devugo.tech
        </p>
        
        <div className="actions">
          <a href="#faqs" className="btn">
            Browse FAQs
          </a>
          <a href="/contact" className="btn outline">
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}