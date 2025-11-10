import React, { useEffect, useRef, useState } from 'react';
import ServiceInquiryModal from './ServiceInquiryModal';
import './ServicesSection.css';
import { ServiceAPI } from '../lib/api';

export default function ServicesSection({ variant }){
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [services, setServices] = useState([]);  // ← CHANGED: Empty array (no static services)
  const [loading, setLoading] = useState(true);
  const [initialCount, setInitialCount] = useState(6);
  const [visibleCount, setVisibleCount] = useState(6);
  const gridRef = useRef(null);

  function openInquiry(service){
    setSelected(service);
    setOpen(true);
  }

  useEffect(()=>{
    const init = window.innerWidth <= 640 ? 3 : 6;
    setInitialCount(init);
    setVisibleCount(init);
  }, []);

  // Fetch dynamic services from admin
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        const { items } = await ServiceAPI.list();
        if(mounted && Array.isArray(items) && items.length){
          const mapped = items
            .filter(s=>s.published!==false)
            .sort((a,b)=> (a.order||0) - (b.order||0))
            .map(s=>({
              title: s.title,
              desc: s.description,
              slug: s.slug,
            }));
          setServices(mapped);
        }
      }catch(err){ 
        console.error('Failed to load services:', err);
      }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  useEffect(()=>{
    const els = Array.from(gridRef.current?.querySelectorAll('.service-card') || []);
    const vh = window.innerHeight || 800;
    els.forEach((el, index)=>{
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9){
        setTimeout(()=>{ el.classList.add('show'); }, Math.min(index, 8) * 90);
      }
    });

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
      setTimeout(()=>{
        document.querySelector('.load-more-wrap')?.scrollIntoView({ behavior:'smooth', block:'center' });
      }, 30);
      return next;
    });
  }
  
  function showLess(){
    setVisibleCount(initialCount);
    const els = Array.from(gridRef.current?.querySelectorAll('.service-card') || []);
    els.forEach((el, idx)=>{ if (idx >= initialCount) el.classList.remove('show'); });
  }

  const isHome = variant === 'home';

  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="container">
        <div className="services-head">
          <h2 id="services-title" className="services-title">Services</h2>
          <p className="services-sub">From initial design to ongoing management, our team delivers tailored solutions that enhance user experience, boost conversions, and drive growth.</p>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'3rem 0'}}>
            <p style={{color:'#666'}}>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="card" style={{textAlign:'center', padding:'3rem 2rem', margin:'2rem 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}>
            <h3 style={{marginBottom:'0.5rem', color: '#fff'}}>No services available</h3>
            <p style={{color:'#999', margin:'0'}}>Services will appear here once added from admin panel.</p>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="services-grid">
              {(isHome ? services.slice(0,6) : services.slice(0, visibleCount)).map((s, i) => (
                <article
                  className="service-card"
                  key={i}
                  onClick={()=>{
                    if (s.slug) { window.location.href = `/services/${s.slug}`; return; }
                    if(!isHome){ openInquiry(s) } else { window.location.href = '/services#services'; }
                  }}
                  role={isHome ? 'link' : 'button'}
                  tabIndex={0}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter' || e.key===' '){
                      if(!isHome){ openInquiry(s) } else { window.location.href = '/services#services'; }
                    }
                  }}
                >
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-desc">{s.desc}</p>
                  {isHome ? (
                    <a href="/services#services" className="service-link" aria-label={`View ${s.title} on Services page`} onClick={(e)=>e.stopPropagation()}>
                      <span className="icon" aria-hidden>
                        <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      View on Services
                    </a>
                  ) : (
                    <a href={s.slug ? `/services/${s.slug}` : '/services#services'} className="service-link" aria-label={`Learn more about ${s.title}`} onClick={(e)=>e.stopPropagation()}>
                      <span className="icon" aria-hidden>
                        <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      Learn More
                    </a>
                  )}
                </article>
              ))}
            </div>

            {/* View All Services Button - Only on Home Page */}
            {isHome && services.length > 6 && (
              <div className="load-more-wrap" style={{marginTop: '2rem'}}>
                <a 
                  href="/services#services" 
                  className="btn cta-dark load-more-btn"
                  style={{textDecoration: 'none', display: 'inline-block'}}
                >
                  <span style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                      <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    View All Services
                  </span>
                </a>
              </div>
            )}

            {/* Load More/Show Less - Only on Services Page */}
            {!isHome && services.length > visibleCount ? (
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
            ) : !isHome && services.length > initialCount ? (
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
          </>
        )}
      </div>
      {!isHome && (
        <ServiceInquiryModal open={open} onClose={()=>setOpen(false)} service={selected} />
      )}
    </section>
  );
}
