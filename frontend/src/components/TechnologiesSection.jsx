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
    <section className="py-24 bg-[#0a0f1e] text-white relative border-t border-gray-800/50">
      
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white"
          >
            Tools & Technologies We Use
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            The modern stack powering our projects
          </motion.p>
        </div>

        {categories.length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <AnimatePresence>
            {filteredTech.map((tech, index) => (
              <motion.a
                key={tech._id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                href={tech.websiteUrl || '#'}
                target={tech.websiteUrl ? "_blank" : "_self"}
                rel={tech.websiteUrl ? "noopener noreferrer" : ""}
                className={`group relative flex flex-col items-center p-6 rounded-xl bg-[#0f1729] border transition-all duration-300 hover:-translate-y-1 ${
                  tech.featured 
                    ? 'border-yellow-700/30 hover:border-yellow-500/50 hover:shadow-[0_4px_20px_rgba(234,179,8,0.1)]' 
                    : 'border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:bg-[#121b2f]'
                }`}
              >
                
                {tech.featured && (
                  <div className="absolute -top-3 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-300 bg-yellow-900/90 rounded-full border border-yellow-700/50 shadow-md">
                    Featured
                  </div>
                )}
                
                <div className="w-12 h-12 flex items-center justify-center mb-4 text-gray-300 group-hover:text-white transition-colors duration-300">
                  {tech.icon ? (
                    tech.icon.startsWith('http') || tech.icon.startsWith('/') || tech.icon.includes('base64') ? (
                      <img src={tech.icon} alt={tech.name} className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full group-hover:scale-110 transition-transform duration-300 drop-shadow-md" dangerouslySetInnerHTML={{ __html: tech.icon }}></span>
                    )
                  ) : (
                    <div className="w-full h-full rounded bg-gray-800 flex items-center justify-center border border-white/10">
                      <span className="text-xl font-bold">{tech.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-semibold text-center text-gray-100 group-hover:text-white transition-colors mb-2">
                  {tech.name}
                </h3>

                <div className="flex flex-col items-center w-full gap-2 mt-auto">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-800 border border-gray-700 text-gray-400">
                    {tech.category}
                  </span>

                  {tech.proficiencyLevel > 0 && (
                    <div className="w-full mt-2 group/prof relative flex items-center justify-center">
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500/70 group-hover:bg-blue-400 transition-colors" 
                          style={{ width: `${tech.proficiencyLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {tech.description && (
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-gray-900 text-white text-xs p-3 rounded-lg border border-gray-700 shadow-2xl transition-all duration-300 pointer-events-none z-20">
                    {tech.description}
                    <div className="mt-1 font-semibold text-blue-400">{tech.proficiencyLevel}% Proficiency</div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
