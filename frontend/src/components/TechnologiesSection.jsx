import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechnologyAPI, TechnologyCategoryAPI } from '../lib/api';

export default function TechnologiesSection() {
  const [technologies, setTechnologies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const [techRes, catRes] = await Promise.all([
          TechnologyAPI.list({ status: true }),
          TechnologyCategoryAPI.list({ status: true })
        ]);
        setTechnologies(techRes.items || []);
        
        // Use the ordered categories from the API, but only those that have at least one active technology
        const fetchedCats = catRes.items || [];
        const activeTechCats = new Set((techRes.items || []).map(t => t.category));
        
        // Filter fetched categories to only show ones that have tech, preserving the order from the API
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

  const schemaData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": technologies.map((t, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Thing",
          "name": t.name,
          "description": t.description || undefined,
          "url": t.websiteUrl || undefined
        }
      }))
    };
  }, [technologies]);

  if (loading) {
    return (
      <section className="py-20 bg-[#0f1729] text-white border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto"></div>
            <div className="flex justify-center gap-2 mt-8">
               {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-24 bg-gray-800 rounded-full"></div>)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (technologies.length === 0) return null;

  return (
    <section className="py-24 text-white relative border-t border-gray-800/50">
      
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white"
          >
            Tools & Technologies We Use
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            The modern stack powering our projects
          </motion.p>
        </div>

        {categories.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-2 mb-12"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-gray-900/50 text-gray-400 border border-transparent hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-left {
            animation: scroll-left var(--scroll-duration, 30s) linear infinite;
            display: flex;
            width: max-content;
          }
          .marquee-container:hover .animate-scroll-left {
            animation-play-state: paused;
          }
        `}</style>

        {filteredTech.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden w-full marquee-container py-8"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
          >
            {(() => {
              const baseRepeatCount = Math.ceil(12 / Math.max(filteredTech.length, 1));
              const baseTech = Array(baseRepeatCount).fill(filteredTech).flat();
              const duration = Math.max(20, baseTech.length * 3);

              return (
                <div 
                  className="animate-scroll-left" 
                  style={{ '--scroll-duration': `${duration}s` }}
                >
                  {[0, 1].map((setIndex) => (
                    <div key={setIndex} className="flex gap-4 md:gap-6 pr-4 md:pr-6 shrink-0">
                      {baseTech.map((tech, index) => (
                        <a
                          key={`${tech._id || tech.name}-${index}`}
                          href={tech.websiteUrl || '#'}
                          target={tech.websiteUrl ? "_blank" : "_self"}
                          rel={tech.websiteUrl ? "noopener noreferrer" : ""}
                          className={`group relative flex flex-col items-center justify-center p-6 w-40 h-48 md:w-52 md:h-60 rounded-2xl flex-shrink-0 transition-all duration-500 overflow-hidden ${
                            tech.featured 
                              ? 'bg-gradient-to-b from-[#1a1500] to-[#0a0f1e] border border-yellow-500/30 hover:border-yellow-400/80 shadow-[0_4px_20px_rgba(234,179,8,0.1)] hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)]' 
                              : 'bg-gradient-to-b from-[#111827] to-[#0a0f1e] border border-white/5 hover:border-blue-500/50 shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]'
                          } hover:-translate-y-2`}
                        >
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                            tech.featured ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.15),transparent_70%)]' : 'bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_70%)]'
                          }`}></div>

                          {tech.featured && (
                            <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 rounded-tr-2xl">
                              <div className="absolute top-3 -right-6 bg-gradient-to-r from-yellow-600 to-yellow-400 text-yellow-950 text-[9px] font-bold py-1 px-8 transform rotate-45 shadow-md">
                                FEATURED
                              </div>
                            </div>
                          )}
                          
                          <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4 text-gray-300 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1 relative z-10">
                            {tech.icon ? (
                              tech.icon.startsWith('http') || tech.icon.startsWith('/') || tech.icon.includes('base64') ? (
                                <img src={tech.icon} alt={tech.name} className="w-full h-full object-contain filter drop-shadow-lg" loading="lazy" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full drop-shadow-lg" dangerouslySetInnerHTML={{ __html: tech.icon }}></span>
                              )
                            ) : (
                              <div className="w-full h-full rounded-2xl bg-gray-800/80 flex items-center justify-center border border-white/10 shadow-inner backdrop-blur-sm">
                                <span className="text-2xl font-bold text-gray-400 group-hover:text-white">{tech.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-sm md:text-base font-bold text-center text-gray-300 group-hover:text-white transition-colors mb-3 relative z-10">
                            {tech.name}
                          </h3>

                          <div className="mt-auto relative z-10 w-full flex justify-center">
                            <span className="px-3 py-1 text-[10px] md:text-xs font-medium tracking-wider uppercase rounded-full bg-black/40 border border-gray-700/50 text-gray-400 group-hover:text-gray-200 group-hover:border-gray-500/50 transition-colors backdrop-blur-md">
                              {tech.category}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        )}

      </div>
    </section>
  );
}
