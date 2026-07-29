import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PricingSection.css';
import PricingQuoteModal from './PricingQuoteModal';
import { PricingAPI } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonCard from './SkeletonCard';

export default function PricingSection({ showCustom = true, limit = 6 }){
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pricing plans from API
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true);
      try{
        const fetchPromise = PricingAPI.list();
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 500));

        const [response] = await Promise.all([
          fetchPromise,
          minTimePromise
        ]);

        let items = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response && typeof response === 'object') {
          items = response.items || response.data || [];
        }

        if(mounted && Array.isArray(items) && items.length){
          const published = items
            .filter(p => p.published !== false)
            .sort((a,b) => (a.order || 0) - (b.order || 0))
            .slice(0, limit); // Limit number of plans shown
          setPlans(published);
        }
      }catch(err){ 
        console.error('Failed to load pricing:', err);
        if (mounted) {
          setPlans([]);
        }
      }
      finally{ 
        if(mounted) setLoading(false); 
      }
    })();
    return ()=>{ mounted=false };
  },[limit]);

  // Animate cards on scroll
  useEffect(()=>{
    if (loading) return;
    
    let io = null;
    const timer = setTimeout(() => {
      const cards = Array.from(document.querySelectorAll('.pricing-home .price-card'));
      io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            e.target.classList.add('show');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      cards.forEach(c=> io.observe(c));
    }, 400);

    return () => {
      clearTimeout(timer);
      if (io) io.disconnect();
    };
  }, [plans, loading]);

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

  function handleOpenQuote(plan = null) {
    setSelectedPlan(plan);
    setOpen(true);
  }

  function handleCloseQuote() {
    setOpen(false);
    // Clear selected plan after modal closes
    setTimeout(() => setSelectedPlan(null), 300);
  }

  return (
    <section className="pricing-home" aria-labelledby="pricing-home-title">
      <div className="container">
        <header className="pricing-head">
          <h2 id="pricing-home-title">Choose a package that fits</h2>
          <p className="muted">Transparent pricing to get you moving fast. See full options on the Pricing page.</p>
        </header>

        <div className="pricing-grid">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ display: 'contents' }} // Allow grid layout to work through the motion wrapper
              >
                {[1, 2, 3].map(i => (
                  <SkeletonCard key={i} variant="pricing" />
                ))}
              </motion.div>
            ) : plans.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem 2rem'
                }}
              >
                <h3 style={{marginBottom: '.5rem'}}>No Plans Available</h3>
                <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                  No pricing plans are currently available.
                </p>
                <button className="btn" onClick={() => handleOpenQuote(null)}>
                  Request Custom Quote
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ display: 'contents' }}
              >
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
                  
                  <button className="btn cta-dark" onClick={() => handleOpenQuote(plan)}>
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
                  <button className="btn cta-dark" onClick={() => handleOpenQuote(null)}>Get started →</button>
                </article>
              )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!loading && plans.length > 0 && (
          <div className="pricing-actions">
            <Link to="/pricing" className="btn outline">See all pricing</Link>
          </div>
        )}
      </div>
      <PricingQuoteModal 
        open={open} 
        onClose={handleCloseQuote}
        selectedPlan={selectedPlan}
      />
    </section>
  );
}