import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { TechnologyAPI, TechnologyCategoryAPI } from '../lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TechnologiesSection() {
  const [technologies, setTechnologies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isPaused, setIsPaused] = useState(false);
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

  // Smooth continuous auto-scroll loop
  useEffect(() => {
    if (isPaused || filteredTech.length <= 1) return;
    const track = scrollTrackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      
      if (track.scrollLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollLeft += 1;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused, filteredTech]);

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
      <section className="py-16 bg-transparent text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800/60 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-800/60 rounded w-1/2 mx-auto"></div>
            <div className="flex justify-center gap-2 mt-6">
               {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-24 bg-gray-800/60 rounded-full"></div>)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800/60 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (technologies.length === 0) return null;

  return (
    <section className="py-12 md:py-16 text-white relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        
        {/* Section Header: Tightly grouped Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-4 md:mb-5">
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

        {/* Filter Pills: High Contrast & Glassy Effect */}
        {categories.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center items-center gap-2.5 mb-6 md:mb-8"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white border border-blue-400/50 shadow-md shadow-blue-600/30' 
                    : 'bg-white/[0.08] text-slate-300 border border-white/15 hover:bg-white/[0.16] hover:text-white hover:border-white/30 backdrop-blur-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Carousel Container with Vertically-Centered Arrow Buttons */}
        {filteredTech.length > 0 && (
          <div 
            className="relative group/carousel px-2 md:px-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            
            {/* Left Circular Arrow Button */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/85 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md shadow-xl hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 active:scale-95"
              aria-label="Scroll Left"
              title="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Right Circular Arrow Button */}
            <button
              onClick={scrollRight}
              className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/85 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md shadow-xl hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 active:scale-95"
              aria-label="Scroll Right"
              title="Scroll right"
            >
              <ChevronRight size={22} />
            </button>

            {/* Scrollable Cards Track */}
            <div 
              ref={scrollTrackRef}
              className="flex gap-4 md:gap-5 overflow-x-auto pb-4 pt-1 px-3 md:px-4 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
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
                  className={`group relative flex flex-col items-center justify-between pt-7 pb-5 px-5 w-40 h-52 md:w-48 md:h-56 rounded-2xl flex-shrink-0 snap-start transition-all duration-300 overflow-hidden box-border ${
                    tech.featured 
                      ? 'bg-gradient-to-b from-[#241c10] via-[#16120b] to-[#0c0906] border border-amber-400/60 hover:border-amber-400 shadow-[0_0_25px_rgba(255,193,7,0.22)] hover:shadow-[0_0_35px_rgba(255,193,7,0.4)]' 
                      : 'bg-gradient-to-b from-[#161b26] to-[#0b0e15] border border-white/10 hover:border-blue-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.5)]'
                  } hover:-translate-y-2`}
                  style={{
                    isolation: 'isolate',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                  }}
                >
                  {/* Top Inner Radial Glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    tech.featured ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(255,193,7,0.3),transparent_70%)]' : 'bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.25),transparent_70%)]'
                  }`}></div>

                  {/* Vibrant Ribbon Corner Clipping for Featured */}
                  {tech.featured && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl pointer-events-none z-20">
                      <div className="absolute top-3 -right-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-[9px] font-black py-0.5 px-8 transform rotate-45 shadow-[0_2px_8px_rgba(255,193,7,0.5)] uppercase tracking-wider">
                        FEATURED
                      </div>
                    </div>
                  )}
                  
                  {/* Logo Container Style with Micro-Animations */}
                  <div className="w-13 h-13 md:w-15 md:h-15 flex items-center justify-center text-gray-200 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-2 relative z-10 shrink-0">
                    {tech.icon ? (
                      tech.icon.startsWith('http') || tech.icon.startsWith('/') || tech.icon.includes('base64') ? (
                        <div className="w-full h-full p-2.5 rounded-[16px] bg-white/95 border border-white/30 shadow-[0_8px_20px_rgba(0,0,0,0.35)] flex items-center justify-center backdrop-blur-md overflow-hidden group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-all">
                          <img src={tech.icon} alt={tech.name} className="w-full h-full object-contain filter drop-shadow-sm rounded-lg transform group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                      ) : (
                        <div className="w-full h-full p-2 rounded-[16px] bg-white/[0.08] border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.35)] flex items-center justify-center backdrop-blur-md overflow-hidden group-hover:border-white/40 group-hover:bg-white/[0.14] transition-all [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full [&>img]:object-contain [&>img]:rounded-lg [&>div]:w-full [&>div]:h-full [&>div]:rounded-lg [&>div]:overflow-hidden">
                          <span className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: tech.icon }}></span>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full rounded-[16px] bg-slate-800/90 flex items-center justify-center border border-slate-700 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                        <span className="text-xl font-bold text-slate-300 group-hover:text-white">{tech.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tool Title */}
                  <h3 
                    className="w-full text-xs md:text-sm font-bold text-center text-slate-200 group-hover:text-white transition-colors px-1 truncate relative z-10 my-auto"
                    title={tech.name}
                  >
                    {tech.name}
                  </h3>

                  {/* Glassy Badge Pill */}
                  <div className="relative z-10 w-full flex justify-center mt-auto">
                    <span className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.12] text-slate-300 group-hover:text-white group-hover:border-white/25 group-hover:bg-white/[0.12] transition-colors truncate max-w-full">
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
