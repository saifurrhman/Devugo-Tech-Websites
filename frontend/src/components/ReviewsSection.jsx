import React, { useEffect, useState, useRef } from 'react';
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
  const columnRefs = useRef([]);

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

  const pauseAnimation = (index) => {
    if (columnRefs.current[index]) {
      columnRefs.current[index].style.animationPlayState = 'paused';
    }
  };

  const resumeAnimation = (index) => {
    if (columnRefs.current[index]) {
      columnRefs.current[index].style.animationPlayState = 'running';
    }
  };

  // Loading State
  if (loading) {
    return (
      <section className="py-20" aria-label="Client reviews">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-4">
              {title}
            </h3>
            <p className="text-base text-gray-300">{subtitle}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-10 text-center">
            <div className="inline-block w-10 h-10 border-3 border-white/20 border-t-blue-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Loading reviews…</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty State
  if (error || !items.length) {
    return (
      <section className="py-20" aria-label="Client reviews">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-4">
              {title}
            </h2>
            <p className="text-base text-gray-300">{subtitle}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-10 text-center">
            <p className="text-white text-lg">
              {error || 'Reviews are being prepared. Check back soon!'}
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-white mb-4">
            {title}
          </h2>
          <p className="text-base text-gray-300">
            {subtitle}
          </p>
        </div>

        {/* 4 Column Grid with Vertical Scrolling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column, colIndex) => (
            <div 
              key={colIndex}
              className="flex flex-col gap-6 overflow-hidden max-h-[500px] md:max-h-[700px] lg:max-h-[800px]"
            >
              <div
                ref={(el) => (columnRefs.current[colIndex] = el)}
                className="flex flex-col gap-6"
                style={{
                  animation: `scroll${animationDirections[colIndex]} ${Math.max(15, column.length * 3)}s linear infinite`,
                  animationDelay: `${colIndex * 0.5}s`,
                  willChange: 'transform'
                }}
                onMouseEnter={() => pauseAnimation(colIndex)}
                onMouseLeave={() => resumeAnimation(colIndex)}
              >
                {/* Triple items for smooth infinite scroll */}
                {[...column, ...column, ...column].map((r, idx) => (
                  <article 
                    key={`${r._id}-${idx}`}
                    aria-hidden={idx >= column.length}
                    className="flex-shrink-0 rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-md min-h-[220px] shadow-lg"
                  >
                    {/* Avatar and Name Section */}
                    <div className="flex items-start gap-3 mb-4">
                      {r.avatar ? (
                        <img 
                          src={r.avatar} 
                          alt={r.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-blue-400/30" 
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400/30"
                          aria-hidden="true"
                        >
                          {String(r.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <strong className="block text-white font-bold text-base mb-1">
                          {r.name}
                        </strong>
                        {(r.role || r.company) && (
                          <div className="text-xs text-gray-300 truncate">
                            {[r.role, r.company].filter(Boolean).join(' • ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="mb-4">
                      <div 
                        className="flex gap-1 text-lg" 
                        role="img" 
                        aria-label={`${r.rating || 5} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <span 
                            key={i}
                            aria-hidden="true"
                            className={i < (r.rating || 5) ? 'text-yellow-400' : 'text-gray-400'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    {r.summary && (
                      <p className="text-gray-100 text-sm leading-relaxed line-clamp-6">
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
            0% { transform: translateY(0); }
            100% { transform: translateY(-66.666%); }
          }
          @keyframes scrolldown {
            0% { transform: translateY(-66.666%); }
            100% { transform: translateY(0); }
          }
          .line-clamp-6 {
            display: -webkit-box;
            -webkit-line-clamp: 6;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .flex-col > div {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}