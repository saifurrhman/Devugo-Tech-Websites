import React from 'react';
import './SkeletonCard.css';

export default function SkeletonCard({ variant = 'services' }) {
  if (variant === 'services') {
    return (
      <article className="skeleton-card-services">
        <div className="skeleton-shimmer" style={{ width: '60%', height: '24px', borderRadius: '4px', marginBottom: '16px' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '75%', height: '14px', borderRadius: '4px', marginBottom: 'auto' }} />
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <div className="skeleton-shimmer" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
          <div className="skeleton-shimmer" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
        </div>
      </article>
    );
  }

  if (variant === 'portfolio') {
    return (
      <article className="skeleton-card-portfolio">
        <div className="skeleton-shimmer" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', marginBottom: '9.6px' }} />
        <div className="skeleton-shimmer" style={{ width: '70%', height: '24px', borderRadius: '4px', marginBottom: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px', marginBottom: '8px' }} />
        
        <div className="skeleton-shimmer" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px', marginBottom: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '80%', height: '14px', borderRadius: '4px', marginBottom: '12px' }} />
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div className="skeleton-shimmer" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
          <div className="skeleton-shimmer" style={{ width: '50px', height: '24px', borderRadius: '12px' }} />
          <div className="skeleton-shimmer" style={{ width: '70px', height: '24px', borderRadius: '12px' }} />
        </div>

        <div className="skeleton-shimmer" style={{ width: '120px', height: '20px', borderRadius: '4px' }} />
      </article>
    );
  }

  if (variant === 'pricing') {
    return (
      <article className="skeleton-card-pricing">
        <div className="skeleton-shimmer" style={{ width: '50%', height: '28px', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="skeleton-shimmer" style={{ width: '80%', height: '16px', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '70%', height: '16px', borderRadius: '4px', marginBottom: '24px' }} />
        
        <div className="skeleton-shimmer" style={{ width: '40%', height: '40px', borderRadius: '4px', marginBottom: '32px' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-shimmer" style={{ width: `${80 - (i * 5)}%`, height: '16px', borderRadius: '4px' }} />
          ))}
        </div>
        
        <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '8px', marginTop: 'auto' }} />
      </article>
    );
  }

  if (variant === 'blog') {
    return (
      <article className="skeleton-card-blog">
        <div className="skeleton-shimmer" style={{ width: '100%', height: '220px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="skeleton-shimmer" style={{ width: '80px', height: '24px', borderRadius: '12px', marginBottom: '12px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div className="skeleton-shimmer" style={{ width: '90%', height: '28px', borderRadius: '4px', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.1)' }} />
          
          <div className="skeleton-shimmer" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div className="skeleton-shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div className="skeleton-shimmer" style={{ width: '75%', height: '14px', borderRadius: '4px', marginBottom: 'auto', background: 'rgba(255, 255, 255, 0.1)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="skeleton-shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div className="skeleton-shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'review') {
    return (
      <article className="skeleton-card-review">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-shimmer" style={{ width: '60%', height: '16px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div className="skeleton-shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="skeleton-shimmer" style={{ width: '16px', height: '16px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.1)' }} />
          ))}
        </div>

        <div className="skeleton-shimmer" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="skeleton-shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="skeleton-shimmer" style={{ width: '95%', height: '14px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="skeleton-shimmer" style={{ width: '70%', height: '14px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }} />
      </article>
    );
  }

  return null;
}
