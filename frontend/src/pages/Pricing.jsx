import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingQuoteModal from '../components/PricingQuoteModal';
import './Pricing.css';
import { PricingAPI } from '../lib/api';

export default function Pricing(){
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('All');

  // Animate cards on scroll
  useEffect(()=>{
    const els = Array.from(document.querySelectorAll('.pricing-page .pricing-card'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ 
        if(e.isIntersecting){ 
          e.target.classList.add('show'); 
          io.unobserve(e.target); 
        } 
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el=> io.observe(el));
    return ()=> io.disconnect();
  }, [plans]);

  // Fetch pricing plans from API
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true);
      try{
        const { items } = await PricingAPI.list();
        if(mounted && Array.isArray(items) && items.length){
          const published = items
            .filter(p => p.published !== false)
            .sort((a,b) => (a.order || 0) - (b.order || 0));
          setPlans(published);
        }
      }catch(err){ 
        console.error('Failed to load pricing:', err);
      }
      finally{ 
        if(mounted) setLoading(false); 
      }
    })();
    return ()=>{ mounted=false };
  },[]);

  // Service filter pills
  const pills = ['All', 'Subscription', 'One-Time', 'Custom'];

  function onSelect(p){
    setSelected(p);
    const el = document.getElementById('grid');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Filter plans by type
  const filtered = useMemo(()=> {
    if (selected === 'All') return plans;
    const typeMap = {
      'Subscription': 'subscription',
      'One-Time': 'one-time',
      'Custom': 'custom'
    };
    return plans.filter(p => p.planType === typeMap[selected]);
  }, [plans, selected]);

  // Show cards immediately when filter changes
  useEffect(()=>{
    const cards = document.querySelectorAll('.pricing-page #grid .pricing-card');
    cards.forEach(c => c.classList.add('show'));
  }, [selected]);

  function formatPrice(plan) {
    if (plan.planType === 'custom') {
      return 'Custom Quote';
    }
    if (plan.planType === 'one-time') {
      return `$${plan.priceOneTime || 0}`;
    }
    // subscription
    if (plan.priceMonthly) {
      return `$${plan.priceMonthly}/mo`;
    }
    if (plan.priceYearly) {
      return `$${plan.priceYearly}/yr`;
    }
    return 'Contact Us';
  }

  function getPricingSubtext(plan) {
    if (plan.planType === 'custom') return 'Get a tailored quote';
    if (plan.planType === 'one-time') return 'One-time setup fee';
    if (plan.priceYearly && plan.priceMonthly) {
      return `or $${plan.priceYearly}/year`;
    }
    return '';
  }

  return (
    <>
      <Navbar />
      <main className="pricing-page">
        {/* Hero Section */}
        <section className="price-hero" aria-labelledby="price-hero-title">
          <div className="container">
            <h1 id="price-hero-title">Simple, Transparent Pricing</h1>
            <p className="lead">
              Choose the perfect plan for your needs. All plans include premium support and regular updates.
            </p>
            <div className="actions">
              <a href="#grid" className="btn">View Plans</a>
              <button className="btn-secondary" onClick={()=>setOpen(true)}>
                Get Custom Quote
              </button>
            </div>
            
            {/* Filter Pills */}
            <div className="pills" aria-label="Filter plans">
              {pills.map((p,i)=> (
                <button 
                  key={i} 
                  type="button" 
                  onClick={()=>onSelect(p)} 
                  className={`pill ${selected===p?'active':''}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Grid */}
        <section id="grid" className="price-grid" aria-label="Pricing plans">
          <div className="container grid">
            {loading ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6b7280'
              }}>
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
                <p>Loading pricing plans...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '4rem 2rem'
              }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📋</div>
                <h3 style={{marginBottom: '.5rem'}}>No Plans Available</h3>
                <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                  {selected === 'All' 
                    ? 'No pricing plans are currently available.' 
                    : `No ${selected.toLowerCase()} plans available.`}
                </p>
                <button className="btn" onClick={()=>setOpen(true)}>
                  Request Custom Quote
                </button>
              </div>
            ) : (
              filtered.map((plan, i) => (
                <article 
                  key={plan._id || i} 
                  className={`pricing-card ${plan.recommended ? 'highlight' : ''}`}
                  style={{transitionDelay: `${i * 60}ms`}}
                >
                  {plan.recommended && (
                    <div className="recommended-badge">
                      ⭐ Recommended
                    </div>
                  )}
                  
                  <div className="card-header">
                    <h3>{plan.name}</h3>
                    <div className="price-wrapper">
                      <div className="amount">{formatPrice(plan)}</div>
                      {getPricingSubtext(plan) && (
                        <div className="price-subtext">{getPricingSubtext(plan)}</div>
                      )}
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="features">
                      {plan.features.map((feature, j) => (
                        <li key={j}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{flexShrink: 0}}>
                            <circle cx="10" cy="10" r="9" fill="#10b981" opacity="0.1"/>
                            <path d="M6 10l2.5 2.5L14 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button 
                    className="btn cta-dark" 
                    onClick={()=>setOpen(true)}
                    style={{marginTop: 'auto'}}
                  >
                    {plan.planType === 'custom' ? 'Get Quote' : 'Get Started'}
                  </button>
                </article>
              ))
            )}

            {/* Additional CTAs */}
            {!loading && filtered.length > 0 && (
              <>
                <article className="pricing-card special" style={{transitionDelay: `${filtered.length * 60}ms`}}>
                  <div className="special-icon" style={{fontSize: '3rem', marginBottom: '1rem'}}>
                    🛠️
                  </div>
                  <h3>Maintenance & Support</h3>
                  <p className="desc">
                    Keep your product running smoothly with ongoing support, updates, and improvements.
                  </p>
                  <ul className="features" style={{marginTop: '1.5rem', marginBottom: '1.5rem'}}>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#6366f1" opacity="0.1"/>
                        <path d="M6 10l2.5 2.5L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Bug fixes & patches</span>
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#6366f1" opacity="0.1"/>
                        <path d="M6 10l2.5 2.5L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Performance monitoring</span>
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#6366f1" opacity="0.1"/>
                        <path d="M6 10l2.5 2.5L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Monthly reports</span>
                    </li>
                  </ul>
                  <button className="btn cta-dark" onClick={()=>setOpen(true)}>
                    Contact Sales
                  </button>
                </article>

                <article className="pricing-card special alt" style={{transitionDelay: `${(filtered.length + 1) * 60}ms`}}>
                  <div className="special-art" aria-hidden="true">
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>💬</div>
                  </div>
                  <h3>Need Something Custom?</h3>
                  <p className="desc">
                    Have unique requirements? Let's discuss a tailored solution that fits your exact needs.
                  </p>
                  <button className="btn cta-dark" onClick={()=>setOpen(true)} style={{marginTop: '2rem'}}>
                    Get Custom Quote →
                  </button>
                </article>
              </>
            )}
          </div>
        </section>

        {/* Features Comparison (Optional) */}
        {!loading && plans.length > 0 && (
          <section className="pricing-features" style={{padding: '4rem 0', background: '#f9fafb'}}>
            <div className="container">
              <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                <h2 style={{fontSize: '2rem', marginBottom: '.5rem'}}>Why Choose Our Services?</h2>
                <p style={{color: '#6b7280', maxWidth: '600px', margin: '0 auto'}}>
                  Every plan includes our commitment to quality, transparency, and exceptional support.
                </p>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem'
              }}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>⚡</div>
                  <h3 style={{fontSize: '1.125rem', marginBottom: '.5rem'}}>Fast Delivery</h3>
                  <p style={{color: '#6b7280', fontSize: '.875rem'}}>
                    Quick turnaround times without compromising quality
                  </p>
                </div>
                
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>🎯</div>
                  <h3 style={{fontSize: '1.125rem', marginBottom: '.5rem'}}>Quality First</h3>
                  <p style={{color: '#6b7280', fontSize: '.875rem'}}>
                    Premium code, design, and user experience in every project
                  </p>
                </div>
                
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>💬</div>
                  <h3 style={{fontSize: '1.125rem', marginBottom: '.5rem'}}>Dedicated Support</h3>
                  <p style={{color: '#6b7280', fontSize: '.875rem'}}>
                    Direct communication and ongoing assistance
                  </p>
                </div>
                
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>🔒</div>
                  <h3 style={{fontSize: '1.125rem', marginBottom: '.5rem'}}>Secure & Scalable</h3>
                  <p style={{color: '#6b7280', fontSize: '.875rem'}}>
                    Built with best practices and future growth in mind
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <PricingQuoteModal open={open} onClose={()=>setOpen(false)} />
      <Footer />
    </>
  );
}