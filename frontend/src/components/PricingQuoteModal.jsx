import React, { useEffect, useRef, useState } from 'react';

// Mock API - replace with your actual API
const ContactAPI = {
  create: async (data) => {
    console.log('Submitting quote request:', data);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export default function PricingQuoteModal({ open, onClose, selectedPlan = null }){
  const ref = useRef(null);
  const [form, setForm] = useState({ 
    name:'', 
    email:'', 
    phone:'', 
    projectType: '', 
    budget: '', 
    message:'',
    pricingOption: 'monthly' // new field for monthly/yearly choice
  });
  const [loading, setLoading] = useState(false);

  const budgetOptions = [
    { value: '', label: 'Select budget range' },
    { value: '$1k – $3k', label: '$1k – $3k' },
    { value: '$3k – $7k', label: '$3k – $7k' },
    { value: '$7k – $15k', label: '$7k – $15k' },
    { value: '$15k – $30k', label: '$15k – $30k' },
    { value: '$30k – $50k', label: '$30k – $50k' },
    { value: '$50k+', label: '$50k+' }
  ];

  // Check if plan has both monthly and yearly pricing
  const hasBothPricingOptions = selectedPlan && selectedPlan.priceMonthly && selectedPlan.priceYearly;

  useEffect(() => {
    if (selectedPlan && open) {
      const planDetails = `Interested in: ${selectedPlan.name}\nPlan Type: ${selectedPlan.planType}\nPrice: ${formatPlanPrice(selectedPlan)}`;
      
      setForm(f => ({
        ...f,
        projectType: selectedPlan.name,
        budget: '',
        pricingOption: 'monthly', // default to monthly
        message: planDetails + '\n\nAdditional details:\n'
      }));
    } else if (!selectedPlan && open) {
      setForm(f => ({
        ...f,
        projectType: 'Custom',
        pricingOption: 'monthly',
        message: ''
      }));
    }
  }, [selectedPlan, open]);

  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose?.(); }
    if(open){ 
      document.addEventListener('keydown', onKey); 
      return ()=>document.removeEventListener('keydown', onKey); 
    }
  }, [open, onClose]);

  useEffect(()=>{ 
    if(open){ 
      setTimeout(()=> ref.current?.focus(), 0); 
    } 
  }, [open]);

  function formatPlanPrice(plan, option = null) {
    if (!plan) return '';
    if (plan.planType === 'custom') return 'Custom Quote';
    if (plan.planType === 'one-time') return `$${plan.priceOneTime || 0} (One-time)`;
    
    // If option is specified, use that
    if (option === 'yearly' && plan.priceYearly) return `$${plan.priceYearly}/yr`;
    if (option === 'monthly' && plan.priceMonthly) return `$${plan.priceMonthly}/mo`;
    
    // Otherwise default behavior
    if (plan.priceMonthly) return `$${plan.priceMonthly}/mo`;
    if (plan.priceYearly) return `$${plan.priceYearly}/yr`;
    return 'Contact for pricing';
  }

  function getSelectedPrice() {
    if (!selectedPlan) return '';
    return formatPlanPrice(selectedPlan, form.pricingOption);
  }

  function onChange(e){ 
    const { name, value } = e.target; 
    setForm(f=>({...f,[name]:value})); 
  }

  async function handleSubmit(){
    if (!form.name || !form.email) {
      alert('Please fill in Name and Email');
      return;
    }
    
    if (!selectedPlan && !form.budget) {
      alert('Please select your budget range');
      return;
    }
    
    try{
      setLoading(true);
      
      let adminMessage = form.message;
      
      if (selectedPlan) {
        const selectedPrice = getSelectedPrice();
        adminMessage = `
=== PRICING QUOTE REQUEST ===

Selected Plan: ${selectedPlan.name}
Plan Type: ${selectedPlan.planType}
Selected Pricing: ${selectedPrice} (${form.pricingOption === 'monthly' ? 'Monthly' : 'Yearly'})

${selectedPlan.features && selectedPlan.features.length > 0 ? `
Features Included:
${selectedPlan.features.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}
` : ''}

Additional Details:
${form.message}
        `.trim();
      } else {
        adminMessage = `
=== CUSTOM QUOTE REQUEST ===

Project Type: ${form.projectType}
Estimated Budget: ${form.budget}

Customer Message:
${form.message}
        `.trim();
      }
      
      const submissionData = {
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        message: adminMessage,
        source: 'Pricing Page Quote',
        inquiryType: 'pricing_quote',
        projectType: form.projectType,
        budget: selectedPlan ? getSelectedPrice() : form.budget,
        pricingOption: selectedPlan ? form.pricingOption : null, // monthly or yearly
        selectedPlan: selectedPlan ? {
          id: selectedPlan._id,
          name: selectedPlan.name,
          planType: selectedPlan.planType,
          price: getSelectedPrice(),
          pricingOption: form.pricingOption, // Add pricing option
          priceMonthly: selectedPlan.priceMonthly || null,
          priceYearly: selectedPlan.priceYearly || null,
          priceOneTime: selectedPlan.priceOneTime || null,
          selectedPrice: form.pricingOption === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly,
          features: selectedPlan.features || [],
          description: selectedPlan.description || '',
          recommended: selectedPlan.recommended || false
        } : null
      };
      
      await ContactAPI.create(submissionData);
      
      setLoading(false); 
      onClose?.();
      setForm({ name:'', email:'', phone:'', projectType:'', budget:'', message:'', pricingOption: 'monthly' });
      alert('Thanks! We\'ll reply with a custom quote for ' + (selectedPlan?.name || 'your inquiry') + '.');
    }catch(err){ 
      setLoading(false); 
      alert(err.message || 'Failed to submit.'); 
    }
  }

  if(!open) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}
    >
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="pq-title" 
        tabIndex={-1} 
        ref={ref}
        style={{
          background: '#0a1929',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <header style={{
          padding: '1.75rem 2rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <h3 id="pq-title" style={{
            margin: 0, 
            color: '#ffffff',
            fontSize: '1.75rem',
            fontWeight: '700',
            letterSpacing: '-0.01em'
          }}>
            Custom Quote
          </h3>
          <button 
            onClick={onClose} 
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '1.75rem',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              padding: 0,
              lineHeight: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.color = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#64748b';
            }}
          >
            ×
          </button>
        </header>

        {/* Form */}
        <div style={{padding: '2rem'}}>
          {/* Name & Email Grid */}
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1.5rem', 
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#f1f5f9',
                fontWeight: '600',
                fontSize: '0.9375rem'
              }}>
                Name
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                required 
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#0d1b2a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.target.style.background = '#0f1e2f';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.background = '#0d1b2a';
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#f1f5f9',
                fontWeight: '600',
                fontSize: '0.9375rem'
              }}>
                Email
              </label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={onChange} 
                required 
                placeholder="Email address"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#0d1b2a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.target.style.background = '#0f1e2f';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.background = '#0d1b2a';
                }}
              />
            </div>
          </div>

          {/* Project Type & Budget/Pricing Option Grid */}
          <div style={{
            display: 'grid', 
            gridTemplateColumns: selectedPlan ? '1fr 1fr' : '1fr 1fr',
            gap: '1.5rem', 
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#f1f5f9',
                fontWeight: '600',
                fontSize: '0.9375rem'
              }}>
                Project type
              </label>
              <input
                name="projectType"
                value={form.projectType}
                onChange={onChange}
                readOnly={!!selectedPlan}
                placeholder="e.g., Custom Web App"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#0d1b2a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  fontSize: '0.9375rem',
                  cursor: selectedPlan ? 'not-allowed' : 'text',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!selectedPlan) {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.background = '#0f1e2f';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.background = '#0d1b2a';
                }}
              />
              {selectedPlan && (
                <p style={{
                  margin: '0.5rem 0 0',
                  fontSize: '0.8125rem',
                  color: '#64748b'
                }}>
                  Selected plan: {selectedPlan.name}
                </p>
              )}
            </div>
            
            {/* Show pricing option selector if plan has both monthly and yearly */}
            {selectedPlan && hasBothPricingOptions ? (
              <div>
                <label style={{
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#f1f5f9',
                  fontWeight: '600',
                  fontSize: '0.9375rem'
                }}>
                  Billing cycle
                </label>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.5rem 0'
                }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: form.pricingOption === 'monthly' ? 'rgba(59, 130, 246, 0.15)' : '#0d1b2a',
                    border: form.pricingOption === 'monthly' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (form.pricingOption !== 'monthly') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (form.pricingOption !== 'monthly') {
                      e.currentTarget.style.background = '#0d1b2a';
                    }
                  }}
                  >
                    <input
                      type="radio"
                      name="pricingOption"
                      value="monthly"
                      checked={form.pricingOption === 'monthly'}
                      onChange={onChange}
                      style={{margin: 0}}
                    />
                    <div>
                      <div style={{
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        Monthly
                      </div>
                      <div style={{
                        color: '#3b82f6',
                        fontSize: '0.8125rem',
                        fontWeight: '700'
                      }}>
                        ${selectedPlan.priceMonthly}/mo
                      </div>
                    </div>
                  </label>

                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: form.pricingOption === 'yearly' ? 'rgba(59, 130, 246, 0.15)' : '#0d1b2a',
                    border: form.pricingOption === 'yearly' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (form.pricingOption !== 'yearly') {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (form.pricingOption !== 'yearly') {
                      e.currentTarget.style.background = '#0d1b2a';
                    }
                  }}
                  >
                    <input
                      type="radio"
                      name="pricingOption"
                      value="yearly"
                      checked={form.pricingOption === 'yearly'}
                      onChange={onChange}
                      style={{margin: 0}}
                    />
                    <div>
                      <div style={{
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        Yearly
                      </div>
                      <div style={{
                        color: '#3b82f6',
                        fontSize: '0.8125rem',
                        fontWeight: '700'
                      }}>
                        ${selectedPlan.priceYearly}/yr
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ) : !selectedPlan ? (
              // Show budget dropdown for custom quotes
              <div>
                <label style={{
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#f1f5f9',
                  fontWeight: '600',
                  fontSize: '0.9375rem'
                }}>
                  Estimated budget
                </label>
                <div style={{position: 'relative'}}>
                  <select 
                    name="budget" 
                    value={form.budget} 
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 1rem',
                      background: '#0d1b2a',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '0.5rem',
                      color: form.budget ? '#e2e8f0' : '#64748b',
                      fontSize: '0.9375rem',
                      appearance: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      e.target.style.background = '#0f1e2f';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.background = '#0d1b2a';
                    }}
                  >
                    {budgetOptions.map(opt => (
                      <option key={opt.value} value={opt.value} style={{background: '#0a1929', color: opt.value ? '#e2e8f0' : '#64748b'}}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#64748b'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 9L1 3h10L6 9z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Additional Details */}
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#f1f5f9',
              fontWeight: '600',
              fontSize: '0.9375rem'
            }}>
              Additional details
            </label>
            <textarea 
              rows="5" 
              name="message" 
              value={form.message} 
              onChange={onChange}
              placeholder="Tell us about your specific requirements, timeline, or any questions..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0d1b2a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.2s',
                minHeight: '120px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.target.style.background = '#0f1e2f';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.target.style.background = '#0d1b2a';
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'flex-end'}}>
            <button 
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.5rem',
                color: '#cbd5e1',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '0.75rem 1.75rem',
                background: loading ? '#1e40af' : '#2563eb',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = '#2563eb';
                }
              }}
            >
              {loading ? 'Sending…' : 'Request Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}