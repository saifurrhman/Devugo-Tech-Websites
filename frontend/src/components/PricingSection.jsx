import React, { useEffect, useState, useRef } from 'react';
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
  const gridRef = useRef(null);

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

  // Animate cards on scroll: handled by Framer Motion variants below
  useEffect(()=>{
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
    setTimeout(() => setSelectedPlan(null), 300);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

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
              className="text-center py-12"
            >
              <h3 style={{marginBottom: '.5rem'}}>No Plans Available</h3>
              <p className="text-slate-600 mb-6" style={{maxWidth: '400px', margin: '0 auto 1.5rem'}}>
                We're currently updating our pricing. Please contact us directly for a custom quote.
              </p>
              <button onClick={() => handleOpenQuote(null)} className="btn primary">
                Request Custom Quote
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pricing-grid-wrapper"
            >
              <div ref={gridRef} className="pricing-grid">
                {plans.map((plan, i)=> (
                  <motion.article 
                    variants={itemVariants}
                    key={plan._id || i} 
                    className={`price-card ${plan.recommended ? 'highlight' : ''}`}
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
                  
                  <div className="price-header">
                    <h3 className="price-title">{plan.name}</h3>
                    <p className="price-blurb">{plan.description || ''}</p>
                    <div className="price-amount">{formatPrice(plan)}</div>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <ul className="price-features">
                      {plan.features.map((f, j)=> (<li key={j}>{f}</li>))}
                    </ul>
                  )}
                  
                  <button className="btn cta-dark" onClick={() => handleOpenQuote(plan)}>
                    {plan.planType === 'custom' ? 'Get Quote' : 'Get started'}
                  </button>
                </motion.article>
              ))}

              {/* Custom quote card */}
              {showCustom && (
                <motion.article variants={itemVariants} className="price-card custom">
                  <div className="custom-graphic" aria-hidden="true" />
                  <h3 className="price-title">Need a custom quote?</h3>
                  <p className="price-blurb">Tell us what you want to build — we'll tailor a plan to your scope.</p>
                  <button className="btn cta-dark" onClick={() => handleOpenQuote(null)}>Get started →</button>
                </motion.article>
              )}
              </div>
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