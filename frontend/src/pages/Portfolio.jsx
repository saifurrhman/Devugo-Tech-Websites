import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PortfolioAPI } from '../lib/api';
import ReviewsSection from '../components/ReviewsSection';
import PortfolioCategories from '../components/PortfolioCategories';
import PageHero from '../components/PageHero';

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { items } = await PortfolioAPI.list();
        if (mounted) setItems(items || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load portfolio');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    if (!selectedCategory) return items;
    const t = selectedCategory.toLowerCase();
    return items.filter(p => (p.tags || []).some(x => String(x).toLowerCase() === t));
  }, [items, selectedCategory]);

  return (
    <>
      <Navbar />
      <PageHero
        eyebrow="Portfolio"
        title="Work we're proud of"
        subtitle="Case studies, websites, and products we've shipped for clients."
        primary={{ href: '/contact', label: 'Start a project' }}
        secondary={{ href: '/services', label: 'Explore services' }}
      />
      <main className="container">
        {/* Portfolio Categories - User will click here */}
        <PortfolioCategories 
          showHeader={false}
          onCategorySelect={setSelectedCategory}
          activeCategory={selectedCategory || 'All'}
        />

        <h1 style={{ marginTop: '1rem' }}>
          Portfolio{selectedCategory ? ` — ${selectedCategory}` : ''}
        </h1>

        {loading && <p>Loading…</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        
        {!loading && !error && (
          filtered.length ? (
            <div className="services-grid" style={{ marginTop: '1rem' }}>
              {filtered.map(p => (
                <article key={p._id} className="service-card show">
                  {p.thumbnails?.[0] && (
                    <img 
                      src={p.thumbnails[0]} 
                      alt={p.title} 
                      style={{ 
                        width: '100%', 
                        borderRadius: '12px', 
                        marginBottom: '.6rem',
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
                    <p className="service-desc" style={{ marginTop: '.5rem' }}>
                      {p.description}
                    </p>
                  )}
                  {!!(p.techStack || []).length && (
                    <div className="tech-badges" style={{ marginTop: '0.75rem' }}>
                      {(p.techStack || []).map((t, idx) => (
                        <span key={idx} className="tech-badge">{String(t)}</span>
                      ))}
                    </div>
                  )}
                  {p.url && (
                    <a 
                      className="service-link" 
                      href={p.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <span className="icon" aria-hidden>
                        <svg viewBox="0 0 24 24">
                          <path 
                            d="M5 12h12M13 6l6 6-6 6" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Visit project →
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
              No projects{selectedCategory ? ` for "${selectedCategory}"` : ''} yet.
            </div>
          )
        )}
      </main>
      
      <ReviewsSection 
        title="Client reviews" 
        subtitle="What our clients say about working with us" 
        featuredOnly={false} 
        mode="carousel" 
      />
      
      <Footer />
    </>
  );
}