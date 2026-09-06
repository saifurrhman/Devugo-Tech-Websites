import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ProductAPI, getFileUrl } from '../lib/api';
import { Search, Package, ExternalLink, ArrowRight, CheckCircle2, Star, Sparkles, Code2, Zap } from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    _id: 'sample-p1',
    title: 'Devugo AI Social Suite',
    slug: 'devugo-ai-social-suite',
    category: 'AI Solution',
    price: 49,
    originalPrice: 99,
    currency: 'USD',
    badge: 'Popular',
    tagline: 'AI-powered social media management & automated posting platform.',
    description: 'A complete SaaS web app for scheduling, AI content creation, auto-replying, and multi-platform social media analytics.',
    features: ['AI Copywriting & Image Generation', 'Multi-Account Scheduling (LinkedIn, Twitter, FB)', 'Real-time Engagement Analytics'],
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
    badge: 'Featured',
    tagline: 'Conversion rate optimization suite for e-commerce & high-ticket landing pages.',
    description: 'Analyze landing pages, run automated CRO audits, and deploy high-converting sales funnels in minutes.',
    features: ['Instant CRO Score & Bottleneck Report', 'Heatmap & Click Tracking Integration', 'A/B Testing Funnel Templates'],
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
    badge: 'New',
    tagline: 'B2B lead generation & email verification automation web app.',
    description: 'Find verified corporate contacts, validate deliverability in real-time, and export structured CSV lead lists.',
    features: ['Real-time SMTP Email Verification', 'Industry & Location Lead Filters', 'Automated Lead Scoring System'],
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

  return (
    <>
      <SEO
        title="Digital Products & Software Solutions | Devugo Tech"
        description="Explore our suite of ready-to-deploy digital products, SaaS tools, AI applications, and enterprise software solutions."
        url="/products"
      />
      <Navbar />

      <div className="bg-[#061c39] text-white min-h-screen pt-28 pb-16">

        {/* ─── HERO SECTION ─── */}
        <section className="relative overflow-hidden pt-8 pb-12 text-center px-4 flex flex-col items-center justify-center">
          <div className="relative max-w-4xl w-full mx-auto z-10 flex flex-col items-center text-center">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-[#0f2444] mb-6 shadow-md mx-auto">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[11px] font-extrabold text-blue-400 tracking-wider uppercase">
                • Ready-To-Deploy Digital Products
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight text-center">
              Next-Gen Software &<br />
              <span className="text-[#4f8ef7]">
                Digital Products
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed font-normal text-center">
              Explore our suite of production-ready SaaS tools, AI applications, automation systems, and high-performance digital products.
            </p>

            {/* Stat Cards Row */}
            <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap w-full max-w-2xl mx-auto mb-8">
              <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl py-4 px-6 sm:px-8 flex-1 min-w-[140px] text-center shadow-lg hover:border-blue-500/40 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white">
                  {products.length}
                </div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                  Active Products
                </div>
              </div>
              <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl py-4 px-6 sm:px-8 flex-1 min-w-[140px] text-center shadow-lg hover:border-blue-500/40 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white">
                  99.9%
                </div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                  Uptime Guarantee
                </div>
              </div>
              <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl py-4 px-6 sm:px-8 flex-1 min-w-[140px] text-center shadow-lg hover:border-blue-500/40 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white">
                  24/7
                </div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                  Expert Support
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full max-w-lg mx-auto">
              <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)}
                placeholder="Search products, tools, SaaS apps..."
                className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-[#0f223f] border border-slate-700/60 text-white placeholder-slate-400 text-sm md:text-base outline-none focus:border-blue-500 transition-all shadow-xl"
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3b5fe2] hover:bg-blue-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg transition-all shadow-md"
              >
                Search
              </button>
            </div>

          </div>
        </section>

        {/* ─── CATALOG SECTION ─── */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          
          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 px-1">
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
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      active 
                        ? 'bg-[#3b5fe2] text-white border border-blue-400/50 shadow-blue-600/30' 
                        : 'bg-[#1c2333] border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {products.length} products
            </span>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading products catalog...</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered.map(product => (
                <div
                  key={product._id}
                  className="bg-[#0f223f] border border-slate-700/60 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div>
                    {/* Thumbnail Header */}
                    <div className="relative h-48 bg-[#1a2942] overflow-hidden flex items-center justify-center border-b border-slate-700/60">
                      {product.image ? (
                        <img
                          src={getFileUrl(product.image)}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#1e2536] border border-slate-700/60 flex items-center justify-center shadow-inner">
                          <Package size={32} className="text-blue-400" />
                        </div>
                      )}

                      {/* Badge Tag */}
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-[#3b5fe2] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                          {product.badge}
                        </span>
                      )}

                      {/* Category Pill */}
                      <span className="absolute top-3 right-3 bg-[#09121f]/90 backdrop-blur-md text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700/60">
                        {product.category || 'SaaS'}
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                          {product.title}
                        </h3>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
                            <Star size={14} fill="currentColor" />
                            <span>{product.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed mb-4 line-clamp-2">
                        {product.tagline || product.description}
                      </p>

                      {/* Key Features Bullet List */}
                      {Array.isArray(product.features) && product.features.length > 0 && (
                        <div className="space-y-2 mb-5">
                          {product.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tech Stack Badges */}
                      {Array.isArray(product.techStack) && product.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5 pt-3 border-t border-slate-800">
                          {product.techStack.slice(0, 4).map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-md bg-[#1e2536] border border-slate-700/60 text-[11px] font-semibold text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Price & CTA */}
                  <div className="p-6 pt-0 border-t border-slate-800/80 mt-auto flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Pricing</div>
                      <div className="flex items-baseline gap-1.5">
                        {product.price > 0 ? (
                          <>
                            <span className="text-2xl font-black text-white">${product.price}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-slate-500 line-through text-xs">${product.originalPrice}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-lg font-black text-blue-400">Free / Custom</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {product.demoUrl && (
                        <a
                          href={product.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                          title="Live Demo"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <Link
                        to={`/products/${product.slug || product._id}`}
                        className="inline-flex items-center gap-1.5 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA Banner */}
          {!loading && (
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-16 relative overflow-hidden">
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  Need a Custom Product or SaaS App?
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                  We build custom software, AI automation systems, and SaaS platforms tailored to your business specs.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Get In Touch <ArrowRight size={18} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          )}

        </section>

      </div>

      <Footer />
    </>
  );
}
