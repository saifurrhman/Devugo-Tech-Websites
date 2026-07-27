import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from '../admin/components/ConfirmModal';

const ConfirmContext = createContext();

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}

export function ConfirmProvider({ children }) {
    const [state, setState] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm' | 'prompt'
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        variant: 'default', // 'default' | 'danger'
        defaultValue: '',
        inputPlaceholder: ''
    });

    // We use a ref to store the promise resolution functions
    // so they persist across renders without causing infinite loops.
    const promiseRef = useRef({ resolve: null, reject: null });

    const show = useCallback((options) => {
        return new Promise((resolve, reject) => {
            promiseRef.current = { resolve, reject };
            setState({
                isOpen: true,
                type: 'confirm',
                title: options.title || 'Confirm',
                message: options.message || '',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                variant: options.variant || 'default',
                defaultValue: '',
                inputPlaceholder: ''
            });
        });
    }, []);

    const prompt = useCallback((options) => {
        return new Promise((resolve, reject) => {
            promiseRef.current = { resolve, reject };
            setState({
                isOpen: true,
                type: 'prompt',
                title: options.title || 'Prompt',
                message: options.message || '',
                confirmText: options.confirmText || 'Submit',
                cancelText: options.cancelText || 'Cancel',
                variant: options.variant || 'default',
                defaultValue: options.defaultValue || '',
                inputPlaceholder: options.inputPlaceholder || ''
            });
        });
    }, []);

    const handleConfirm = useCallback((value) => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (promiseRef.current.resolve) {
            promiseRef.current.resolve(value !== undefined ? value : true);
            promiseRef.current.resolve = null;
        }
    }, []);

    const handleCancel = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (promiseRef.current.resolve) {
            promiseRef.current.resolve(state.type === 'prompt' ? null : false);
            promiseRef.current.resolve = null;
        }
    }, [state.type]);

    return (
        <ConfirmContext.Provider value={{ show, prompt }}>
            {children}
            <ConfirmModal
                isOpen={state.isOpen}
                type={state.type}
                title={state.title}
                message={state.message}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                variant={state.variant}
                defaultValue={state.defaultValue}
                inputPlaceholder={state.inputPlaceholder}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}
