import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { TeamAPI } from '../lib/api';

export default function Team() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { members } = await TeamAPI.list();
        if(mounted) setItems(members||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load team'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Our Team</h1>
        {loading && <p>Loading…</p>}
        {error && <p style={{color:'#ef4444'}}>{error}</p>}
        {!loading && !error && (
          items.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {items.map(m => (
                <article key={m._id} className="card" style={{display:'grid',gap:'.5rem'}}>
                  {m.avatar && <img src={m.avatar} alt={m.name} style={{width:'100%',borderRadius:'12px'}} />}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{m.name}</h3>
                    <span className="badge">{m.role||'Member'}</span>
                  </div>
                  {m.bio && <p style={{margin:0}}>{m.bio}</p>}
                  <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                    {m.socials?.linkedin && <a className="service-link" href={m.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                    {m.socials?.twitter && <a className="service-link" href={m.socials.twitter} target="_blank" rel="noopener noreferrer">X</a>}
                    {m.socials?.github && <a className="service-link" href={m.socials.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
                    {m.socials?.website && <a className="service-link" href={m.socials.website} target="_blank" rel="noopener noreferrer">Website</a>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No team members yet.</div>
          )
        )}
      </main>
      <Footer />
    </>
  );
}
