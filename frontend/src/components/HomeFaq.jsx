import React, { useEffect, useState } from 'react';
import './HomeFaq.css';
import { ClientFaqAPI } from '../lib/api';

export default function HomeFaq(){
  const [open, setOpen] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        const { items } = await ClientFaqAPI.list({ published: true, limit: 6 });
        if(mounted){
          const mapped = Array.isArray(items) ? items
            .sort((a,b)=> (a.order||0) - (b.order||0))
            .slice(0, 6)
            .map(i=>({ q: i.question, a: i.answer })) : [];
          setItems(mapped);
        }
      }catch(_e){ setItems([]); }
    })();
    return ()=>{ mounted=false };
  },[]);
  if (!items.length) return null;
  return (
    <section className="home-faq" aria-labelledby="faq-title">
      <div className="container">
        <div className="faq-left">
          <h2 id="faq-title"><span>Frequently Asked</span><br/>Questions</h2>
          <p>Got questions? We've got answers. Explore our FAQs to find solutions to common queries. Need something specific? <a href="mailto:hello@devugo.tech">hello@devugo.tech</a></p>
        </div>
        <div className="faq-right">
          {items.map((item, i)=> (
            <div key={i} className={`faq-item ${open===i ? 'open' : ''}`}>
              <button className="faq-q" aria-expanded={open===i} onClick={()=> setOpen(open===i ? -1 : i)}>
                <span className="q-text">{item.q}</span>
                <span className="icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="16" height="16" role="img" focusable="false"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
              </button>
              <div className="faq-a"><p>{item.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
