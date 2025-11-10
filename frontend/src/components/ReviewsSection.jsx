import React, { useEffect, useState } from 'react';
import { ClientReviewAPI } from '../lib/api';

export default function ReviewsSection({ 
  title = 'WHAT CLIENTS SAY', 
  subtitle = 'Real feedback from our partners', 
  limit = 16, 
  featuredOnly = true
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = featuredOnly ? { featured: true } : {};
        const { items } = await ClientReviewAPI.list(params);
        if (!mounted) return;
        setItems((items || []).slice(0, limit));
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load reviews');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [limit, featuredOnly]);

  if (loading) return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-10 text-center text-white">
          Loading reviews…
        </div>
      </div>
    </section>
  );

  if (error || !items.length) return null;

  // Create 4 columns
  const columns = [[], [], [], []];
  items.forEach((item, index) => {
    columns[index % 4].push(item);
  });

  // Animation directions: 0=up, 1=down, 2=up, 3=down
  const animationDirections = ['up', 'down', 'up', 'down'];

  return (
    <section className="py-20" aria-label="Client reviews">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-300">
            {subtitle}
          </p>
        </div>

        {/* 4 Column Grid with Vertical Scrolling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column, colIndex) => (
            <div 
              key={colIndex}
              className="flex flex-col gap-6 overflow-hidden"
              style={{
                maxHeight: '800px'
              }}
            >
              <div
                className="flex flex-col gap-6"
                style={{
                  animation: `scroll${animationDirections[colIndex]} 15s linear infinite`,
                  animationDelay: `${colIndex * 0.5}s`
                }}
              >
                {/* Triple items for smooth infinite scroll */}
                {[...column, ...column, ...column].map((r, idx) => (
                  <article 
                    key={`${r._id}-${idx}`} 
                    className="flex-shrink-0 rounded-2xl p-6 border transition-all duration-300 hover:scale-105"
                    style={{ 
                      minHeight: '220px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'  
                    }}
                  >
                    {/* Avatar and Name Section */}
                    <div className="flex items-start gap-3 mb-4">
                      {r.avatar ? (
                        <img 
                          src={r.avatar} 
                          alt={r.name} 
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
                          style={{ border: '2px solid rgba(59, 130, 246, 0.3)' }}
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0"
                          style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            border: '2px solid rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          {String(r.name || '?').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <strong className="block text-white-700 font-bold text-base mb-1">
                          {r.name}
                        </strong>
                        {(r.role || r.company) && (
                          <div className="text-xs text-white-500 truncate">
                            {[r.role, r.company].filter(Boolean).join(' • ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="mb-4">
                      <div className="flex gap-1 text-lg">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span 
                            key={i} 
                            className={i < (r.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    {r.summary && (
                      <p className="text-white-700 text-sm leading-relaxed line-clamp-6">
                        {r.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CSS for vertical scrolling animation */}
        <style jsx>{`
          @keyframes scrollup {
            0% { transform: translateY(100%); }
            100% { transform: translateY(-66.666%); }
          }
          @keyframes scrolldown {
            0% { transform: translateY(-66.666%); }
            100% { transform: translateY(100%); }
          }
          .line-clamp-6 {
            display: -webkit-box;
            -webkit-line-clamp: 6;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </section>
  );
}