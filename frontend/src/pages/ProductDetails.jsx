import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ProductAPI, getFileUrl } from '../lib/api';
import { ArrowLeft, CheckCircle2, ExternalLink, Star, Package, Sparkles, Shield, Zap, MessageSquare } from 'lucide-react';

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

  return (
    <>
      <SEO
        title={product ? `${product.title} | Devugo Products` : 'Product Details | Devugo Tech'}
        description={product?.tagline || 'Explore product features, pricing, and live demo.'}
        url={`/products/${slug}`}
      />
      <Navbar />

      <div className="bg-[#061c39] text-white min-h-screen pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          
          {/* Back Button */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Products Catalog
          </Link>

          {loading ? (
            <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-3xl">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading product details...</p>
            </div>
          ) : !product ? (
            <div className="text-center py-16 bg-[#0f223f] border border-slate-700/60 rounded-3xl">
              <Package size={48} className="mx-auto text-slate-600 mb-3" />
              <h2 className="text-2xl font-extrabold text-white mb-2">Product Not Found</h2>
              <p className="text-slate-400 text-sm mb-6">The requested product could not be loaded or may be inactive.</p>
              <Link to="/products" className="bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm">
                Explore All Products
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Product Header Hero Card */}
              <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row gap-8 items-start">
                
                {/* Media Image */}
                <div className="w-full md:w-80 h-56 md:h-64 rounded-2xl bg-[#1e2536] border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center relative">
                  {product.image ? (
                    <img src={getFileUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={48} className="text-blue-400" />
                  )}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#3b5fe2] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Details Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#1e2536] border border-slate-700/60 text-xs font-bold text-blue-400">
                      {product.category || 'SaaS'}
                    </span>
                    {product.rating && (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star size={14} fill="currentColor" /> {product.rating.toFixed(1)} Rating
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                    {product.title}
                  </h1>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                    {product.tagline || product.description}
                  </p>

                  {/* Price & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <div className="text-[10px] uppercase font-extrabold text-slate-400">Price</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">${product.price || 0}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-slate-500 line-through text-sm">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      {product.demoUrl && (
                        <a
                          href={product.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-[#1e2536] hover:bg-slate-700 border border-slate-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs transition-all"
                        >
                          <ExternalLink size={16} /> Live Demo
                        </a>
                      )}
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all"
                      >
                        <MessageSquare size={16} /> Get Started / Buy
                      </Link>
                    </div>
                  </div>

                </div>

              </div>

              {/* Product Specifications & Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Features Highlights (Left Column - 2 Spans) */}
                <div className="md:col-span-2 bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 md:p-8 space-y-6">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
                    <Sparkles size={20} className="text-blue-400" /> Key Features & Capabilities
                  </h2>

                  {Array.isArray(product.features) && product.features.length > 0 ? (
                    <div className="space-y-3">
                      {product.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-[#1e2536]/80 p-4 rounded-xl border border-slate-700/40">
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold text-slate-200">{feat}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No feature bullet points listed.</p>
                  )}

                  {product.description && (
                    <div className="pt-4 border-t border-slate-800">
                      <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-2">Overview</h3>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tech Stack & Support Sidebar (Right Column) */}
                <div className="space-y-6">
                  
                  {/* Tech Stack */}
                  <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Zap size={18} className="text-amber-400" /> Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(product.techStack) && product.techStack.length > 0 ? (
                        product.techStack.map((tech, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-[#1e2536] border border-slate-700/60 text-xs font-bold text-blue-300">
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">Modern Web Stack</span>
                      )}
                    </div>
                  </div>

                  {/* Trust Guarantees */}
                  <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Shield size={18} className="text-emerald-400" /> Enterprise Guarantee
                    </h3>
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> Full Source Code & Access
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> Free Deployment & Setup
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> 24/7 Dedicated Support
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
