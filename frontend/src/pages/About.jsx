import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './About.css';
import { TeamAPI } from '../lib/api';

export default function About() {
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState('');
  useEffect(()=>{
    const els = Array.from(document.querySelectorAll('.about-page .reveal'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { threshold:.12, rootMargin:'0px 0px -10% 0px' });
    els.forEach(el=> io.observe(el));
    return ()=> io.disconnect();
  }, []);

  // Load a subset of team members for About page showcase
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setTeamLoading(true); setTeamError('');
      try{
        const { members } = await TeamAPI.list();
        if(mounted) setTeam((members||[]).slice(0,6));
      }catch(err){ if(mounted) setTeamError(err.message||'Failed to load team'); }
      finally{ if(mounted) setTeamLoading(false); }
    })();
    return ()=>{ mounted = false };
  },[]);

  const values = [
    { title:'Ownership', desc:'We act like partners. Clear scope, clear timelines, reliable delivery.' },
    { title:'Velocity', desc:'Ship fast with quality using modern stacks, patterns and CI.' },
    { title:'Clarity', desc:'Simple communication, transparent pricing, measurable outcomes.' },
    { title:'Craft', desc:'Design and code that feel premium — performant and accessible.' },
    { title:'Care', desc:'We sweat the details and support you after launch.' },
    { title:'Integrity', desc:'No fluff. We advise honestly and build what you really need.' }
  ];

  const steps = [
    { n:'01', t:'Discovery', d:'Goals, users, constraints. Align on success.' },
    { n:'02', t:'Plan', d:'Scope, timeline, milestones, pricing.' },
    { n:'03', t:'Design', d:'Wireframes, UI, interactions, copy.' },
    { n:'04', t:'Build', d:'Iterative dev with reviews and QA.' },
    { n:'05', t:'Launch', d:'Deploy, monitor, handover docs.' },
    { n:'06', t:'Improve', d:'Support, analytics, enhancements.' },
  ];

  return (
    <>
      <Navbar />
      <main className="about-page">
        {/* 1. Hero */}
        <section className="about-hero" aria-labelledby="about-title">
          <div className="container">
            <span className="eyebrow"><span className="dot"/> About</span>
            <h1 id="about-title" className="reveal">We build products people love</h1>
            <p className="sub reveal">A small, senior team crafting fast, premium websites and apps with a single blue design system across the stack.</p>
            <div className="actions reveal">
              <a href="/portfolio" className="btn">View work</a>
              <a href="/contact" className="btn outline">Start a project</a>
            </div>
          </div>
        </section>

        {/* 2. Mission / Vision */}
        <section className="about-mission" aria-labelledby="mission-title">
          <div className="container grid2">
            <div className="block reveal">
              <h2 id="mission-title">Our mission</h2>
              <p>Ship impactful digital products quickly — without sacrificing polish — so you can validate, grow, and win.</p>
            </div>
            <div className="block reveal">
              <h2>Our vision</h2>
              <p>A world where small teams deliver enterprise‑level quality at startup speed using smart systems and AI.</p>
            </div>
          </div>
        </section>

        {/* 3. Values */}
        <section className="about-values" aria-labelledby="values-title">
          <div className="container">
            <h2 id="values-title" className="reveal">Values that guide our work</h2>
            <p className="intro reveal">The principles that shape how we plan, design and build — so your project ships fast and feels premium.</p>
            <div className="values-grid">
              {values.map((v,i)=> (
                <article key={i} className="value reveal" style={{transitionDelay:`${i*50}ms`}}>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Stats */}
        <section className="about-stats" aria-label="Milestones">
          <div className="container stats-grid">
            <div className="stat reveal"><strong>50+</strong><span>Projects shipped</span></div>
            <div className="stat reveal"><strong>95%</strong><span>Clients recommend</span></div>
            <div className="stat reveal"><strong>7–30d</strong><span>Typical timeline</span></div>
            <div className="stat reveal"><strong>100%</strong><span>In‑house team</span></div>
          </div>
        </section>

        {/* 5. Process */}
        <section className="about-process" aria-labelledby="process-title">
          <div className="container">
            <h2 id="process-title" className="reveal">A clear, reliable process</h2>
            <div className="steps">
              {steps.map((s,i)=> (
                <div className="step reveal" key={i} style={{transitionDelay:`${i*60}ms`}}>
                  <span className="num">{s.n}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Team teaser */}
        <section className="about-team" aria-labelledby="team-title">
          <div className="container grid2">
            <div className="block reveal">
              <h2 id="team-title">Small, senior, focused</h2>
              <p>We’re a compact team of designers and engineers who ship. No layers. Direct access. Fast feedback.</p>
              <a className="btn outline" href="/contact">Work with us</a>
            </div>
            <div className="block reveal">
              <ul className="badge-list">
                <li>Web & App</li>
                <li>AI Solutions</li>
                <li>Platforms (Shopify/Webflow/Wix)</li>
                <li>CRM & Integrations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6b. Team grid (About page) */}
        {/* <section className="about-team-grid" aria-labelledby="team-grid-title">
          <div className="container">
            <h2 id="team-grid-title" className="reveal">Meet the team</h2>
            {teamLoading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
            {teamError && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{teamError}</div>}
            {!teamLoading && !teamError && (
              team.length ? (
                <div className="grid three" style={{marginTop:'1rem'}}>
                  {team.map(m => (
                    <article key={m._id} className="card reveal" style={{display:'grid',gap:'.5rem'}}>
                      {m.avatar && <img src={m.avatar} alt={m.name} style={{width:'100%',borderRadius:'12px'}} />}
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.5rem'}}>
                        <h3 style={{margin:0}}>{m.name}</h3>
                        <span className="badge">{m.role||'Member'}</span>
                      </div>
                      {m.bio && <p style={{margin:0}}>{m.bio}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="card" style={{marginTop:'1rem'}}>No team members yet.</div>
              )
            )}
            <div style={{marginTop:'1.25rem'}}>
              <a className="btn" href="/team">View full team</a>
            </div>
          </div>
        </section> */}

        {/* 7. CTA */}
        <section className="about-cta" aria-labelledby="cta-title">
          <div className="container">
            <h2 id="cta-title" className="reveal">Ready to make your business standout?</h2>
            <p className="sub reveal">Book a quick discovery call — we’ll scope your project and share a clear plan and timeline.</p>
            <a href="/contact" className="btn reveal">Book a 30‑minute Discovery Call</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
