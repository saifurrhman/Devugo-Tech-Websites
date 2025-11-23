import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 3000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const value = {
        notify: addNotification,
        success: (msg) => addNotification(msg, 'success'),
        error: (msg) => addNotification(msg, 'error'),
        info: (msg) => addNotification(msg, 'info'),
        warning: (msg) => addNotification(msg, 'warning')
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`
                            pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
                            flex items-center gap-3 text-sm font-medium animate-in slide-in-from-right fade-in
                            ${notification.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : ''}
                            ${notification.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : ''}
                            ${notification.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : ''}
                            ${notification.type === 'info' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : ''}
                            bg-[#1e293b] border border-gray-800 text-white
                        `}
                    >
                        <span className="text-lg">
                            {notification.type === 'success' && '✓'}
                            {notification.type === 'error' && '✕'}
                            {notification.type === 'warning' && '⚠'}
                            {notification.type === 'info' && 'ℹ'}
                        </span>
                        <p>{notification.message}</p>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-auto text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}
