import React, { useEffect, useRef, useState } from 'react';
import { ClientReviewAPI } from '../lib/api';

export default function ReviewsSection({ title = 'Client reviews', subtitle = 'What our clients say about working with us', limit = 9, featuredOnly = true, mode = 'grid' /* 'grid' | 'carousel' */ }){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const carouselRef = useRef(null); // always declare hooks at top level

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const params = featuredOnly ? { featured: true } : {};
        const { items } = await ClientReviewAPI.list(params);
        if(!mounted) return;
        setItems((items||[]).slice(0, limit));
      }catch(err){ if(mounted) setError(err.message||'Failed to load reviews'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[limit, featuredOnly]);

  if (loading) return (
    <section className="container" style={{marginTop:'2rem'}}>
      <div className="card">Loading reviews…</div>
    </section>
  );
  if (error || !items.length) return null;

  const pauseAndScroll = (delta) => {
    const el = carouselRef.current;
    if (!el) return;
    el.classList.add('paused');
    try{ el.scrollLeft += delta; }catch(_e){}
    setTimeout(()=> el.classList.remove('paused'), 1200);
  };

  if (mode === 'carousel'){
    const loop = [...items, ...items];
    return (
      <section className="container" style={{marginTop:'2rem'}} aria-label="Client reviews">
        <div className="pf-cat-head">
          <h2 className="pf-cat-title">{title}</h2>
          <p className="pf-cat-sub">{subtitle}</p>
        </div>
        <div ref={carouselRef} className="reviews-carousel" role="region" aria-roledescription="carousel" aria-label="Client reviews">
          <div className="reviews-track">
            {loop.map((r, idx)=> (
              <article key={(r._id||idx)+':c'} className="review-card rc">
                <div className="review-head">
                  <div className="review-person">
                    {r.avatar ? (
                      <img src={r.avatar} alt={r.name} className="review-avatar" />
                    ) : (
                      <div className="review-avatar placeholder" aria-hidden>{String(r.name||'?').slice(0,1).toUpperCase()}</div>
                    )}
                    <div>
                      <strong className="review-name">{r.name}</strong>
                      <div className="review-meta">{[r.role, r.company].filter(Boolean).join(' • ')}</div>
                    </div>
                  </div>
                  <div className="review-stars" aria-label={`${r.rating||5} out of 5`}>
                    {'★★★★★'.slice(0, r.rating||5)}
                  </div>
                </div>
                {r.summary && <p className="review-summary">{r.summary}</p>}
              </article>
            ))}
          </div>
          <button type="button" className="reviews-arrow left" aria-label="Previous" onClick={()=>pauseAndScroll(-360)}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" className="reviews-arrow right" aria-label="Next" onClick={()=>pauseAndScroll(360)}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{marginTop:'2rem'}} aria-label="Client reviews">
      <div className="pf-cat-head">
        <h2 className="pf-cat-title">{title}</h2>
        <p className="pf-cat-sub">{subtitle}</p>
      </div>
      <div className="reviews-grid" style={{marginTop:'1rem'}}>
        {items.map((r)=> (
          <article key={r._id} className="review-card">
            <div className="review-head">
              <div className="review-person">
                {r.avatar ? (
                  <img src={r.avatar} alt={r.name} className="review-avatar" />
                ) : (
                  <div className="review-avatar placeholder" aria-hidden>{String(r.name||'?').slice(0,1).toUpperCase()}</div>
                )}
                <div>
                  <strong className="review-name">{r.name}</strong>
                  <div className="review-meta">{[r.role, r.company].filter(Boolean).join(' • ')}</div>
                </div>
              </div>
              <div className="review-stars" aria-label={`${r.rating||5} out of 5`}>
                {'★★★★★'.slice(0, r.rating||5)}
              </div>
            </div>
            {r.summary && <p className="review-summary">{r.summary}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
