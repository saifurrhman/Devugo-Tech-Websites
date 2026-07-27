import React from 'react';

export default function EmptyState({ 
    icon, 
    title, 
    description, 
    ctaText, 
    onCtaClick 
}) {
    return (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '3rem 2rem' }}>
            {icon && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.4)' }}>
                    {icon}
                </div>
            )}
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
            {description && (
                <p style={{ opacity: 0.7, marginTop: '0.5rem', marginBottom: ctaText ? '1.5rem' : 0, maxWidth: '400px', marginInline: 'auto' }}>
                    {description}
                </p>
            )}
            {ctaText && onCtaClick && (
                <button onClick={onCtaClick} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {ctaText}
                </button>
            )}
        </div>
    );
}
