import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PricingSection.css';
import PricingQuoteModal from './PricingQuoteModal';

const TIERS = [
  {
    title: 'CX + CRO Audit',
    blurb: 'Fix critical areas of your website to improve conversions.',
    price: '$1,500',
    features: [
      'x5 Critical redesigned sections',
      '10+ page audit report',
      'Figma source file',
      'Loom walkthrough',
      'Desktop + Mobile design',
      'On‑page SEO & copy review',
    ],
  },
  {
    title: 'UX UI Design',
    blurb: 'Modern design for your website, app, or SaaS product.',
    price: '$2,000',
    features: [
      'Up to 5 pages / screens',
      'Wireframes',
      'Desktop + Mobile responsive',
      'UI Design system',
      'Figma source file',
      'Unlimited revisions',
    ],
    highlight: true,
  },
  {
    title: 'No/Low‑Code Dev',
    blurb: 'Websites built in Webflow, Wix, or Shopify with speed.',
    price: '$2,500+',
    features: [
      'Up to 5 pages',
      'Componentized',
      'CMS integration',
      'Interactions/animations',
      'Fully responsive',
      'Unlimited revisions',
    ],
  },
  {
    title: 'Web Development',
    blurb: 'Full‑stack web development for scalable, high‑performing apps.',
    price: '$3,500+',
    features: [
      'Modern stack (React/Next)',
      'API integration',
      'Auth & dashboards',
      'Accessibility & SEO',
      'Analytics setup',
      'Deployment & docs',
    ],
  },
  {
    title: 'AI Call Agent',
    blurb: 'Voice AI that answers calls, books, and qualifies leads 24/7.',
    price: '$1,800+',
    features: [
      'Custom voice + knowledge',
      'Calendar/CRM integration',
      'Call logs & transcripts',
      'Warm transfers',
      'Usage analytics',
      'Go live in days',
    ],
  },
  {
    title: 'Mobile Apps Dev',
    blurb: 'iOS/Android or cross‑platform apps with smooth UX and performance.',
    price: '$5,000+',
    features: [
      'React Native stack',
      'Auth + push notifications',
      'Offline support',
      'App store readiness',
      'Analytics & crash reports',
      'Support & updates',
    ],
  },
];

export default function PricingSection({ showCustom = true }){
  const [open, setOpen] = useState(false);
  useEffect(()=>{
    const cards = Array.from(document.querySelectorAll('.pricing-home .price-card'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    cards.forEach(c=> io.observe(c));
    return ()=> io.disconnect();
  }, []);
  return (
    <section className="pricing-home" aria-labelledby="pricing-home-title">
      <div className="container">
        <header className="pricing-head">
          <h2 id="pricing-home-title">Choose a package that fits</h2>
          <p className="muted">Transparent pricing to get you moving fast. See full options on the Pricing page.</p>
        </header>

        <div className="pricing-grid">
          {TIERS.map((t, i)=> (
            <article key={i} className={`price-card ${t.highlight ? 'highlight' : ''}`} style={{ transitionDelay: `${i*60}ms` }}>
              <h3 className="price-title">{t.title}</h3>
              <p className="price-blurb">{t.blurb}</p>
              <div className="price-amount">{t.price}</div>
              <ul className="price-features">
                {t.features.map((f, j)=> (<li key={j}>{f}</li>))}
              </ul>
              <button className="btn cta-dark" onClick={()=>setOpen(true)}>Get started</button>
            </article>
          ))}

          {/* Custom quote card */}
          {showCustom && (
            <article className="price-card custom" style={{ transitionDelay: `${TIERS.length*60}ms` }}>
              <div className="custom-graphic" aria-hidden="true" />
              <h3 className="price-title">Need a custom quote?</h3>
              <p className="price-blurb">Tell us what you want to build — we’ll tailor a plan to your scope.</p>
              <button className="btn cta-dark" onClick={()=>setOpen(true)}>Get started →</button>
            </article>
          )}
        </div>

        <div className="pricing-actions">
          <Link to="/pricing" className="btn outline">See all pricing</Link>
        </div>
      </div>
      <PricingQuoteModal open={open} onClose={()=>setOpen(false)} />
    </section>
  );
}
