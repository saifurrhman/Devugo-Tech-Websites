import React, { useEffect, useState, useRef } from 'react';

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
    onConfirm,
    onCancel
}) {
    const [inputValue, setInputValue] = useState('');
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type === 'prompt') {
            onConfirm(inputValue);
        } else {
            onConfirm(true);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            {/* Backdrop */}
            <div 
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
                onClick={onCancel}
            ></div>
            
            {/* Modal Card */}
            <div 
                className="card animate-in fade-in zoom-in-95" 
                style={{ 
                    position: 'relative', width: '100%', maxWidth: '450px', margin: 0, padding: 0, 
                    display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', zIndex: 10, overflow: 'hidden'
                }}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>{title}</h3>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: 0 }}>
                        &times;
                    </button>
                </div>

                {/* Body */}
                <form id="confirm-modal-form" onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {message && (
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: type === 'prompt' ? '1rem' : 0 }}>
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
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        {cancelText}
                    </button>
                    <button 
                        form="confirm-modal-form" 
                        type="submit" 
                        className={`btn ${variant === 'danger' ? 'danger' : ''}`}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
