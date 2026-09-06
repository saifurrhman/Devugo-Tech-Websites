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

  // Multiply items for seamless continuous looping marquee track
  const marqueeTech = useMemo(() => {
    if (filteredTech.length === 0) return [];
    if (filteredTech.length >= 6) return [...filteredTech, ...filteredTech];
    return [...filteredTech, ...filteredTech, ...filteredTech, ...filteredTech];
  }, [filteredTech]);

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
          <div className="relative group/carousel px-2 md:px-12">
            
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

            {/* Marquee Continuous Infinite Auto-Scroll Container */}
            <div className="tech-marquee-container overflow-x-auto scrollbar-none" ref={scrollTrackRef}>
              <div className="tech-marquee-track">
                {marqueeTech.map((tech, index) => (
                  <a
                    key={`${tech._id || tech.name}-${index}`}
                    href={tech.websiteUrl || '#'}
                    target={tech.websiteUrl ? "_blank" : "_self"}
                    rel={tech.websiteUrl ? "noopener noreferrer" : ""}
                    className={`tool-card ${tech.featured ? 'featured' : ''} group relative flex-shrink-0 transition-all duration-300 overflow-hidden box-border hover:-translate-y-2`}
                    style={{
                      isolation: 'isolate',
                      WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                    }}
                  >
                    {/* Vibrant Ribbon Corner Clipping for Featured */}
                    {tech.featured && (
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl pointer-events-none z-20">
                        <div className="absolute top-3 -right-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-[9px] font-black py-0.5 px-8 transform rotate-45 shadow-[0_2px_8px_rgba(255,193,7,0.5)] uppercase tracking-wider">
                          FEATURED
                        </div>
                      </div>
                    )}
                    
                    {/* Icon box - white background jo har icon/logo ke peeche aayega */}
                    <div className="icon-box relative z-10 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {tech.icon ? (
                        tech.icon.startsWith('http') || tech.icon.startsWith('/') || tech.icon.includes('base64') ? (
                          <img src={tech.icon} alt={tech.name} loading="lazy" />
                        ) : (
                          <span dangerouslySetInnerHTML={{ __html: tech.icon }}></span>
                        )
                      ) : (
                        <span className="text-2xl font-bold text-slate-800">{tech.name.charAt(0)}</span>
                      )}
                    </div>
                    
                    {/* Tool Name */}
                    <h3 className="tool-name relative z-10" title={tech.name}>
                      {tech.name}
                    </h3>

                    {/* Category Badge */}
                    <div className="relative z-10 w-full flex justify-center mt-auto">
                      <span className="badge">
                        {tech.category}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
