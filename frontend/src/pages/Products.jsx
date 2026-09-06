import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ProductAPI, getFileUrl } from '../lib/api';
import { 
  Search, Package, ExternalLink, ArrowRight, CheckCircle2, Star, Sparkles, 
  Zap, MessageSquare, Phone, Trophy, Cpu, Check
} from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    _id: 'sample-p1',
    title: 'Devugo AI Social Suite',
    slug: 'devugo-ai-social-suite',
    category: 'AI Solution',
    price: 49,
    originalPrice: 99,
    currency: 'USD',
    badge: 'PROPRIETARY ECOSYSTEM',
    tagline: 'AI-powered social media management & automated posting platform.',
    description: 'A complete SaaS web app for scheduling, AI content creation, auto-replying, and multi-platform social media analytics.',
    features: ['Voice & WhatsApp Access', 'Native AI Content Engine', 'Live Engagement Telemetry', 'Auto-Reply Algorithms', 'Multi-Platform Database', 'Zero App Installation Required'],
    techStack: ['React', 'Node.js', 'OpenAI', 'MongoDB'],
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewsCount: 28,
  },
  {
    _id: 'sample-p2',
    title: 'CRO Audit & Funnel Builder',
    slug: 'cro-audit-funnel-builder',
    category: 'SaaS',
    price: 99,
    originalPrice: 199,
    currency: 'USD',
    badge: 'LIVE PRODUCT DEPLOYMENT',
    tagline: 'Conversion rate optimization suite for e-commerce & high-ticket landing pages.',
    description: 'Analyze landing pages, run automated CRO audits, and deploy high-converting sales funnels in minutes.',
    features: ['Instant CRO Score & Bottleneck Report', 'Heatmap & Click Tracking', 'A/B Testing Funnel Templates', 'Real-Time Telemetry', 'Conversion Rate Analytics', 'Zero Setup Delay'],
    techStack: ['React', 'Tailwind', 'Node.js', 'PostgreSQL'],
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
    isFeatured: true,
    isActive: true,
    rating: 5.0,
    reviewsCount: 42,
  },
  {
    _id: 'sample-p3',
    title: 'Smart Leads & B2B Engine',
    slug: 'smart-leads-engine',
    category: 'Automation',
    price: 29,
    originalPrice: 59,
    currency: 'USD',
    badge: 'ENTERPRISE SOLUTION',
    tagline: 'B2B lead generation & email verification automation web app.',
    description: 'Find verified corporate contacts, validate deliverability in real-time, and export structured CSV lead lists.',
    features: ['Real-time SMTP Email Verification', 'Industry & Location Lead Filters', 'Automated Lead Scoring System', 'API Webhook Integration', 'High Deliverability SLA', 'CSV Export Engine'],
    techStack: ['Node.js', 'Express', 'Python', 'Tailwind'],
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewsCount: 19,
  }
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    ProductAPI.list()
      .then(res => {
        const fetched = Array.isArray(res?.items) ? res.items.filter(p => p.isActive !== false) : [];
        setProducts(fetched.length > 0 ? fetched : DEFAULT_PRODUCTS);
      })
      .catch(() => {
        setProducts(DEFAULT_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let result = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);
    const search = q.trim().toLowerCase();
    if (search) {
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(search) ||
        (p.tagline || '').toLowerCase().includes(search) ||
        (p.category || '').toLowerCase().includes(search)
      );
    }
    return result;
  }, [products, activeCategory, q]);

  const whatsappMessage = (title) => encodeURIComponent(`Hello Devugo Tech! I would like to inquire about ${title || 'your products'}.`);

  return (
    <>
      <SEO
        title="Digital Products & Software Ecosystem | Devugo Tech"
        description="Explore our core technology stack and proprietary digital products built for scale."
        url="/products"
      />
      <Navbar />

      <div className="bg-[#061c39] text-white min-h-screen pt-28 pb-20 selection:bg-blue-600 selection:text-white">

        {/* ─── HERO HEADER SECTION ─── */}
        <section className="relative overflow-hidden pt-6 pb-12 text-center px-4 flex flex-col items-center justify-center">
          <div className="relative max-w-4xl w-full mx-auto z-10 flex flex-col items-center text-center">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-[#0c2436] mb-6 shadow-md mx-auto">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[11px] font-extrabold text-blue-400 tracking-wider uppercase">
                PROPRIETARY ECOSYSTEM
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight text-center">
              Our Core <br />
              <span className="text-[#4f8ef7]">
                Technologies.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed text-center">
              Intelligent products built by Devugo Tech — engineering global software solutions.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-lg mx-auto">
              <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)}
                placeholder="Search products, AI tools, SaaS apps..."
                className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-[#0f223f] border border-slate-700/60 text-white placeholder-slate-400 text-sm outline-none focus:border-blue-500 transition-all shadow-xl"
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3b5fe2] hover:bg-blue-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg transition-all shadow-md"
              >
                Search
              </button>
            </div>

          </div>
        </section>

        {/* ─── SEPARATED DETAILED PRODUCTS SHOWCASE LIST (OmniSolve Layout) ─── */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 space-y-16 py-6">

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2">
                CATEGORIES:
              </span>
              {categories.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      active 
                        ? 'bg-[#3b5fe2] text-white border border-blue-400/50' 
                        : 'bg-[#162a4a] border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} products
            </span>
          </div>

          {loading && (
            <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-3xl">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading product showcase...</p>
            </div>
          )}

          {/* Products List - Full OmniSolve AI Card Layout for Every Product */}
          {!loading && filtered.length > 0 && filtered.map((prod, index) => {
            const featuresList = (Array.isArray(prod.features) && prod.features.length > 0)
              ? prod.features
              : ['Voice & WhatsApp Access', 'Native Urdu Processing', 'Live Weather Telemetry', 'Pest Control Algorithms', 'Market Price Database', 'Zero App Installation'];

            const waLink = `https://wa.me/923000000000?text=${whatsappMessage(prod.title)}`;

            return (
              <div key={prod._id || index} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Card: White/Light Card with Product Icon & Quick Actions */}
                <div className="lg:col-span-5 bg-[#ffffff] text-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col justify-between items-center text-center relative border border-slate-200">
                  <div className="w-full flex flex-col items-center">
                    
                    {/* Icon Box */}
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5 shadow-inner">
                      {prod.image ? (
                        <img src={getFileUrl(prod.image)} alt={prod.title} className="w-14 h-14 object-contain" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                          <Zap size={28} />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                      {prod.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-xs mb-6">
                      {prod.tagline || prod.description}
                    </p>
                  </div>

                  {/* Dual Action Buttons Inside Card */}
                  <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 mt-auto">
                    {prod.demoUrl ? (
                      <a
                        href={prod.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all font-bold text-[11px]"
                      >
                        <ExternalLink size={16} className="text-slate-700 mb-1" />
                        <span>LIVE DEMO</span>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 text-slate-800 font-bold text-[11px]">
                        <Phone size={16} className="text-slate-700 mb-1" />
                        <span>VOICE LINE</span>
                      </div>
                    )}

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all font-bold text-[11px] border border-emerald-200"
                    >
                      <MessageSquare size={16} className="text-[#25D366] mb-1" />
                      <span>WHATSAPP API</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Detailed Title, Description, Checkmark Grid & Actions */}
                <div className="lg:col-span-7 bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8 md:p-10 flex flex-col justify-between shadow-2xl">
                  <div>
                    {/* Green Deployment Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {prod.badge || 'LIVE PRODUCT DEPLOYMENT'}
                    </div>

                    {/* Headline */}
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-snug">
                      {prod.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
                      {prod.description || prod.tagline}
                    </p>

                    {/* 2-Column Checkmark Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {featuresList.slice(0, 6).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-[#172b49] px-3.5 py-2.5 rounded-xl border border-slate-700/50">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-bold text-slate-200 truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Strategic Partnership Callout Box */}
                    <div className="bg-[#162a4a] border border-slate-700/80 rounded-2xl p-4 flex items-start gap-3 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-0.5">
                          STRATEGIC ARCHITECTURE PARTNERS
                        </div>
                        <div className="text-xs font-bold text-white">
                          Verified Enterprise Infrastructure & High Reliability SLA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-800">
                    <Link
                      to={`/products/${prod.slug || prod._id}`}
                      className="inline-flex items-center justify-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all"
                    >
                      Request Engineering Demo <ArrowRight size={14} />
                    </Link>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all"
                    >
                      <MessageSquare size={14} /> Connect on WhatsApp
                    </a>
                  </div>

                </div>

              </div>
            );
          })}

          {/* ─── SECTION: R&D LAB CLASSIFIED TEASER ─── */}
          <div className="bg-[#0b182b] border border-slate-700/60 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden my-12">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Cpu size={24} />
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              R&D Lab: <span className="text-slate-400">Classified</span>
            </h3>

            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed mb-6">
              Our engineering team is currently architecting the next generation of enterprise AI software. Synchronize with our comms channel to receive classified release intel.
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#1c2e4a] hover:bg-slate-700 border border-slate-600 text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all"
            >
              Establish Partnership Link <ArrowRight size={14} />
            </Link>
          </div>

          {/* ─── SECTION: BOTTOM CTA BANNER ─── */}
          <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Ready to Transform Your Business with AI & Tech?
            </h3>

            <div className="flex items-center justify-center gap-3 flex-wrap text-[11px] font-bold text-slate-300 mb-8">
              <span className="px-3 py-1 rounded-full bg-[#182c49] border border-slate-700/60">• Free Consultation</span>
              <span className="px-3 py-1 rounded-full bg-[#182c49] border border-slate-700/60">• Custom Solutions</span>
              <span className="px-3 py-1 rounded-full bg-[#182c49] border border-slate-700/60">• Proven Results</span>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              Book Consultation <ArrowRight size={18} />
            </Link>
          </div>

        </section>

      </div>

      <Footer />
    </>
  );
}
