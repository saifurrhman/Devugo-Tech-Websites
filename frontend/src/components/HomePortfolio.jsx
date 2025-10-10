import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioAPI } from '../lib/api';

export default function HomePortfolio({ limit = 6 }){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await PortfolioAPI.list();
        if(!mounted) return;
        const sorted = (items||[]).slice().sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
        setItems(sorted.slice(0, limit));
      }catch(err){ if(mounted) setError(err.message||'Failed to load projects'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[limit]);

  return (
    <section className="container" style={{marginTop:'1.2rem'}}>
      <div className="pf-cat-head">
        <h2 className="pf-cat-title">Recent projects</h2>
        <p className="pf-cat-sub">Latest work we shipped</p>
      </div>
      {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
      {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
      {!loading && !error && (
        items.length ? (
          <div className="services-grid" style={{marginTop:'1rem'}}>
            {items.map(p => (
              <article key={p._id} className="service-card show">
                {p.thumbnails?.[0] && (
                  <img src={p.thumbnails[0]} alt={p.title} style={{width:'100%',borderRadius:'12px',marginBottom:'.6rem'}} />
                )}
                <h3 className="service-title" style={{marginTop:0}}>{p.title}</h3>
                {p.client && <small className="muted">Client: {p.client}</small>}
                <Link to="/portfolio" className="service-link" onClick={(e)=>e.stopPropagation()}>
                  <span className="icon" aria-hidden>
                    <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  View all →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="card" style={{marginTop:'1rem'}}>No projects yet.</div>
        )
      )}
    </section>
  );
}
