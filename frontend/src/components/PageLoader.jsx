import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function PageLoader() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);

  // Check if we are on an admin route
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Skip loader for admin routes as per requirements
    if (isAdmin) {
      setIsLoading(false);
      return;
    }

    // On route change, show the loader
    setIsLoading(true);

    // Wait for the new page to be ready and fade out.
    // A 600ms timer provides a smooth transition and serves as the max timeout.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname, isAdmin]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999, // Highest z-index
            backgroundColor: '#ffffff', // White background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Logo / Wordmark */}
          <div 
            style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: '#000000', 
              marginBottom: '24px', 
              letterSpacing: '-0.5px' 
            }}
          >
            Devugo Tech
          </div>

          {/* Loading Indicator */}
          {shouldReduceMotion ? (
            <div 
              style={{ 
                width: '120px', 
                height: '4px', 
                background: 'linear-gradient(90deg, #4385cd, #204188)', 
                borderRadius: '4px' 
              }} 
            />
          ) : (
            <div 
              style={{ 
                width: '160px', 
                height: '4px', 
                background: '#f3f4f6', 
                borderRadius: '4px', 
                overflow: 'hidden', 
                position: 'relative' 
              }}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #4385cd, #204188)',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
          
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ 
              marginTop: '16px', 
              color: '#6b7280', 
              fontSize: '14px', 
              fontWeight: 500 
            }}
          >
            Building something great...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
