import React, { useEffect, useRef, useState } from 'react';
import ServiceInquiryModal from './ServiceInquiryModal';
import './ServicesSection.css';
import { ServiceAPI } from '../lib/api';

export default function ServicesSection({ variant }){
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(()=>{
    let mounted = true;
    
    (async()=>{
      setLoading(true);
      setError('');
      try{
        console.log('🔍 Fetching services from API...');
        
        const response = await ServiceAPI.list();
        console.log('✅ Raw API Response:', response);
        console.log('✅ Response type:', typeof response);
        console.log('✅ Is Array?:', Array.isArray(response));
        
        // Handle different response formats
        let items = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response && typeof response === 'object') {
          items = response.items || response.data || response.services || [];
        }
        
        console.log('📦 Extracted items:', items);
        console.log('📊 Items length:', items.length);
        
        if(mounted && Array.isArray(items) && items.length > 0){
          const mapped = items
            .filter(s => {
              console.log('🔍 Checking service:', s.title, 'Published:', s.published);
              // Accept all services if published field doesn't exist
              if (s.published === undefined || s.published === null) return true;
              if (typeof s.published === 'boolean') return s.published === true;
              if (typeof s.published === 'string') return s.published === 'true' || s.published === '1';
              if (typeof s.published === 'number') return s.published === 1;
              return false;
            })
            .sort((a,b) => (a.order || 0) - (b.order || 0))
            .map(s => ({
              title: s.title || 'Untitled Service',
              desc: s.description || s.desc || '',
              slug: s.slug || '',
            }));
          
          console.log('✅ Final mapped services:', mapped.length, mapped);
          setServices(mapped);
        } else {
          console.warn('⚠️ No services found or empty array');
          console.log('Items received:', items);
          setServices([]);
        }
      } catch(err) { 
        console.error('❌ Failed to load services:', err);
        console.error('❌ Error details:', err.message, err.stack);
        if(mounted) {
          setError('Failed to load services. Please try again later.');
          setServices([]);
        }
      } finally { 
        if(mounted) setLoading(false); 
      }
    })();
    
    return ()=>{ mounted = false };
  }, []);

  useEffect(()=>{
    if (loading) return;

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
          <div className="text-center py-12">
            <p className="text-slate-600">Loading services...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No services available yet.</p>
            <a 
              href="/admin/services" 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block no-underline"
            >
              Add Services in Admin
            </a>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="services-grid">
              {(isHome ? services.slice(0,6) : services.slice(0, visibleCount)).map((s, i) => (
                <article
                  className="service-card flex flex-col"
                  key={`${s.slug || s.title}-${i}`}
                  role="article"
                  tabIndex={0}
                >
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-desc mb-auto">{s.desc}</p>
                  
                  {/* HOME PAGE: Single button at bottom */}
                  {isHome && (
                    <a 
                      href="/services#services" 
                      className="service-link mt-auto"
                      aria-label={`View ${s.title} on Services page`}
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
                  )}

                  {/* SERVICES PAGE: Two centered buttons */}
                  {!isHome && (
                    <div className="flex gap-2 mt-auto pt-4 justify-center items-center">
                      {/* Learn More Button */}
                      {s.slug ? (
                        <a 
                          href={`/services/${s.slug}`}
                          className="service-link flex-1"
                          aria-label={`Learn more about ${s.title}`}
                        >
                          <span className="icon">
                            <svg viewBox="0 0 24 24" width="16" height="16">
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
                      ) : (
                        <button 
                          onClick={() => openInquiry(s)}
                          className="service-link flex-1"
                          aria-label={`Learn more about ${s.title}`}
                        >
                          <span className="icon">
                            <svg viewBox="0 0 24 24" width="16" height="16">
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
                        </button>
                      )}

                      {/* Get Quote Button - Primary */}
                      <button 
                        onClick={() => openInquiry(s)}
                        className="service-link service-link-primary flex-1"
                        aria-label={`Get quote for ${s.title}`}
                      >
                        <span className="icon">
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path 
                              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        Get Quote
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* View All Services - Home Page Only */}
            {isHome && services.length > 6 && (
              <div className="load-more-wrap mt-8">
                <a 
                  href="/services#services" 
                  className="btn cta-dark load-more-btn no-underline inline-block"
                >
                  <span className="inline-flex items-center gap-2">
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

            {/* Load More/Show Less - Services Page Only */}
            {!isHome && services.length > visibleCount ? (
              <div className="load-more-wrap">
                <button className="btn cta-dark load-more-btn" onClick={loadMore}>
                  <span className="inline-flex items-center gap-2">
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
                  <span className="inline-flex items-center gap-2">
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