import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioAPI } from '../lib/api';

export default function HomePortfolio({ limit = 6, mode = 'grid' }){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); 
      setError('');
      try{
        const { items } = await PortfolioAPI.list();
        if(!mounted) return;
        const sorted = (items||[]).slice().sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
        setItems(sorted.slice(0, limit));
      }catch(err){ 
        if(mounted) setError(err.message||'Failed to load projects'); 
      }
      finally{ 
        if(mounted) setLoading(false); 
      }
    })();
    return ()=>{ mounted=false };
  },[limit]);

  if(loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Recent projects</h2>
          <p className="text-lg text-gray-400">Latest work we shipped</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </section>
    );
  }

  if(error) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Recent projects</h2>
          <p className="text-lg text-gray-400">Latest work we shipped</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center text-red-400">
          {error}
        </div>
      </section>
    );
  }

  if(mode === 'carousel') {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Recent projects</h2>
          <p className="text-lg text-gray-400">Latest work we shipped</p>
        </div>
        <div className="reviews-carousel">
          <div className="reviews-track">
            {[...items, ...items].map((p, idx) => (
              <article key={(p._id||idx)+':hp'} className="service-card rc show">
                {p.thumbnails?.[0] && (
                  <img src={p.thumbnails[0]} alt={p.title} className="w-full rounded-xl mb-3" />
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
                {p.client && <p className="text-sm text-gray-400 mb-3">Client: {p.client}</p>}
                <Link to="/portfolio" className="service-link" onClick={(e)=>e.stopPropagation()}>
                  <span className="icon" aria-hidden>
                    <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  View all
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // GRID MODE - Main fix here
  return (
    <section className="container mx-auto px-4 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
          Recent projects
        </h2>
        <p className="text-base md:text-lg text-gray-400">
          Latest work we shipped
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
          No projects yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {items.map((p, idx) => (
            <article 
              key={p._id} 
              className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/30 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                animation: `fadeInUp 0.6s ease forwards ${idx * 0.1}s`,
                opacity: 0
              }}
            >
              {/* Image Section */}
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                {p.thumbnails?.[0] ? (
                  <img 
                    src={p.thumbnails[0]} 
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21" strokeWidth="1.5"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex flex-col gap-3 p-6 flex-1">
                <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
                  {p.title}
                </h3>
                
                {p.client && (
                  <p className="text-sm text-gray-400">
                    <span className="text-cyan-400 font-medium">Client:</span> {p.client}
                  </p>
                )}
                
                {p.description && (
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed flex-1">
                    {p.description}
                  </p>
                )}
                
                <Link 
                  to={`/portfolio/${p._id}`}
                  className="inline-flex items-center gap-2 text-cyan-400 font-medium text-sm mt-auto w-fit transition-all duration-200 group-hover:gap-3"
                >
                  View Project
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      
      {/* View All Button */}
      {items.length > 0 && (
        <div className="text-center mt-12">
          <Link 
            to="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 font-medium hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200"
          >
            View All Projects
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      )}
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}