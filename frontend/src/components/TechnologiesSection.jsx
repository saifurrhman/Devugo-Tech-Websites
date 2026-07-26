import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechnologyAPI } from '../lib/api';

export default function TechnologiesSection() {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchTech() {
      try {
        const res = await TechnologyAPI.list({ status: true });
        setTechnologies(res.items || []);
      } catch (err) {
        console.error('Failed to load technologies', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTech();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(technologies.map(t => t.category));
    return ['All', ...Array.from(cats).sort()];
  }, [technologies]);

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
      <section className="py-20 bg-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (technologies.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-dark to-[#0a1128] text-white relative overflow-hidden">
      
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] rounded-full bg-teal-500/10 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white"
          >
            Technologies We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Work With</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            We leverage industry-leading tools and modern frameworks to build robust, scalable, and high-performance digital solutions tailored to your business needs.
          </motion.p>
        </div>

        {categories.length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/25 border-transparent' 
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 lg:gap-8">
          <AnimatePresence>
            {filteredTech.map((tech, index) => (
              <motion.a
                key={tech._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                href={tech.websiteUrl || '#'}
                target={tech.websiteUrl ? "_blank" : "_self"}
                rel={tech.websiteUrl ? "noopener noreferrer" : ""}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white/10 ${
                  tech.featured 
                    ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' 
                    : 'border-white/10 hover:border-blue-400/50'
                }`}
              >
                {tech.featured && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-blue-600 to-teal-500 text-xs font-bold rounded-full shadow-lg">
                    Featured
                  </div>
                )}
                
                <div className="w-16 h-16 flex items-center justify-center mb-4 text-gray-300 group-hover:text-white transition-colors duration-300">
                  {tech.icon ? (
                    tech.icon.startsWith('http') || tech.icon.startsWith('/') || tech.icon.includes('base64') ? (
                      <img src={tech.icon} alt={tech.name} className="w-12 h-12 object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md" dangerouslySetInnerHTML={{ __html: tech.icon }}></span>
                    )
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center border border-white/10">
                      <span className="text-xl font-bold">{tech.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-semibold text-center text-gray-300 group-hover:text-white transition-colors">
                  {tech.name}
                </h3>
                
                {tech.description && (
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-gray-900 text-white text-xs p-3 rounded-lg border border-gray-700 shadow-2xl transition-all duration-300 pointer-events-none z-20">
                    {tech.description}
                    {tech.proficiencyLevel > 0 && (
                       <div className="mt-2 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: `${tech.proficiencyLevel}%` }}></div>
                       </div>
                    )}
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
