import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ProductAPI, getFileUrl } from '../lib/api';
import { 
  Search, Package, ExternalLink, ArrowRight, Star, Sparkles, 
  Zap, MessageSquare, Phone, Trophy, Cpu, Check, Share2, BarChart2, Target, X, Users, Activity
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
    features: [
      'Voice & WhatsApp Content Engine', 
      'Native AI Post Scheduler', 
      'Live Engagement Telemetry', 
      'Auto-Reply AI Algorithms', 
      'Multi-Account Social Database', 
      'Zero App Installation Required'
    ],
    techStack: ['React', 'Node.js', 'OpenAI', 'MongoDB'],
    trustBadge: 'Meta & LinkedIn API Verified • 10M+ Auto Posts Scheduled',
    metrics: [
      { label: 'Auto Posts', val: '10M+' },
      { label: 'Uptime', val: '99.9%' },
      { label: 'Rating', val: '4.9 ★' }
    ],
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
    features: [
      'Instant CRO Score & Bottleneck Report', 
      'Heatmap & Click Tracking Engine', 
      'A/B Testing Funnel Templates', 
      'Real-Time Traffic Telemetry', 
      'Conversion Rate Analytics', 
      'Zero Setup Delay'
    ],
    techStack: ['React', 'Tailwind', 'Node.js', 'PostgreSQL'],
    trustBadge: 'ISO 27001 Certified • 3.2x Average Conversion Rate Lift',
    metrics: [
      { label: 'Conversion Lift', val: '3.2x' },
      { label: 'Audits Run', val: '100k+' },
      { label: 'Rating', val: '5.0 ★' }
    ],
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
    features: [
      'Real-time SMTP Email Verification', 
      'Industry & Location Lead Filters', 
      'Automated Lead Scoring System', 
      'API Webhook Integration', 
      'High Deliverability SLA', 
      'CSV Export Engine'
    ],
    techStack: ['Node.js', 'Express', 'Python', 'Tailwind'],
    trustBadge: '99.4% Verification Accuracy • Anti-Spam Compliance SLA',
    metrics: [
      { label: 'Accuracy', val: '99.4%' },
      { label: 'Verified Leads', val: '50M+' },
      { label: 'Rating', val: '4.8 ★' }
    ],
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewsCount: 19,
  }
];

// Helper to get distinct icons & theme colors for each product
function getProductIconConfig(product) {
  const title = (product.title || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();

  if (title.includes('social') || cat.includes('ai')) {
    return {
      icon: <Share2 size={28} className="text-blue-400" />,
      bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    };
  }
  if (title.includes('cro') || title.includes('audit') || cat.includes('saas')) {
    return {
      icon: <BarChart2 size={28} className="text-emerald-400" />,
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    };
  }
  if (title.includes('lead') || cat.includes('automation')) {
    return {
      icon: <Target size={28} className="text-amber-400" />,
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    };
  }
  return {
    icon: <Package size={28} className="text-blue-400" />,
    bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  };
}

// Helper to get distinct trust badge text
function getTrustBadgeText(product) {
  if (product.trustBadge) return product.trustBadge;

  const title = (product.title || '').toLowerCase();
  if (title.includes('social')) return 'Meta & LinkedIn API Verified • 10M+ Auto Posts Scheduled';
  if (title.includes('cro') || title.includes('audit')) return 'ISO 27001 Certified • 3.2x Average Conversion Rate Lift';
  if (title.includes('lead')) return '99.4% SMTP Verification Accuracy • Anti-Spam Compliance SLA';

  return 'Verified Enterprise Infrastructure & 99.9% High Uptime SLA';
}

// Helper to get product metrics pills
function getProductMetrics(product) {
  if (Array.isArray(product.metrics) && product.metrics.length > 0) return product.metrics;

  const title = (product.title || '').toLowerCase();
  if (title.includes('social')) {
    return [
      { label: 'Auto Posts', val: '10M+' },
      { label: 'Uptime', val: '99.9%' },
      { label: 'Rating', val: `${product.rating || 4.9} ★` }
    ];
  }
  if (title.includes('cro')) {
    return [
      { label: 'Conversion Lift', val: '3.2x' },
      { label: 'Audits Run', val: '100k+' },
      { label: 'Rating', val: `${product.rating || 5.0} ★` }
    ];
  }
  return [
    { label: 'Accuracy', val: '99.4%' },
    { label: 'Verified Contacts', val: '50M+' },
    { label: 'Rating', val: `${product.rating || 4.8} ★` }
  ];
}

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

  // Category Filter Pills with Item Counts
  const categoriesWithCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
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
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3b5fe2] hover:bg-blue-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg transition-all shadow-md"
              >
                Search
              </button>
            </div>

          </div>
        </section>

        {/* ─── SEPARATED DETAILED PRODUCTS SHOWCASE LIST ─── */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 space-y-16 py-6">

          {/* Filter Pills Bar with Counts */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2">
                CATEGORIES:
              </span>
              {categoriesWithCounts.map(({ name, count }) => {
                const active = activeCategory === name;
                return (
                  <button 
                    key={name} 
                    onClick={() => setActiveCategory(name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      active 
                        ? 'bg-[#3b5fe2] text-white border border-blue-400/50 shadow-md' 
                        : 'bg-[#162a4a] border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {name} <span className="opacity-75 font-normal ml-1">({count})</span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {products.length} products
            </span>
          </div>

          {loading && (
            <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-3xl">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading product showcase...</p>
            </div>
          )}

          {/* Search Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-12 text-center my-8">
              <Package size={48} className="mx-auto text-slate-500 mb-3" />
              <h3 className="text-xl font-extrabold text-white mb-2">No Products Found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                We couldn't find any products matching <span className="text-white font-bold">"{q}"</span> under category <span className="text-white font-bold">"{activeCategory}"</span>.
              </p>
              <button
                onClick={() => { setQ(''); setActiveCategory('All'); }}
                className="bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Clear Search & Reset Filters
              </button>
            </div>
          )}

          {/* Products List - Full OmniSolve AI Card Layout */}
          {!loading && filtered.length > 0 && filtered.map((prod, index) => {
            const iconConfig = getProductIconConfig(prod);
            const trustText = getTrustBadgeText(prod);
            const metricsPills = getProductMetrics(prod);

            const featuresList = (Array.isArray(prod.features) && prod.features.length > 0)
              ? prod.features
              : ['Voice & WhatsApp Content Engine', 'Native AI Post Scheduler', 'Live Engagement Telemetry', 'Auto-Reply AI Algorithms'];

            const waLink = `https://wa.me/923000000000?text=${whatsappMessage(prod.title)}`;

            return (
              <div key={prod._id || index} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Card: Showcase Box (Fixed Empty Space Issue & Distinct Icons & Prominent Buttons) */}
                <div className="lg:col-span-5 bg-[#0f223f] border border-slate-700/60 text-white rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between items-center text-center relative">
                  <div className="w-full flex flex-col items-center">
                    
                    {/* Distinct Product Icon Container */}
                    <div className={`w-24 h-24 rounded-3xl ${iconConfig.bg} border flex items-center justify-center mb-5 shadow-inner`}>
                      {prod.image ? (
                        <img src={getFileUrl(prod.image)} alt={prod.title} className="w-14 h-14 object-contain" />
                      ) : (
                        iconConfig.icon
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-white mb-2">
                      {prod.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xs mb-6">
                      {prod.tagline || prod.description}
                    </p>

                    {/* Micro Stats Row (Fixes Empty Space Issue!) */}
                    <div className="w-full grid grid-cols-3 gap-2 bg-[#162a4a] border border-slate-700/60 p-3 rounded-2xl mb-6">
                      {metricsPills.map((m, mi) => (
                        <div key={mi} className="text-center">
                          <div className="text-xs font-black text-white">{m.val}</div>
                          <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prominent High-Contrast Buttons Inside Left Card */}
                  <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 mt-auto">
                    {prod.demoUrl ? (
                      <a
                        href={prod.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1e293b] hover:bg-slate-700 text-white transition-all font-extrabold text-[11px] border border-slate-600/80 shadow-sm"
                      >
                        <ExternalLink size={16} className="text-blue-400 mb-1" />
                        <span>LIVE DEMO</span>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1e293b] text-white font-extrabold text-[11px] border border-slate-600/80">
                        <Phone size={16} className="text-blue-400 mb-1" />
                        <span>VOICE LINE</span>
                      </div>
                    )}

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c2e1f] hover:bg-[#12422c] text-emerald-400 transition-all font-extrabold text-[11px] border border-emerald-500/50 shadow-sm"
                    >
                      <MessageSquare size={16} className="text-[#25D366] mb-1" />
                      <span>WHATSAPP API</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Detailed Title, Description, Highlighted Features & Unique Trust Badge */}
                <div className="lg:col-span-7 bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 md:p-10 flex flex-col justify-between shadow-2xl">
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

                    {/* 2-Column Checkmark Grid (With Visual Hierarchy for Top Features!) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {featuresList.slice(0, 6).map((feat, i) => {
                        const isHighlighted = i < 2; // Top 2 features highlighted
                        return (
                          <div 
                            key={i} 
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
                              isHighlighted
                                ? 'bg-[#3b5fe2]/15 border-blue-500/40 text-white font-extrabold shadow-sm'
                                : 'bg-[#172b49] border-slate-700/50 text-slate-200 font-semibold'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isHighlighted ? 'bg-blue-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="text-xs truncate">{feat}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Distinct Trust Signal Callout Box (Fixed Generic Badge Issue!) */}
                    <div className="bg-[#162a4a] border border-slate-700/80 rounded-2xl p-4 flex items-start gap-3 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-0.5">
                          TRUST & ENTERPRISE SLA
                        </div>
                        <div className="text-xs font-bold text-white">
                          {trustText}
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

          {/* ─── SECTION: R&D LAB CLASSIFIED TEASER (Fixed CTA Text!) ─── */}
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
              Get Early Access & Classified Intel <ArrowRight size={14} />
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
