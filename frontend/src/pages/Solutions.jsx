import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Solutions.css';
import SEO from '../components/SEO';

export default function Solutions(){
  const solutions = [
    {
      title: 'AI Solutions',
      desc: 'AI call agents, custom LLM features, and automation to scale ops and support.',
      href: '#ai'
    },
    {
      title: 'Web Platforms',
      desc: 'Shopify, Webflow, and Wix builds with performance, SEO, and conversions in mind.',
      href: '#platforms'
    },
    {
      title: 'Custom Development',
      desc: 'Full‑stack apps, custom CRM systems, and integrations designed around your business.',
      href: '#custom'
    },
  ];

  useEffect(()=>{
    const els = Array.from(document.querySelectorAll('.reveal'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    els.forEach(el=> io.observe(el));
    return ()=> io.disconnect();
  }, []);

  return (
    <>
      <SEO
        title="AI SaaS & Custom MVP Solutions | Devugo Tech"
        description="Launch your software startup fast. We provide custom MVP development and AI SaaS solutions tailored for software companies and tech founders."
        url="/solutions"
      />
      <Navbar />
      <section className="sol-hero" aria-labelledby="sol-title">
        <div className="container">
          <span className="eyebrow"><span className="dot"/> Solutions</span>
          <h1 id="sol-title">Purpose‑built solutions that ship fast</h1>
          <p className="sub">From idea to launch — we craft high‑performing experiences for AI, e‑commerce, and SaaS with a focus on speed, quality, and results.</p>
          <div className="actions">
            <a className="btn" href="#packages">Explore packages</a>
            <a className="btn outline" href="/contact">Get a quote</a>
          </div>
        </div>
      </section>

      <section id="packages" className="sol-grid" aria-label="Solution categories">
        <div className="container grid">
          {solutions.map((s, i)=> (
            <a key={i} className="card reveal" href={s.href}>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="link">Learn more →</span>
            </a>
          ))}
        </div>
      </section>

      {/* Detailed modules */}
      <section id="ai" className="sol-module reveal" aria-labelledby="ai-title">
        <div className="container">
          <h2 id="ai-title">AI solutions that work from day one</h2>
          <p className="lead">Ship real value with AI: voice agents that answer calls 24/7, assistants that close tickets, and automations that remove manual work.</p>
          <div className="module-grid">
            <div className="feature">
              <h3>AI Call Agent</h3>
              <p>Answer inbound calls, qualify leads, schedule, and provide instant answers — fully integrated with your CRM and calendar.</p>
            </div>
            <div className="feature">
              <h3>Custom AI Assistant</h3>
              <p>LLM‑powered chat or email assistants for support and sales that know your knowledge base and tone.</p>
            </div>
            <div className="feature">
              <h3>Intelligent Automation</h3>
              <p>Workflows that connect your tools — extract data, summarize, route, and trigger actions automatically.</p>
            </div>
          </div>
          <div className="steps">
            <div className="step"><span className="num">1</span><span>Discovery & use‑cases</span></div>
            <div className="step"><span className="num">2</span><span>Prototype in 7–10 days</span></div>
            <div className="step"><span className="num">3</span><span>Integrate & launch</span></div>
          </div>
          <div className="actions center">
            <a className="btn" href="/contact">Start AI project</a>
            <a className="btn outline" href="/services#services">See related services</a>
          </div>
        </div>
      </section>

      <section id="platforms" className="sol-module reveal" aria-labelledby="plat-title">
        <div className="container">
          <h2 id="plat-title">Web platforms built to convert</h2>
          <p className="lead">Launch fast on Shopify, Webflow, or Wix with clean design, performance, and SEO baked in.</p>
          <div className="module-grid">
            <div className="feature"><h3>Shopify</h3><p>Custom themes, app integrations, and optimized checkout to lift conversions.</p></div>
            <div className="feature"><h3>Webflow</h3><p>Pixel‑perfect sites with CMS, animations, and enterprise‑grade performance.</p></div>
            <div className="feature"><h3>Wix</h3><p>Beautiful sites with custom components and SEO best practices.</p></div>
          </div>
          <div className="actions center">
            <a className="btn" href="/contact">Launch my site</a>
            <a className="btn outline" href="/portfolio">View work</a>
          </div>
        </div>
      </section>

      <section id="custom" className="sol-module reveal" aria-labelledby="custom-title">
        <div className="container">
          <h2 id="custom-title">Custom development for your roadmap</h2>
          <p className="lead">From MVPs to full‑scale products — we design, build, and ship reliably with modern stacks.</p>
          <div className="module-grid">
            <div className="feature"><h3>CRM systems</h3><p>Tailored pipelines, automations, and reporting designed around your team.</p></div>
            <div className="feature"><h3>Web apps</h3><p>Secure, scalable apps with clean UI/UX and analytics built‑in.</p></div>
            <div className="feature"><h3>Integrations</h3><p>Connect your tools and data sources to streamline operations.</p></div>
          </div>
          <div className="actions center">
            <a className="btn" href="/contact">Plan my build</a>
            <a className="btn outline" href="/services#services">Browse services</a>
          </div>
        </div>
      </section>

      <section className="sol-cta" aria-labelledby="cta-title">
        <div className="container">
          <h2 id="cta-title">Have a project in mind?</h2>
          <p>We’ll help you scope it quickly and provide a plan that matches your timelines and budget.</p>
          <a className="btn lg" href="/contact">Start a project</a>
        </div>
      </section>
      <Footer />
    </>
  );
}
