import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PortfolioAPI, api } from '../lib/api';

export default function PortfolioDetail(){
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        // Try to find by slug via list
        const { items } = await PortfolioAPI.list();
        const found = (items||[]).find(p => (p.slug||'') === slug) || (items||[]).find(p=>String(p._id)===String(slug));
        if (!found) throw new Error('Project not found');
        if(mounted) setItem(found);
      }catch(err){ if(mounted) setError(err.message||'Failed to load project'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[slug]);

  return (
    <>
      <Navbar />
      <main className="container" style={{paddingTop:'2rem', paddingBottom:'2rem'}}>
        <div className="breadcrumbs" style={{marginBottom:'.75rem'}}>
          <Link to="/" style={{color:'white', textDecoration:'none'}}>Home</Link>
          <span style={{color:'rgba(255,255,255,0.5)', margin:'0 0.3rem'}}> / </span>
          <Link to="/portfolio" style={{color:'white', textDecoration:'none'}}>Portfolio</Link>
          <span style={{color:'#ffffff', margin:'0 0.3rem'}}> / </span>
          <strong style={{color:'#ffffff', fontWeight:500}}>{item?.title || 'Project'}</strong>
        </div>

        {loading && <div className="card">Loading…</div>}
        {error && <div className="card" style={{color:'#ef4444'}}>{error}</div>}
        {!loading && !error && item && (
          <>
            <section className="card" style={{padding:'1.25rem'}}>
              <h1 style={{marginTop:0}}>{item.title}</h1>
              {item.client && <div className="muted" style={{marginTop:'.25rem'}}>Client: {item.client}</div>}
              {item.thumbnails?.[0] && (
                <div style={{margin:'1rem 0'}}>
                  <img src={item.thumbnails[0]} alt={item.title} style={{width:'100%',borderRadius:12}} />
                </div>
              )}
              {item.description && <p style={{fontSize:'1.05rem', lineHeight:1.6}}>{item.description}</p>}
              {Array.isArray(item.tags) && item.tags.length>0 && (
                <div style={{marginTop:'.75rem', display:'flex', gap:'.4rem', flexWrap:'wrap'}}>
                  {item.tags.map((t,i)=>(<span key={i} className="badge">{t}</span>))}
                </div>
              )}
              {item.url && (
                <div style={{marginTop:'1rem'}}>
                  <a className="btn" href={item.url} target="_blank" rel="noopener noreferrer">Visit project</a>
                </div>
              )}
            </section>

            {Array.isArray(item.thumbnails) && item.thumbnails.length>1 && (
              <section style={{marginTop:'1rem'}}>
                <h2 style={{margin:'0 0 .5rem 0'}}>Gallery</h2>
                <div className="grid three" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))',gap:'1rem'}}>
                  {item.thumbnails.slice(1).map((img, idx)=>(
                    <img key={idx} src={img} alt={`${item.title} ${idx+2}`} style={{width:'100%',borderRadius:12}} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}