import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../lib/api';

export default function ServiceDetail(){
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        // Fetch single published service by slug via public endpoint
        const { item: found } = await api(`/api/services/slug/${slug}`, { method:'GET' });
        if (!found) throw new Error('Service not found');
        if(mounted) setService(found);
        // Load related pricing if available
        try{
          const { items: planItems } = await api(`/api/pricing?service=${found._id}&published=1`, { method:'GET' });
          if(mounted) setPlans(planItems||[]);
        }catch(_e){ if(mounted) setPlans([]); }
      }catch(err){ if(mounted) setError(err.message||'Failed to load service'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[slug]);

  return (
    <>
      <Navbar />
      <main className="container" style={{paddingTop:'2rem', paddingBottom:'2rem'}}>
        <div className="breadcrumbs" style={{marginBottom:'.75rem', color:'rgba(255,255,255,0.7)'}}>
          <Link to="/" style={{color:'rgba(255,255,255,0.7)'}}>Home</Link>
          <span> / </span>
          <Link to="/services" style={{color:'rgba(255,255,255,0.7)'}}>Services</Link>
          <span> / </span>
          <strong className="active" style={{color:'#ffffff', fontWeight:500}}>{service?.title || 'Service'}</strong>
        </div>

        {loading && <div className="card">Loading…</div>}
        {error && <div className="card" style={{color:'#ef4444'}}>{error}</div>}
        {!loading && !error && service && (
          <>
            <section className="card" style={{padding:'1.25rem'}}>
              <h1 style={{marginTop:0}}>{service.title}</h1>
              {service.icon && (
                <div style={{margin:'1rem 0'}}>
                  <img src={service.icon} alt="" style={{width:64,height:64,borderRadius:12,objectFit:'cover'}}/>
                </div>
              )}
              {service.description && <p style={{fontSize:'1.05rem', lineHeight:1.6}}>{service.description}</p>}
              {Array.isArray(service.features) && service.features.length>0 && (
                <div style={{marginTop:'1.5rem'}}>
                  <h3 style={{marginBottom:'.75rem'}}>Features</h3>
                  <ul style={{margin:'0.5rem 0 0 1.2rem', lineHeight:1.8}}>
                    {service.features.map((f,i)=>(<li key={i}>{f}</li>))}
                  </ul>
                </div>
              )}
            </section>

            <section style={{marginTop:'1.5rem'}}>
              <h2 style={{margin:'0 0 1rem 0'}}>Related Pricing</h2>
              {plans.length ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))',gap:'1.25rem'}}>
                  {plans.map(p => (
                    <article key={p._id} className="card" style={{padding:'1.5rem', display:'flex', flexDirection:'column', gap:'.75rem'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'.25rem'}}>
                        <h3 style={{margin:0, fontSize:'1.25rem'}}>{p.name}</h3>
                        {p.badge && <span className="badge">{p.badge}</span>}
                      </div>
                      <div style={{fontSize:'1.75rem', fontWeight:800, marginBottom:'.5rem'}}>
                        ${p.priceMonthly}
                        <span className="muted" style={{fontWeight:400, fontSize:'1rem'}}> /mo</span>
                      </div>
                      {Array.isArray(p.features) && p.features.length>0 && (
                        <ul style={{margin:'0 0 0 1.2rem', lineHeight:1.7, fontSize:'.95rem'}}>
                          {p.features.slice(0,6).map((f,i)=>(<li key={i} style={{marginBottom:'.35rem'}}>{f}</li>))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="card" style={{padding:'1.5rem', textAlign:'center'}}>
                  No pricing plans linked to this service yet.
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}