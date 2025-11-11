import React, { useEffect, useRef, useState } from 'react';
import ServiceInquiryModal from './ServiceInquiryModal';
import './ServicesSection.css';
import { ServiceAPI } from '../lib/api';

const STATIC_SERVICES = [
  { title: 'UX CRO Audit', desc: 'Detailed UX and CRO audits to uncover conversion barriers, optimize user flows, and enhance engagement.' },
  { title: 'UX UI Design', desc: 'Clean designs for websites, web apps, mobile apps, and SaaS products that enhance user experience and drive conversions.' },
  { title: 'Web Development', desc: 'Robust web development for scalable, high–performing websites and applications tailored to your business needs.' },
  { title: 'SAAS Products', desc: 'From MVPs to full–scale platforms, we build SaaS products that are scalable, reliable, and ready for growth.' },
  { title: 'E‑commerce Development', desc: 'High‑converting eCommerce solutions crafted to maximize sales and streamline management for sustained growth.' },
  { title: 'Low‑Code / No‑Code', desc: 'Build MVPs rapidly using tools like Webflow and automation platforms — launch faster with quality.' },
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

export default function ServicesSection({ variant }){
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [services, setServices] = useState(STATIC_SERVICES);
  const [loading, setLoading] = useState(true);
  const [usingStatic, setUsingStatic] = useState(false);
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

  // Fetch dynamic services from admin, fallback to static
  useEffect(()=>{
    let mounted = true;
    
    (async()=>{
      try{
        console.log('🔍 Attempting to fetch services from API...');
        
        // Try to fetch from API
        const response = await ServiceAPI.list();
        console.log('✅ API Response:', response);
        
        // Extract items from response
        const items = response.items || response.data || (Array.isArray(response) ? response : []);
        
        if(mounted && Array.isArray(items) && items.length > 0){
          // Map dynamic services to expected format
          const mapped = items
            .filter(s => {
              // Handle different published field types
              if (s.published === undefined) return true;
              if (typeof s.published === 'boolean') return s.published;
              if (typeof s.published === 'string') return s.published === 'true' || s.published === '1';
              if (typeof s.published === 'number') return s.published === 1;
              return s.published !== false;
            })
            .sort((a,b) => (a.order || 0) - (b.order || 0))
            .map(s => ({
              title: s.title,
              desc: s.description || s.desc,
              slug: s.slug,
            }));
          
          if(mapped.length > 0) {
            console.log('✅ Using dynamic services:', mapped.length);
            setServices(mapped);
            setUsingStatic(false);
          } else {
            console.warn('⚠️ No published services found, using static services');
            setServices(STATIC_SERVICES);
            setUsingStatic(true);
          }
        } else {
          console.warn('⚠️ API returned no items, using static services');
          setServices(STATIC_SERVICES);
          setUsingStatic(true);
        }
      } catch(err) { 
        console.warn('⚠️ Failed to load dynamic services, using static fallback:', err.message);
        if(mounted) {
          setServices(STATIC_SERVICES);
          setUsingStatic(true);
        }
      } finally { 
        if(mounted) setLoading(false); 
      }
    })();
    
    return ()=>{ mounted = false };
  }, []);

  // Animation effect
  useEffect(()=>{
    if (loading) return;

    const els = Array.from(gridRef.current?.querySelectorAll('.service-card') || []);
    const vh = window.innerHeight || 800;
    
    // Stagger in any cards already in (or near) the viewport on first paint
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
  }, [visibleCount, loading]);

  function loadMore(){
    const step = window.innerWidth <= 640 ? 3 : 6;
    setVisibleCount(c => {
      const next = Math.min(services.length, c + step);
      setTimeout(()=>{
        document.querySelector('.load-more-wrap')?.scrollIntoView({ 
          behavior:'smooth', 
          block:'center' 
        });
      }, 30);
      return next;
    });
  }
  
  function showLess(){
    setVisibleCount(initialCount);
    const els = Array.from(gridRef.current?.querySelectorAll('.service-card') || []);
    els.forEach((el, idx)=>{ 
      if (idx >= initialCount) el.classList.remove('show'); 
    });
  }

  const isHome = variant === 'home';

  return (
    <section id="services" className="services-section" aria-labelledby="services-title">
      <div className="container">
        <div className="services-head">
          <h2 id="services-title" className="services-title">Services</h2>
          <p className="services-sub">
            From initial design to ongoing management, our team delivers tailored 
            solutions that enhance user experience, boost conversions, and drive growth.
          </p>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'3rem 0'}}>
            <p style={{color:'#666'}}>Loading services...</p>
          </div>
        ) : (
          <>
            {/* Optional: Show a subtle notice when using static services */}
            {usingStatic && !isHome && (
              <div style={{
                textAlign: 'center',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                color: '#93c5fd',
                fontSize: '0.9rem'
              }}>
                💡 <strong>Note:</strong> Dynamic services unavailable. Showing default service list.
                {' '}
                <a 
                  href="/admin/services" 
                  style={{
                    color: '#60a5fa',
                    textDecoration: 'underline'
                  }}
                >
                  Manage in Admin
                </a>
              </div>
            )}

            <div ref={gridRef} className="services-grid">
              {(isHome ? services.slice(0,6) : services.slice(0, visibleCount)).map((s, i) => (
                <article
                  className="service-card"
                  key={`${s.slug || s.title}-${i}`}
                  onClick={()=>{
                    if (s.slug) { 
                      window.location.href = `/services/${s.slug}`; 
                      return; 
                    }
                    if(!isHome){ 
                      openInquiry(s) 
                    } else { 
                      window.location.href = '/services#services'; 
                    }
                  }}
                  role={isHome ? 'link' : 'button'}
                  tabIndex={0}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter' || e.key===' '){
                      e.preventDefault();
                      if (s.slug) { 
                        window.location.href = `/services/${s.slug}`; 
                        return; 
                      }
                      if(!isHome){ 
                        openInquiry(s) 
                      } else { 
                        window.location.href = '/services#services'; 
                      }
                    }
                  }}
                >
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-desc">{s.desc}</p>
                  {isHome ? (
                    <a 
                      href="/services#services" 
                      className="service-link" 
                      aria-label={`View ${s.title} on Services page`} 
                      onClick={(e)=>e.stopPropagation()}
                    >
                      <span className="icon" aria-hidden>
                        <svg viewBox="0 0 24 24">
                          <path 
                            d="M5 12h12M13 6l6 6-6 6" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      View on Services
                    </a>
                  ) : (
                    <a 
                      href={s.slug ? `/services/${s.slug}` : '#services'} 
                      className="service-link" 
                      aria-label={`Learn more about ${s.title}`} 
                      onClick={(e)=>e.stopPropagation()}
                    >
                      <span className="icon" aria-hidden>
                        <svg viewBox="0 0 24 24">
                          <path 
                            d="M5 12h12M13 6l6 6-6 6" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
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
                      <path 
                        d="M5 12h14M12 5l7 7-7 7" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
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
                      <path 
                        d="M12 5v14M5 12h14" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                      />
                    </svg>
                    Load more…
                  </span>
                </button>
                <div className="progress-hint">
                  {`${visibleCount} of ${services.length} shown`}
                </div>
              </div>
            ) : !isHome && services.length > initialCount ? (
              <div className="load-more-wrap">
                <button className="btn cta-dark load-more-btn" onClick={showLess}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                      <path 
                        d="M5 12h14" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                      />
                    </svg>
                    Show less
                  </span>
                </button>
                <div className="progress-hint">
                  {`${visibleCount} of ${services.length} shown`}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
      {!isHome && (
        <ServiceInquiryModal 
          open={open} 
          onClose={()=>setOpen(false)} 
          service={selected} 
        />
      )}
    </section>
  );
}