import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { TechnologyAPI, TechnologyCategoryAPI } from '../lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TechnologiesSection() {
  const [technologies, setTechnologies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const scrollTrackRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [techRes, catRes] = await Promise.all([
          TechnologyAPI.list({ status: true }),
          TechnologyCategoryAPI.list({ status: true })
        ]);
        setTechnologies(techRes.items || []);
        
        const fetchedCats = catRes.items || [];
        const activeTechCats = new Set((techRes.items || []).map(t => t.category));
        
        const displayCats = fetchedCats
          .map(c => c.name)
          .filter(name => activeTechCats.has(name));

        setCategories(['All', ...displayCats]);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTech = useMemo(() => {
    if (activeCategory === 'All') return technologies;
    return technologies.filter(t => t.category === activeCategory);
  }, [technologies, activeCategory]);

  const scrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-[#0f1729] text-white border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto"></div>
            <div className="flex justify-center gap-2 mt-6">
               {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-24 bg-gray-800 rounded-full"></div>)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (technologies.length === 0) return null;

  return (
    <section className="py-16 text-white relative border-t border-gray-800/50 overflow-hidden">
      
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div className="text-left max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2"
            >
              Tools & Technologies We Use
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-base md:text-lg"
            >
              The modern stack powering our projects
            </motion.p>
          </div>

          {/* Carousel Arrows for Desktop */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0 mb-1">
            <button 
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-white flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all shadow-md active:scale-95"
              aria-label="Scroll Left"
              title="Previous technologies"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-white flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all shadow-md active:scale-95"
              aria-label="Scroll Right"
              title="Next technologies"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* High-Contrast Category Filter Pills */}
        {categories.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-start items-center gap-2.5 mb-8"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white border border-blue-400/50 shadow-md shadow-blue-600/30' 
                    : 'bg-slate-800/90 text-slate-300 border border-slate-700/70 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Interactive Scroll Container */}
        {filteredTech.length > 0 && (
          <div className="relative group/carousel">
            
            {/* Floating Mobile Arrows */}
            <button
              onClick={scrollLeft}
              className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Scroll Right"
            >
              <ChevronRight size={18} />
            </button>

            {/* Scrollable Cards Track */}
            <div 
              ref={scrollTrackRef}
              className="flex gap-4 md:gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin'
              }}
            >
              {filteredTech.map((tech, index) => (
                <a
                  key={`${tech._id || tech.name}-${index}`}
                  href={tech.websiteUrl || '#'}
                  target={tech.websiteUrl ? "_blank" : "_self"}
                  rel={tech.websiteUrl ? "noopener noreferrer" : ""}
                  className={`group relative flex flex-col items-center justify-between p-5 w-40 h-52 md:w-48 md:h-56 rounded-2xl flex-shrink-0 snap-start transition-all duration-300 overflow-hidden box-border ${
                    tech.featured 
                      ? 'bg-gradient-to-b from-[#1c1803] to-[#0d1322] border border-amber-500/40 hover:border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.12)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)]' 
                      : 'bg-gradient-to-b from-[#131b2e] to-[#0a0f1e] border border-slate-700/60 hover:border-blue-500/60 shadow-md hover:shadow-[0_8px_25px_rgba(59,130,246,0.18)]'
                  } hover:-translate-y-1.5`}
                  style={{
                    isolation: 'isolate',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                  }}
                >
                  {/* Subtle Top Glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    tech.featured ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.18),transparent_70%)]' : 'bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.18),transparent_70%)]'
                  }`}></div>

                  {/* Ribbon Clipping Fix */}
                  {tech.featured && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl pointer-events-none z-20">
                      <div className="absolute top-3 -right-6 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-extrabold py-0.5 px-8 transform rotate-45 shadow-sm uppercase tracking-wider">
                        FEATURED
                      </div>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mt-1 text-gray-200 group-hover:text-white transition-all duration-300 transform group-hover:scale-105 relative z-10 shrink-0">
                    {tech.icon ? (
                      tech.icon.startsWith('http') || tech.icon.startsWith('/') || tech.icon.includes('base64') ? (
                        <img src={tech.icon} alt={tech.name} className="w-full h-full object-contain filter drop-shadow-md" loading="lazy" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full drop-shadow-md" dangerouslySetInnerHTML={{ __html: tech.icon }}></span>
                      )
                    ) : (
                      <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                        <span className="text-xl font-bold text-slate-300 group-hover:text-white">{tech.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tool Title - Strict 1 line truncation */}
                  <h3 
                    className="w-full text-xs md:text-sm font-bold text-center text-slate-200 group-hover:text-white transition-colors px-1 truncate relative z-10 my-auto"
                    title={tech.name}
                  >
                    {tech.name}
                  </h3>

                  {/* Badge */}
                  <div className="relative z-10 w-full flex justify-center mt-auto">
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-slate-950/70 border border-slate-700/80 text-slate-300 group-hover:text-white group-hover:border-slate-500 transition-colors backdrop-blur-md truncate max-w-full">
                      {tech.category}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
