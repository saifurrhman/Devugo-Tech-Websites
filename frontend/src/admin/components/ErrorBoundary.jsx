import React from 'react';

/**
 * AdminErrorBoundary
 * Wraps admin page content so that an unhandled render error never
 * crashes the navigation shell (AdminSidebar + AdminTopbar).
 *
 * Usage:
 *   <AdminErrorBoundary>
 *     <PageComponent />
 *   </AdminErrorBoundary>
 */
export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[AdminErrorBoundary] Caught render error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--admin-text, #e2e8f0)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '1rem', opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, maxWidth: '320px', marginBottom: '1.25rem' }}>
            {this.state.error?.message || 'An unexpected error occurred loading this page.'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--admin-border, #334155)',
              background: 'var(--admin-surface, #1e293b)',
              color: 'var(--admin-text, #e2e8f0)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
