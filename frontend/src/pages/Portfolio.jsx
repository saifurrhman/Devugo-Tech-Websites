import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PortfolioAPI } from '../lib/api';
import { useLocation } from 'react-router-dom';
import ReviewsSection from '../components/ReviewsSection';
import PortfolioCategories from '../components/PortfolioCategories';

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const tag = useMemo(()=> new URLSearchParams(location.search).get('tag') || '', [location.search]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await PortfolioAPI.list();
        if(mounted) setItems(items||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load portfolio'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const filtered = useMemo(()=>{
    if (!tag) return items;
    const t = tag.toLowerCase();
    return items.filter(p => (p.tags||[]).some(x => String(x).toLowerCase() === t));
  }, [items, tag]);

  return (
    <>
      <Navbar />
      <main className="container">
        <PortfolioCategories showHeader={false} />
        <h1 style={{marginTop:'1rem'}}>Portfolio{tag? ` — ${tag}`:''}</h1>
        {loading && <p>Loading…</p>}
        {error && <p style={{color:'#ef4444'}}>{error}</p>}
        {!loading && !error && (
          filtered.length ? (
            <div className="services-grid" style={{marginTop:'1rem'}}>
              {filtered.map(p => (
                <article key={p._id} className="service-card show">
                  {p.thumbnails?.[0] && (
                    <img src={p.thumbnails[0]} alt={p.title} style={{width:'100%',borderRadius:'12px',marginBottom:'.6rem'}} />
                  )}
                  <h3 className="service-title">{p.title}</h3>
                  {p.client && <small className="muted">Client: {p.client}</small>}
                  {p.description && <p className="service-desc" style={{marginTop:'.25rem'}}>{p.description}</p>}
                  {!!(p.techStack||[]).length && (
                    <div className="tech-badges">
                      {(p.techStack||[]).map((t,idx)=> (
                        <span key={idx} className="tech-badge">{String(t)}</span>
                      ))}
                    </div>
                  )}
                  {p.url && <a className="service-link" href={p.url} target="_blank" rel="noopener noreferrer">
                    <span className="icon" aria-hidden>
                      <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    Visit project →
                  </a>}
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No projects{tag? ` for “${tag}”`:''} yet.</div>
          )
        )}
      </main>
      <ReviewsSection title="Client reviews" subtitle="What our clients say about working with us" featuredOnly={false} mode="carousel" />
      <Footer />
    </>
  );
}
