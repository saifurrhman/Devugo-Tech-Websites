import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingQuoteModal from '../components/PricingQuoteModal';
import './Pricing.css';
import { PricingAPI } from '../lib/api';

const STATIC_CARDS = [
  { title: 'CX + CRO Audit', price: '$1,500',
    desc: 'Fix critical areas of your website to improve conversions.',
    features: ['x5 Critical redesigned sections','10+ page audit report','Figma source file','Loom walkthrough','Desktop + Mobile design','On‑page SEO & copy review'],
    tags: ['All','Website','Audit'] },
  { title: 'UX UI Design', price: '$2,000',
    desc: 'Modern design for your website, app, or SaaS product.',
    features: ['Up to 5 pages / screens','Wireframes','Desktop + Mobile responsive','UI design system','Figma source file','Unlimited revisions'], highlight:true,
    tags: ['All','Website','App','Design'] },
  { title: 'No/Low‑Code Dev', price: '$2,500+',
    desc: 'Websites built in Webflow, Wix, or Shopify with speed.',
    features: ['Up to 5 pages','Componentized','CMS integration','Interactions/animations','Fully responsive','Unlimited revisions'],
    tags: ['All','Shopify','Wix','Webflow','Website'] },

  { title: 'Web Development', price: '$3,500+',
    desc: 'Full‑stack web development for scalable, high‑performing apps.',
    features: ['Modern stack (React/Next)','API integration','Auth & dashboards','Accessibility & SEO','Analytics setup','Deployment & docs'],
    tags: ['All','Custom Software','Website'] },
  { title: 'AI Call Agent', price: '$1,800+',
    desc: 'Voice AI that answers calls, books, and qualifies leads 24/7.',
    features: ['Custom voice + knowledge','Calendar/CRM integration','Call logs & transcripts','Warm transfers','Usage analytics','Go live in days'],
    tags: ['All','AI Call Agent','AI'] },
  { title: 'Mobile Apps Dev', price: '$5,000+',
    desc: 'iOS/Android or cross‑platform apps with smooth UX and performance.',
    features: ['React Native stack','Auth + push notifications','Offline support','App store readiness','Analytics & crash reports','Support & updates'],
    tags: ['All','Mobile Apps','App'] },

  { title: 'Custom CRM System', price: '$4,500+',
    desc: 'Tailored pipelines, automations, and reporting for your team.',
    features: ['Lead pipelines','Custom fields','Automations','Role permissions','Dashboards','Integrations'],
    tags: ['All','Custom CRM'] },
  { title: 'AI Assistant', price: '$1,400+',
    desc: 'LLM‑powered chat/email assistants trained on your KB and tone.',
    features: ['KB ingestion','Tone & style controls','Ticketing integration','Analytics','Data export','Brand safe responses'],
    tags: ['All','AI Assistant','AI'] },
  { title: 'AI Automation Bundle', price: '$2,200+',
    desc: 'Connect your tools and remove manual work with smart workflows.',
    features: ['Data extraction','Summaries & routing','Trigger actions','Human in loop','Audit trail','SLA alerts'],
    tags: ['All','AI Development','AI'] },
];

export default function Pricing(){
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState(STATIC_CARDS);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const els = Array.from(document.querySelectorAll('.pricing-page .card'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el=> io.observe(el));
    return ()=> io.disconnect();
  }, []);

  // Fetch dynamic plans
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        const { items } = await PricingAPI.list();
        if(mounted && Array.isArray(items) && items.length){
          const mapped = items
            .filter(p=>p.published!==false)
            .sort((a,b)=> (a.order||0) - (b.order||0))
            .map(p => ({
              title: p.name,
              price: p.priceMonthly ? `$${p.priceMonthly}` : '$0',
              desc: p.recommended ? 'Recommended plan' : '',
              features: p.features || [],
              tags: ['All'],
              highlight: !!p.recommended,
            }));
          if(mapped.length) setCards(mapped);
        }
      }catch(_e){ /* fallback to static */ }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const pills = ['All','AI Call Agent','AI Assistant','Custom CRM','Custom Software','Shopify','Wix','Webflow','AI Development','Mobile Apps'];
  const [selected, setSelected] = useState('All');

  function onSelect(p){
    setSelected(p);
    // smooth scroll to grid
    const el = document.getElementById('grid');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const filtered = useMemo(()=> cards.filter(c => (selected==='All') || (c.tags?.includes(selected))), [cards, selected]);

  // Ensure newly filtered cards are visible (bypass IO delay)
  useEffect(()=>{
    const cards = document.querySelectorAll('.pricing-page #grid .card');
    cards.forEach(c => c.classList.add('show'));
  }, [selected]);

  return (
    <>
      <Navbar />
      <main className="pricing-page">
        <section className="price-hero" aria-labelledby="price-hero-title">
          <div className="container">
            <h1 id="price-hero-title">Transparent pricing for every service</h1>
            <p className="lead">Pick a package or request a custom quote. Prices are scoped to ship fast with quality.</p>
            <div className="actions">
              <a href="#grid" className="btn">Explore packages</a>
            </div>
            <div className="pills" aria-label="Services">
              {pills.map((p,i)=> (
                <button key={i} type="button" onClick={()=>onSelect(p)} className={`pill ${selected===p?'active':''}`}>{p}</button>
              ))}
            </div>
          </div>
        </section>

        <section id="grid" className="price-grid" aria-label="Pricing options">
          <div className="container grid">
            {filtered.map((c,i)=> (
              <article key={`${c.title}-${i}`} className={`card ${c.highlight?'highlight':''}`} style={{transitionDelay:`${i*60}ms`}}>
                <h3>{c.title}</h3>
                <p className="desc">{c.desc}</p>
                <div className="amount">{c.price}</div>
                <ul className="features">
                  {c.features.map((f,j)=>(<li key={j}>{f}</li>))}
                </ul>
                <button className="btn cta-dark" onClick={()=>setOpen(true)}>Get started</button>
              </article>
            ))}

            {/* Last two special cards (swapped order) */}
            <article className="card special alt" style={{transitionDelay:`${cards.length*60}ms`}}>
              <h3>Maintenance & Support</h3>
              <p className="desc">Keep your product running smoothly with monthly support and improvements.</p>
              <ul className="features">
                <li>Bug fixes & patches</li>
                <li>Performance checks</li>
                <li>Minor enhancements</li>
                <li>Monthly report</li>
              </ul>
              <button className="btn cta-dark" onClick={()=>setOpen(true)}>Contact sales</button>
            </article>
            <article className="card special" style={{transitionDelay:`${(cards.length+1)*60}ms`}}>
              <div className="special-art" aria-hidden="true" />
              <h3>Need a Custom Quote?</h3>
              <p className="desc">Tell us what you want to build — we’ll tailor a plan to your scope.</p>
              <button className="btn cta-dark" onClick={()=>setOpen(true)}>Get started →</button>
            </article>
          </div>
        </section>
      </main>
      <PricingQuoteModal open={open} onClose={()=>setOpen(false)} />
      <Footer />
    </>
  );
}
