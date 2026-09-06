import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ProductAPI, getFileUrl } from '../lib/api';
import { 
  ArrowLeft, CheckCircle2, ExternalLink, Star, Package, Sparkles, Shield, Zap, 
  MessageSquare, Phone, Trophy, Cpu, ArrowRight, Check
} from 'lucide-react';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ProductAPI.get(slug)
      .then(res => {
        setProduct(res?.item || null);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const defaultFeatures = [
    'Voice & WhatsApp Access',
    'Native Urdu Processing',
    'Live Weather Telemetry',
    'Pest Control Algorithms',
    'Market Price Database',
    'Zero App Installation Required'
  ];

  const displayFeatures = (Array.isArray(product?.features) && product.features.length > 0)
    ? product.features
    : defaultFeatures;

  const whatsappMessage = encodeURIComponent(`Hello Devugo Tech! I am interested in details regarding ${product?.title || 'your product'}.`);
  const whatsappUrl = `https://wa.me/923000000000?text=${whatsappMessage}`;

  return (
    <>
      <SEO
        title={product ? `${product.title} | Devugo Products` : 'Product Details | Devugo Tech'}
        description={product?.tagline || product?.description || 'Explore product features, architecture, and live demo.'}
        url={`/products/${slug}`}
      />
      <Navbar />

      <div className="bg-[#061c39] text-white min-h-screen pt-28 pb-20 selection:bg-blue-600 selection:text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-300 hover:text-white transition-colors bg-[#0f223f] border border-slate-700/60 px-4 py-2 rounded-full"
            >
              <ArrowLeft size={16} /> Back to Products Catalog
            </Link>

            {product && (
              <span className="text-xs font-bold text-slate-400">
                Category: <span className="text-blue-400">{product.category || 'SaaS & AI'}</span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-24 bg-[#0f223f] border border-slate-700/60 rounded-3xl">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">Loading product architecture details...</p>
            </div>
          ) : !product ? (
            <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8">
              <Package size={56} className="mx-auto text-slate-600 mb-4" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Product Not Found</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                The requested product page does not exist or may have been updated.
              </p>
              <Link to="/products" className="bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2">
                Explore All Products <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              
              {/* ─── SECTION 1: TOP BADGE & PRODUCT SHOWCASE HERO ─── */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-[#0c2436]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-emerald-400 tracking-wider uppercase">
                    {product.badge || 'PROPRIETARY ECOSYSTEM'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  {product.title}
                </h1>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {product.tagline || 'Intelligent production-ready software built by Devugo Tech — engineering global digital solutions.'}
                </p>
              </div>

              {/* ─── SECTION 2: SEPARATED DETAILED PRODUCT SHOWCASE CARD (Dark Navy Theme) ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Card: Dark Navy Showcase Box */}
                <div className="lg:col-span-5 bg-[#0f223f] border border-slate-700/60 text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden">
                  <div className="w-full flex flex-col items-center">
                    
                    {/* Rounded Green/Blue Icon Box */}
                    <div className="w-28 h-28 rounded-3xl bg-[#162a4a] border border-emerald-500/30 flex items-center justify-center mb-6 shadow-inner">
                      {product.image ? (
                        <img src={getFileUrl(product.image)} alt={product.title} className="w-16 h-16 object-contain" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                          <Zap size={32} />
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <h2 className="text-2xl font-black text-white mb-2">
                      {product.title}
                    </h2>

                    {/* Short Tagline / Voice Description */}
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xs mb-8">
                      {product.tagline || 'Voice-first intelligence & automated ecosystem. No complex apps needed.'}
                    </p>

                    {/* Media Gallery / Preview image if available */}
                    {Array.isArray(product.gallery) && product.gallery.length > 0 && (
                      <div className="w-full grid grid-cols-2 gap-2 mb-6">
                        {product.gallery.slice(0, 2).map((img, i) => (
                          <img key={i} src={getFileUrl(img)} alt="Product preview" className="w-full h-24 object-cover rounded-xl border border-slate-700/60" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons Inside Left Card */}
                  <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-slate-800 mt-auto">
                    {product.demoUrl ? (
                      <a
                        href={product.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1e2536] hover:bg-slate-700 text-white transition-all font-bold text-[11px] border border-slate-700/60"
                      >
                        <ExternalLink size={18} className="text-blue-400 mb-1" />
                        <span>LIVE DEMO</span>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1e2536] text-white font-bold text-[11px] border border-slate-700/60">
                        <Phone size={18} className="text-blue-400 mb-1" />
                        <span>VOICE LINE</span>
                      </div>
                    )}

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c2436] hover:bg-[#123048] text-emerald-400 transition-all font-bold text-[11px] border border-emerald-500/40"
                    >
                      <MessageSquare size={18} className="text-[#25D366] mb-1" />
                      <span>WHATSAPP API</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Detailed Features & Specs */}
                <div className="lg:col-span-7 bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8 md:p-10 flex flex-col justify-between shadow-2xl">
                  <div>
                    {/* Live Deployment Status Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      LIVE PRODUCT DEPLOYMENT
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-snug">
                      {product.title} Architecture & Details
                    </h2>

                    {/* Description Paragraph */}
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                      {product.description || product.tagline || 'Deployed enterprise solution built for seamless digital integration, high deliverability, and real-time operational telemetry.'}
                    </p>

                    {/* 2-Column Feature Checkmark Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                      {displayFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-[#172b49] px-3.5 py-2.5 rounded-xl border border-slate-700/50">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-bold text-slate-200 truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Strategic Architecture Partners Callout Box */}
                    <div className="bg-[#162a4a] border border-slate-700/80 rounded-2xl p-4 md:p-5 flex items-start gap-4 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-0.5">
                          STRATEGIC ARCHITECTURE GUARANTEE
                        </div>
                        <div className="text-xs md:text-sm font-bold text-white">
                          Enterprise-Grade Security & High Uptime SLA (99.9%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-800">
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
                    >
                      Request Engineering Demo <ArrowRight size={16} />
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
                    >
                      <MessageSquare size={16} /> Connect on WhatsApp
                    </a>
                  </div>

                </div>

              </div>

              {/* ─── SECTION 3: TECH STACK & SPECIFICATIONS ─── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tech Stack Box */}
                <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                    <Zap size={18} /> Technologies Stack
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Array.isArray(product.techStack) && product.techStack.length > 0 ? (
                      product.techStack.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-[#1a2e4c] border border-slate-700/60 text-xs font-bold text-blue-300">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-lg bg-[#1a2e4c] border border-slate-700/60 text-xs font-bold text-blue-300">React</span>
                        <span className="px-3 py-1 rounded-lg bg-[#1a2e4c] border border-slate-700/60 text-xs font-bold text-blue-300">Node.js</span>
                        <span className="px-3 py-1 rounded-lg bg-[#1a2e4c] border border-slate-700/60 text-xs font-bold text-blue-300">MongoDB</span>
                        <span className="px-3 py-1 rounded-lg bg-[#1a2e4c] border border-slate-700/60 text-xs font-bold text-blue-300">Python AI</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                    <Star size={18} /> Performance Rating
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-black text-white">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 5.0 Enterprise Benchmark</span>
                  </div>
                </div>

                {/* Pricing & License */}
                <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm uppercase tracking-wider">
                    <Shield size={18} /> License & Pricing
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-black text-white">${product.price || 0}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-slate-500 line-through text-xs">${product.originalPrice}</span>
                    )}
                  </div>
                </div>

              </div>

              {/* ─── SECTION 4: R&D LAB CLASSIFIED TEASER BOX ─── */}
              <div className="bg-[#0b182b] border border-slate-700/60 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
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

              {/* ─── SECTION 5: BOTTOM CALL TO ACTION BANNER ─── */}
              <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  Ready to Transform Your Business with Tech?
                </h3>

                {/* Guarantee Pills */}
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

            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
