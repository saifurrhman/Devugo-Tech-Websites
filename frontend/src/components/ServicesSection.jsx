import React, { useEffect, useRef, useState } from 'react';
import ServiceInquiryModal from './ServiceInquiryModal';
import './ServicesSection.css';

const services = [
  { title: 'UX CRO Audit', desc: 'Detailed UX and CRO audits to uncover conversion barriers, optimize user flows, and enhance engagement.' },
  { title: 'UX UI Design', desc: 'Clean designs for websites, web apps, mobile apps, and SaaS products that enhance user experience and drive conversions.' },
  { title: 'Web Development', desc: 'Robust web development for scalable, high–performing websites and applications tailored to your business needs.' },
  { title: 'SAAS Products', desc: 'From MVPs to full–scale platforms, we build SaaS products that are scalable, reliable, and ready for growth.' },
  { title: 'E‑commerce Development', desc: 'High‑converting eCommerce solutions crafted to maximize sales and streamline management for sustained growth.' },
  { title: 'Low‑Code / No‑Code', desc: 'Build MVPs rapidly using tools like Webflow and automation platforms — launch faster with quality.' },
  // Added per request
  { title: 'AI Call Agent', desc: 'Deploy voice AI agents that answer calls, schedule, qualify leads, and provide instant responses 24/7.' },
  { title: 'AI Agent', desc: 'Custom AI assistants for support, sales, and internal ops — integrated with your tools and workflows.' },
  { title: 'Custom CRM System', desc: 'Tailor‑made CRM systems with pipelines, automations, and reporting designed around your team.' },
  { title: 'Custom Software Development', desc: 'End‑to‑end product development — from discovery and design to scalable, secure engineering.' },
  { title: 'Shopify Development', desc: 'High‑performing Shopify stores, custom themes, and app integrations that convert.' },
  { title: 'Wix Development', desc: 'Beautiful Wix websites with custom components and SEO best practices.' },
  { title: 'Webflow Development', desc: 'Pixel‑perfect Webflow sites with CMS, animations, and enterprise‑grade performance.' },
  { title: 'AI Development', desc: 'Design, train, and integrate AI models into your product — from LLM features to intelligent automation.' },
  { title: 'Mobile Apps Development', desc: 'Native and cross‑platform apps with smooth UX, performance, and app‑store readiness.' },
];

export default function ServicesSection(){
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  // Show 3 on mobile, 6 on larger screens
  const [initialCount, setInitialCount] = useState(6);
  const [visibleCount, setVisibleCount] = useState(6);
  const gridRef = useRef(null);
  const [revealed, setRevealed] = useState([]);

  function openInquiry(service){
    setSelected(service);
    setOpen(true);
  }

  useEffect(()=>{
    const init = window.innerWidth <= 640 ? 3 : 6;
    setInitialCount(init);
    setVisibleCount(init);
  }, []);

  useEffect(()=>{
    const els = Array.from(gridRef.current?.querySelectorAll('.service-card') || []);
    // Stagger in any cards already in (or near) the viewport on first paint
    const vh = window.innerHeight || 800;
    els.forEach((el, index)=>{
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9){
        setTimeout(()=>{ el.classList.add('show'); }, Math.min(index, 8) * 90);
      }
    });

    // Observe the rest for lazy reveal while scrolling
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const index = els.indexOf(entry.target);
          setTimeout(()=>{ entry.target.classList.add('show'); }, Math.min(index, 8) * 90);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.1 });
    els.forEach(el=> io.observe(el));
    return ()=> io.disconnect();
  }, [visibleCount]);

  function loadMore(){
    const step = window.innerWidth <= 640 ? 3 : 6;
    setVisibleCount(c => {
      const next = Math.min(services.length, c + step);
      // scroll into view after adding
      setTimeout(()=>{
        document.querySelector('.load-more-wrap')?.scrollIntoView({ behavior:'smooth', block:'center' });
      }, 30);
      return next;
    });
  }
  function showLess(){
    setVisibleCount(initialCount);
    // remove 'show' from cards beyond initial so they animate again when re-shown
    const els = Array.from(gridRef.current?.querySelectorAll('.service-card') || []);
    els.forEach((el, idx)=>{ if (idx >= initialCount) el.classList.remove('show'); });
  }

  return (
    <section className="services-section" aria-labelledby="services-title">
      <div className="container">
        <div className="services-head">
          <h2 id="services-title" className="services-title">Services</h2>
          <p className="services-sub">From initial design to ongoing management, our team delivers tailored solutions that enhance user experience, boost conversions, and drive growth.</p>
        </div>
        <div ref={gridRef} className="services-grid">
          {services.slice(0, visibleCount).map((s, i) => (
            <article className="service-card" key={i} onClick={()=>openInquiry(s)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ openInquiry(s); } }}>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <span className="service-link" aria-label={`Inquire about ${s.title}`}>
                <span className="icon" aria-hidden>
                  <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Learn More
              </span>
            </article>
          ))}
        </div>
        {services.length > visibleCount ? (
          <div className="load-more-wrap">
            <button className="btn cta-dark load-more-btn" onClick={loadMore}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Load more…
              </span>
            </button>
            <div className="progress-hint">{`${visibleCount} of ${services.length} shown`}</div>
          </div>
        ) : services.length > initialCount ? (
          <div className="load-more-wrap">
            <button className="btn cta-dark load-more-btn" onClick={showLess}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Show less
              </span>
            </button>
            <div className="progress-hint">{`${visibleCount} of ${services.length} shown`}</div>
          </div>
        ) : null}
      </div>
      <ServiceInquiryModal open={open} onClose={()=>setOpen(false)} service={selected} />
    </section>
  );
}
