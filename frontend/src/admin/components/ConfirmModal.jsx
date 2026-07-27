import React, { useEffect, useState, useRef } from 'react';
import Spinner from '../../../components/Spinner';

export default function ConfirmModal({
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    defaultValue,
    inputPlaceholder,
    action,
    onConfirm,
    onCancel
}) {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue || '');
            if (type === 'prompt' && inputRef.current) {
                // Slight delay to ensure it's rendered
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 50);
            }
        }
    }, [isOpen, type, defaultValue]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (action) {
            try {
                setLoading(true);
                await action(type === 'prompt' ? inputValue : true);
            } catch (err) {
                console.error("ConfirmModal action failed:", err);
            } finally {
                setLoading(false);
                onConfirm(type === 'prompt' ? inputValue : true);
            }
        } else {
            if (type === 'prompt') {
                onConfirm(inputValue);
            } else {
                onConfirm(true);
            }
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            {/* Backdrop */}
            <div 
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', transition: 'opacity 0.2s ease-in-out' }} 
                onClick={onCancel}
            ></div>
            
            {/* Modal Card */}
            <div 
                className="card" 
                style={{ 
                    position: 'relative', width: '100%', maxWidth: '450px', margin: 0, padding: 0, 
                    display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', zIndex: 10, overflow: 'hidden',
                    animation: 'scaleIn 0.2s ease-out forwards'
                }}
                role="dialog"
                aria-modal="true"
            >
                <style>
                    {`
                    @keyframes scaleIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    `}
                </style>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {variant === 'danger' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                            </div>
                        )}
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{title}</h3>
                    </div>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem', transition: 'color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                        &times;
                    </button>
                </div>

                {/* Body */}
                <form id="confirm-modal-form" onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {message && (
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: type === 'prompt' ? '1.25rem' : 0 }}>
                            {message}
                        </p>
                    )}
                    
                    {type === 'prompt' && (
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-field"
                            placeholder={inputPlaceholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{ width: '100%', marginTop: message ? '0.5rem' : 0 }}
                        />
                    )}
                </form>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                        {cancelText}
                    </button>
                    <button 
                        form="confirm-modal-form" 
                        type="submit" 
                        disabled={loading}
                        className={`btn ${variant === 'danger' ? 'danger' : ''}`}
                        style={{ 
                            padding: '0.5rem 1.25rem',
                            background: variant === 'danger' ? '#dc2626' : undefined,
                            borderColor: variant === 'danger' ? '#dc2626' : undefined,
                            color: variant === 'danger' ? '#fff' : undefined,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading && variant === 'danger') {
                                e.currentTarget.style.background = '#b91c1c';
                                e.currentTarget.style.borderColor = '#b91c1c';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading && variant === 'danger') {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.borderColor = '#dc2626';
                            }
                        }}
                    >
                        {loading && <Spinner size="sm" />}
                        <span>{loading ? 'Processing...' : confirmText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
