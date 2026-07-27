import React from 'react';
import Spinner from '../../components/Spinner';

export default function LoadingState({ message = 'Loading...', minHeight = '300px' }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: minHeight,
        padding: '3rem',
        textAlign: 'center'
      }}
    >
      <Spinner size="lg" color="var(--color-primary, #3b82f6)" className="mb-4" />
      {message && (
        <p style={{ color: 'var(--admin-muted, #9ca3af)', fontWeight: 500, marginTop: '1rem' }}>
          {message}
        </p>
      )}
    </div>
  );
}
