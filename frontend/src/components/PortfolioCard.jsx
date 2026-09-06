import React from 'react';
import { Link } from 'react-router-dom';

export default function PortfolioCard({ project, className = '' }) {
  if (!project) return null;

  const { _id, slug, title, client, description, thumbnails, techStack, tags, url } = project;
  const image = thumbnails?.[0];
  const badgeList = (techStack && techStack.length > 0) ? techStack : (tags || []);

  return (
    <article className={`portfolio-project-card ${className}`}>
      {image ? (
        <div className="portfolio-card-image-wrap">
          <img
            src={image}
            alt={title || 'Project thumbnail'}
            className="portfolio-card-image"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="portfolio-card-image-wrap fallback-wrap">
          <div className="portfolio-card-image-placeholder">
            <span>{title ? title.charAt(0) : 'P'}</span>
          </div>
        </div>
      )}
      
      <div className="portfolio-card-body">
        <h3 className="portfolio-card-title" title={title}>
          {title || 'Untitled Project'}
        </h3>
        
        <span className="portfolio-card-client">
          {client ? `Client: ${client}` : '\u00A0'}
        </span>

        <p className="portfolio-card-desc">
          {description || 'No description available for this project.'}
        </p>

        <div className="portfolio-card-badges">
          {badgeList.length > 0 ? (
            badgeList.slice(0, 3).map((t, idx) => (
              <span key={idx} className="portfolio-badge">{String(t)}</span>
            ))
          ) : (
            <span className="portfolio-badge empty-badge">&nbsp;</span>
          )}
        </div>

        <div className="portfolio-card-actions">
          <Link
            to={`/portfolio/${slug || _id}`}
            className="portfolio-pill-btn"
          >
            <span className="btn-arrow-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
            <span>View project</span>
            <span className="btn-arrow-text">→</span>
          </Link>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link-out"
              title="Visit Live Site"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
