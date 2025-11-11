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
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}></div>
                <p>Loading pricing plans...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '4rem 2rem'
              }}>
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

           
          </div>
        </section>

        
      </main>
      
      <PricingQuoteModal open={open} onClose={()=>setOpen(false)} />
      <Footer />
    </>
  );
}