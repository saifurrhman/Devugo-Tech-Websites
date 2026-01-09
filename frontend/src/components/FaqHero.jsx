import React, { useEffect, useState } from 'react';
import { CompanyInfoAPI } from '../lib/api';

export default function FaqHero() {
  const [email, setEmail] = useState('hello@devugo.tech');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await CompanyInfoAPI.getPublic();
        if (mounted && res?.info?.email) {
          setEmail(res.info.email);
        }
      } catch (e) {
        // ignore error, keep default
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="page-hero" aria-labelledby="faq-hero-title">
      <div className="container">
        <span className="eyebrow">
          <span className="dot" /> FAQ
        </span>
        <h1 id="faq-hero-title">Frequently Asked Questions</h1>
        <p className="sub">
          Browse all our FAQs by category. If you can't find what you need, email us at <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{email}</a>
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