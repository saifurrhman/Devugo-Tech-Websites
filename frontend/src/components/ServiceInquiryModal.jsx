import React, { useEffect, useRef, useState } from 'react';
import { ContactAPI } from '../lib/api';

export default function ServiceInquiryModal({ open, onClose, service }){
  const dialogRef = useRef(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    projectType: '', 
    budget: '',
    additionalDetails: '' 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const budgetOptions = [
    { value: '', label: 'Select budget range' },
    { value: '$1k – $3k', label: '$1k – $3k' },
    { value: '$3k – $7k', label: '$3k – $7k' },
    { value: '$7k – $15k', label: '$7k – $15k' },
    { value: '$15k – $30k', label: '$15k – $30k' },
    { value: '$30k – $50k', label: '$30k – $50k' },
    { value: '$50k+', label: '$50k+' }
  ];

  useEffect(() => {
    function onKey(e){ if(e.key === 'Escape') onClose?.(); }
    if (open){
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [open, onClose]);

  useEffect(() => {
    if(open){
      setTimeout(()=> dialogRef.current?.focus(), 0);
      setSuccess(false);
      // Reset form when modal opens
      if (!service) {
        setForm({ 
          name: '', 
          email: '', 
          projectType: '', 
          budget: '',
          additionalDetails: '' 
        });
      }
    }
  }, [open, service]);

  useEffect(() => {
    if (service && open){
      // Immediately set the project type when modal opens
      setForm(f => ({ 
        ...f, 
        projectType: service.title || ''
      }));
    }
  }, [service, open]);

  function onChange(e){
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e){
    e.preventDefault();
    try{
      setLoading(true);
      
      const message = `
Custom Quote Request

Service: ${service?.title || 'N/A'}
Project Type: ${form.projectType}
Estimated Budget: ${form.budget}

Additional Details:
${form.additionalDetails}
      `.trim();

      const payload = { 
        name: form.name,
        email: form.email,
        phone: '',
        message: message,
        source: 'Service Custom Quote',
        projectType: form.projectType,
        budget: form.budget
      };
      
      await ContactAPI.create(payload);
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        onClose?.();
        setForm({ 
          name: '', 
          email: '', 
          projectType: '', 
          budget: '',
          additionalDetails: '' 
        });
        setSuccess(false);
      }, 2000);
      
    }catch(err){
      setLoading(false);
      alert(err.message || 'Failed to submit. Please try again.');
    }
  }

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e)=>{ if(e.target === e.currentTarget) onClose?.(); }}
    >
      <div 
        className="relative w-full max-w-[800px] max-h-[90vh] overflow-auto bg-[#1a2332] rounded-2xl shadow-2xl animate-slideUp"
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="inq-title" 
        tabIndex={-1} 
        ref={dialogRef}
      >
        <header className="px-8 py-6 border-b border-slate-700/50 flex items-center justify-between">
          <h3 
            id="inq-title"
            className="text-2xl font-bold text-white"
          >
            Custom Quote
          </h3>
          <button 
            onClick={onClose} 
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-3xl font-light leading-none"
          >
            ×
          </button>
        </header>

        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scaleIn">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Request Sent!
            </h3>
            <p className="text-slate-400">
              We'll get back to you within 1 business day.
            </p>
          </div>
        ) : (
          <form 
            onSubmit={onSubmit}
            className="px-8 py-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  Name
                </label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={onChange} 
                  placeholder="Your name" 
                  required 
                  className="w-full px-4 py-3 bg-[#0f1621] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  Email
                </label>
                <input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={onChange} 
                  placeholder="Email address" 
                  required 
                  className="w-full px-4 py-3 bg-[#0f1621] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  Project type
                </label>
                <input 
                  name="projectType" 
                  value={form.projectType} 
                  onChange={onChange} 
                  placeholder={service ? service.title : "e.g., Custom Web Application"}
                  required 
                  className="w-full px-4 py-3 bg-[#0f1621] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {service && (
                  <p className="mt-1 text-xs text-slate-400">
                    Selected service: {service.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  Estimated budget
                </label>
                <div className="relative">
                  <select 
                    name="budget" 
                    value={form.budget} 
                    onChange={onChange} 
                    required
                    className="w-full px-4 py-3 bg-[#0f1621] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer pr-10"
                  >
                    {budgetOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0f1621]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                      <path d="M6 8L0 0h12L6 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-white">
                Additional details
              </label>
              <textarea 
                name="additionalDetails" 
                rows="4" 
                value={form.additionalDetails} 
                onChange={onChange} 
                placeholder="Tell us about your specific requirements, timeline, or any questions..." 
                required 
                className="w-full px-4 py-3 bg-[#0f1621] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-vertical"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-transparent border border-slate-600 text-slate-300 rounded-lg font-semibold hover:bg-slate-800 hover:border-slate-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    </svg>
                    Sending...
                  </>
                ) : 'Request Quote'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}