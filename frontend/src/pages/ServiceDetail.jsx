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
        <div className="breadcrumbs" style={{marginBottom:'.75rem'}}>
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to="/services">Services</Link>
          <span> / </span>
          <strong className="active">{service?.title || 'Service'}</strong>
        </div>

        {loading && <div className="card">Loading…</div>}
        {error && <div className="card" style={{color:'#ef4444'}}>{error}</div>}
        {!loading && !error && service && (
          <>
            <section className="card" style={{padding:'1.25rem'}}>
              <h1 style={{marginTop:0}}>{service.title}</h1>
              {service.icon && (
                <div style={{margin:'0 0 .75rem 0'}}>
                  <img src={service.icon} alt="" style={{width:48,height:48,borderRadius:10,objectFit:'cover'}}/>
                </div>
              )}
              {service.description && <p style={{fontSize:'1.05rem', lineHeight:1.6}}>{service.description}</p>}
              {Array.isArray(service.features) && service.features.length>0 && (
                <div style={{marginTop:'.75rem'}}>
                  <h3 style={{margin:0}}>Features</h3>
                  <ul style={{margin:'0.5rem 0 0 1.2rem'}}>
                    {service.features.map((f,i)=>(<li key={i}>{f}</li>))}
                  </ul>
                </div>
              )}
            </section>

            <section style={{marginTop:'1rem'}}>
              <h2 style={{margin:'0 0 .5rem 0'}}>Related Pricing</h2>
              {plans.length ? (
                <div className="grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))',gap:'1rem'}}>
                  {plans.map(p => (
                    <article key={p._id} className="card" style={{padding:'1rem', display:'grid', gap:'.5rem'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                        <h3 style={{margin:0}}>{p.name}</h3>
                        {p.badge && <span className="badge">{p.badge}</span>}
                      </div>
                      <div style={{fontSize:'1.25rem', fontWeight:800}}>${p.priceMonthly}<span className="muted" style={{fontWeight:400, fontSize:'.95rem'}}> /mo</span></div>
                      {Array.isArray(p.features) && p.features.length>0 && (
                        <ul style={{margin:'.25rem 0 0 1.1rem'}}>
                          {p.features.slice(0,6).map((f,i)=>(<li key={i}>{f}</li>))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="card">No pricing plans linked to this service yet.</div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
