import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ClientFaqAPI } from '../lib/api';
import '../components/HomeFaq.css';

export default function Faq(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openKey, setOpenKey] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await ClientFaqAPI.list({ published: true });
        if(mounted) setItems(items||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load FAQs'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const groups = useMemo(()=>{
    const byCat = new Map();
    for(const it of items){
      const cat = (it.category||'General').trim() || 'General';
      if(!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(it);
    }
    for(const arr of byCat.values()) arr.sort((a,b)=> (a.order||0)-(b.order||0));
    return Array.from(byCat.entries());
  },[items]);

  const toggle = (key) => setOpenKey(k=> k===key ? '' : key);

  return (
    <>
      <Navbar />
      <section className="home-faq" aria-labelledby="faq-title" style={{paddingTop:'2rem'}}>
        <div className="container">
          <div className="faq-left">
            <h1 id="faq-title"><span>Frequently Asked</span><br/>Questions</h1>
            <p>Browse all our FAQs by category. If you can’t find what you need, email <a href="mailto:hello@devugo.tech">hello@devugo.tech</a>.</p>
          </div>
          <div className="faq-right">
            {loading && <div className="card">Loading…</div>}
            {error && <div className="card" style={{color:'#ef4444'}}>{error}</div>}
            {!loading && !error && groups.map(([cat, arr])=> (
              <div key={cat} style={{marginBottom:'1rem'}}>
                <h3 style={{margin:'0 0 .5rem'}}>{cat}</h3>
                {arr.map((it)=>{
                  const key = `${cat}:${it._id}`;
                  const open = openKey === key;
                  return (
                    <div key={key} className={`faq-item ${open? 'open':''}`}>
                      <button className="faq-q" aria-expanded={open} onClick={()=>toggle(key)}>
                        <span className="q-text">{it.question}</span>
                        <span className="icon" aria-hidden>
                          <svg viewBox="0 0 24 24" width="16" height="16" role="img" focusable="false"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </span>
                      </button>
                      <div className="faq-a"><p>{it.answer}</p></div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
