import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PortfolioAPI } from '../lib/api';

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Portfolio</h1>
        {loading && <p>Loading…</p>}
        {error && <p style={{color:'#ef4444'}}>{error}</p>}
        {!loading && !error && (
          items.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {items.map(p => (
                <article key={p._id} className="card" style={{display:'grid',gap:'.5rem'}}>
                  {p.thumbnails?.[0] && (
                    <img src={p.thumbnails[0]} alt={p.title} style={{width:'100%',borderRadius:'12px'}} />
                  )}
                  <h3 style={{margin:0}}>{p.title}</h3>
                  {p.client && <small className="muted">Client: {p.client}</small>}
                  {p.description && <p style={{margin:0}}>{p.description}</p>}
                  {p.url && <a className="service-link" href={p.url} target="_blank" rel="noopener noreferrer">Visit project →</a>}
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No projects yet.</div>
          )
        )}
      </main>
      <Footer />
    </>
  );
}
