import React from 'react';

export default function PageHero({
  eyebrow = '',
  title,
  subtitle = '',
  primary = { href: '/contact', label: 'Start a project' },
  secondary = { href: '/portfolio', label: 'View work' },
}){
  return (
    <section className="page-hero" aria-labelledby="page-hero-title">
      <div className="container">
        {eyebrow && <span className="eyebrow"><span className="dot"/> {eyebrow}</span>}
        <h1 id="page-hero-title">{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
        <div className="actions">
          {primary && <a className="btn" href={primary.href}>{primary.label}</a>}
          {secondary && <a className="btn outline" href={secondary.href}>{secondary.label}</a>}
        </div>
      </div>
    </section>
  );
}
