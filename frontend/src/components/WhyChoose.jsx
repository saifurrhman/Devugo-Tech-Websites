import React, { useEffect, useRef, useState } from 'react';
import './WhyChoose.css';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
        <path d="M18 8a6 6 0 0 1-12 0v-.5a2.5 2.5 0 0 1 5 0V8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Seamless Communication',
    desc: 'Stay connected with our team on Slack for ongoing collaboration and regular updates.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
        <path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Timely Project Updates',
    desc: 'Regular progress updates to stay informed at every stage of your project.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Satisfaction Guarantee',
    desc: "If our work doesn't meet expectations, we\u2019ll provide a refund \u2014 no questions asked!"
  }
];

export default function WhyChoose(){
  const stickyRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(()=>{
    function onScroll(){
      const el = stickyRef.current;
      if(!el) return;
      const rect = el.parentElement.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Start effect when the section reaches ~70% of viewport (near bottom)
      const start = vh * 0.7;
      const end = Math.max(rect.height - vh * 0.2, 1);
      const y = Math.min(Math.max(-rect.top + start, 0), end);
      const p = end > 0 ? y / end : 0;
      setProgress(p);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return ()=>{
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // derived styles: grow card, move up, reduce radius as progress increases
  const scale = 0.9 + progress * 0.1; // 0.9 -> 1.0
  const translateY = 80 - progress * 80; // rises up from ~80px below
  const radius = 28 - Math.floor(progress * 18); // 28px -> 10px
  const shadowOpacity = 0.16 + progress * 0.16; // stronger as it grows
  const opacity = 0.6 + progress * 0.4; // 0.6 -> 1

  return (
    <section className="why-wrap" aria-labelledby="why-title">
      <div className="why-stage">
        <div className="why-sticky" ref={stickyRef} style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          borderRadius: `${radius}px`,
          boxShadow: `0 20px 60px rgba(0,0,0,${shadowOpacity})`,
          opacity
        }}>
          <div className="container">
            <header className="why-head">
              <h2 id="why-title">Why Choose Us?</h2>
              <p className="why-sub">With established SOPs for seamless operations, we ensure efficiency, quality, and consistent results in every project. Trust our proven process to deliver exceptional results.</p>
            </header>

            <div className="why-grid">
              {FEATURES.map((f, i)=> (
                <article key={i} className="why-card" style={{animationDelay: `${i*80}ms`, '--d': `${i*120}ms`}}>
                  <div className="why-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
