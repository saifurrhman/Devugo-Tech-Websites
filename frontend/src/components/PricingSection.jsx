import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PricingSection.css';
import PricingQuoteModal from './PricingQuoteModal';
import { PricingAPI } from '../lib/api';

export default function PricingSection({ showCustom = true, limit = 6 }){
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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
            .sort((a,b) => (a.order || 0) - (b.order || 0))
            .slice(0, limit); // Limit number of plans shown
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
  },[limit]);

  // Animate cards on scroll
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
  }, [plans]);

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

  return (
    <section className="pricing-home" aria-labelledby="pricing-home-title">
      <div className="container">
        <header className="pricing-head">
          <h2 id="pricing-home-title">Choose a package that fits</h2>
          <p className="muted">Transparent pricing to get you moving fast. See full options on the Pricing page.</p>
        </header>

        <div className="pricing-grid">
          {loading ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem 2rem',
              color: '#6b7280'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
              <p>Loading pricing plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem 2rem'
            }}>
              <h3 style={{marginBottom: '.5rem'}}>No Plans Available</h3>
              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                No pricing plans are currently available.
              </p>
              <button className="btn" onClick={()=>setOpen(true)}>
                Request Custom Quote
              </button>
            </div>
          ) : (
            <>
              {plans.map((plan, i)=> (
                <article 
                  key={plan._id || i} 
                  className={`price-card ${plan.recommended ? 'highlight' : ''}`} 
                  style={{ transitionDelay: `${i*60}ms` }}
                >
                  {plan.recommended && (
                    <div className="recommended-badge" style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '20px',
                      background: '#10b981',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ⭐ Recommended
                    </div>
                  )}
                  
                  <h3 className="price-title">{plan.name}</h3>
                  <p className="price-blurb">{plan.description || ''}</p>
                  <div className="price-amount">{formatPrice(plan)}</div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <ul className="price-features">
                      {plan.features.map((f, j)=> (<li key={j}>{f}</li>))}
                    </ul>
                  )}
                  
                  <button className="btn cta-dark" onClick={()=>setOpen(true)}>
                    {plan.planType === 'custom' ? 'Get Quote' : 'Get started'}
                  </button>
                </article>
              ))}

              {/* Custom quote card */}
              {showCustom && (
                <article className="price-card custom" style={{ transitionDelay: `${plans.length*60}ms` }}>
                  <div className="custom-graphic" aria-hidden="true" />
                  <h3 className="price-title">Need a custom quote?</h3>
                  <p className="price-blurb">Tell us what you want to build — we'll tailor a plan to your scope.</p>
                  <button className="btn cta-dark" onClick={()=>setOpen(true)}>Get started →</button>
                </article>
              )}
            </>
          )}
        </div>

        {!loading && plans.length > 0 && (
          <div className="pricing-actions">
            <Link to="/pricing" className="btn outline">See all pricing</Link>
          </div>
        )}
      </div>
      <PricingQuoteModal open={open} onClose={()=>setOpen(false)} />
    </section>
  );
}