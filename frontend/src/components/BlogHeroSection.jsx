import React from 'react';
import './BlogHero.css';  // This should work since both files are in the same folder

export default function BlogHero() {
  return (
    <section className="blog-hero" aria-labelledby="blog-hero-title">
      <div className="container">
        <span className="eyebrow">
          <span className="dot" /> Blog
        </span>
        <h1 id="blog-hero-title">Insights on building great products</h1>
        <p className="sub">
          Behind‐the‐scenes stories, technical deep‐dives, and practical advice on shipping fast, building better, and scaling smart.
        </p>
        
        <div className="actions">
          <a href="#latest" className="btn">
            Latest posts
          </a>
          <a href="#topics" className="btn outline">
            Browse topics
          </a>
        </div>
      </div>
    </section>
  );
}