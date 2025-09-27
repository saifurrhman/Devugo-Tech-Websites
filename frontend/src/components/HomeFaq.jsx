import React, { useState } from 'react';
import './HomeFaq.css';

const QA = [
  { q: 'How does the process look like?', a: "We'll send you an onboarding form; after completing it you'll be invited to a Slack workspace for communication. We'll also schedule check-ins so we stay aligned." },
  { q: 'What\'s included in your UX/CRO Audit?', a: 'Redesigned sections, a 10+ page report, and a Loom walkthrough with clear next steps.' },
  { q: 'How long does it take to build a custom website or SaaS platform?', a: 'Typical projects ship in 7–30 days depending on scope and integrations.' },
  { q: 'Do you offer support after launch?', a: 'Yes. We provide maintenance and improvement plans with monthly reports.' },
  { q: 'What platforms do you work with?', a: 'React/Next.js for web apps, React Native for mobile. Shopify, Webflow, and Wix for platforms.' },
  { q: 'How many revisions do I get?', a: 'We iterate until it meets the agreed scope and quality. We move fast with clear feedback cycles.' },
];

export default function HomeFaq(){
  const [open, setOpen] = useState(0);
  return (
    <section className="home-faq" aria-labelledby="faq-title">
      <div className="container">
        <div className="faq-left">
          <h2 id="faq-title"><span>Frequently Asked</span><br/>Questions</h2>
          <p>Got questions? We've got answers. Explore our FAQs to find solutions to common queries. Need something specific? <a href="mailto:hello@devugo.tech">hello@devugo.tech</a></p>
        </div>
        <div className="faq-right">
          {QA.map((item, i)=> (
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
