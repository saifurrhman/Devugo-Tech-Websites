import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PortfolioAPI } from '../lib/api';
import ReviewsSection from '../components/ReviewsSection';
import PortfolioCategories from '../components/PortfolioCategories';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import PortfolioCard from '../components/PortfolioCard';

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
      <SEO
        title="Portfolio | Devugo Tech Case Studies & Client Projects"
        description="See real results — SaaS platforms, automation systems, and web apps we've built for startups and businesses globally."
        url="/portfolio"
      />
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
                <PortfolioCard key={p._id} project={p} className="show" />
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