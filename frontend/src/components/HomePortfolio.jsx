import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioAPI } from '../lib/api';

export default function HomePortfolio({ limit = 6, mode = 'grid', selectedCategory = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { items } = await PortfolioAPI.list();
        if (!mounted) return;
        
        let filtered = items || [];
        
        // Filter by category if selected
        if (selectedCategory) {
          filtered = filtered.filter(item => 
            (item.tags || []).some(tag => 
              String(tag).toLowerCase() === selectedCategory.toLowerCase()
            )
          );
        }
        
        const sorted = filtered.slice().sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        
        setItems(sorted.slice(0, limit));
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load projects');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [limit, selectedCategory]);

  if (loading) {
    return (
      <section className="services-section">
        <div className="container">
          <div className="services-head">
            <p className="services-sub">Loading projects...</p>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>Loading…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="services-section">
        <div className="container">
          <div className="services-head">
            <h2 className="services-title">Recent Projects</h2>
            <p className="services-sub">Latest work we shipped</p>
          </div>
          <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="services-section" style={{ overflow: 'hidden' }}>
      {items.length === 0 ? (
        <div className="container">
          <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
            {selectedCategory 
              ? `No projects found in "${selectedCategory}" category.`
              : 'No projects yet.'
            }
          </div>
        </div>
      ) : (
        <>
          {/* FULL WIDTH Horizontal Scrolling Container */}
          <div className="horizontal-scroll-wrapper-clean" style={{ marginTop: '1rem' }}>
            <div className="horizontal-scroll-track">
              {/* First set of cards */}
              {items.map((p) => (
                <article key={`first-${p._id}`} className="service-card-horizontal">
                  {p.thumbnails?.[0] && (
                    <img
                      src={p.thumbnails[0]}
                      alt={p.title}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        marginBottom: '0.6rem',
                        aspectRatio: '16/9',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <h3 className="service-title">{p.title}</h3>
                  {p.client && (
                    <small className="muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                      Client: {p.client}
                    </small>
                  )}
                  {p.description && (
                    <p className="service-desc" style={{ 
                      marginTop: '0.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {p.description}
                    </p>
                  )}
                  {!!(p.techStack || []).length && (
                    <div className="tech-badges" style={{ marginTop: '0.75rem' }}>
                      {(p.techStack || []).slice(0, 3).map((t, idx) => (
                        <span key={idx} className="tech-badge">{String(t)}</span>
                      ))}
                    </div>
                  )}
                  <Link
                    to={`/portfolio/${p._id}`}
                    className="service-link"
                  >
                    <span className="icon" aria-hidden>
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    View project →
                  </Link>
                </article>
              ))}
              
              {/* Duplicate set for seamless loop - only if enough items */}
              {items.length >= 3 && items.map((p) => (
                <article key={`second-${p._id}`} className="service-card-horizontal">
                  {p.thumbnails?.[0] && (
                    <img
                      src={p.thumbnails[0]}
                      alt={p.title}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        marginBottom: '0.6rem',
                        aspectRatio: '16/9',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <h3 className="service-title">{p.title}</h3>
                  {p.client && (
                    <small className="muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                      Client: {p.client}
                    </small>
                  )}
                  {p.description && (
                    <p className="service-desc" style={{ 
                      marginTop: '0.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {p.description}
                    </p>
                  )}
                  {!!(p.techStack || []).length && (
                    <div className="tech-badges" style={{ marginTop: '0.75rem' }}>
                      {(p.techStack || []).slice(0, 3).map((t, idx) => (
                        <span key={idx} className="tech-badge">{String(t)}</span>
                      ))}
                    </div>
                  )}
                  <Link
                    to={`/portfolio/${p._id}`}
                    className="service-link"
                  >
                    <span className="icon" aria-hidden>
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    View project →
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div className="container">
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link
                to="/portfolio"
                className="btn outline"
              >
                View All Projects
                <span className="icon arrow">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Horizontal Scrolling CSS */}
      <style jsx>{`
        .horizontal-scroll-wrapper-clean {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          overflow: hidden;
          padding: 2rem 0;
        }

        .horizontal-scroll-track {
          display: flex;
          gap: 1.5rem;
          padding: 0 2rem;
          animation: scrollLeft 30s linear infinite;
          width: fit-content;
        }

        .horizontal-scroll-track:hover {
          animation-play-state: paused;
        }

        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .service-card-horizontal {
          flex: 0 0 380px;
          width: 380px;
          background: var(--color-card, #fff);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .service-card-horizontal:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        @media (max-width: 1024px) {
          .service-card-horizontal {
            flex: 0 0 320px;
            width: 320px;
          }
        }

        @media (max-width: 768px) {
          .service-card-horizontal {
            flex: 0 0 280px;
            width: 280px;
          }
          
          .horizontal-scroll-track {
            animation-duration: 25s;
            padding: 0 1rem;
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}