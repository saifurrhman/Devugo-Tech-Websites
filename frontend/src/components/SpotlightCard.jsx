import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export default function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);
  const [hasMouse, setHasMouse] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) setHasMouse(false);
  }, []);

  const handleMouseMove = (e) => {
    if (!hasMouse || !ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-soft border border-brand-border transition-colors hover:border-brand-border ${className}`}
    >
      {/* Background Spotlight Glow */}
      {hasMouse && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                450px circle at ${mouseX}px ${mouseY}px,
                rgba(36, 84, 255, 0.1),
                transparent 80%
              )
            `,
          }}
        />
      )}
      
      {/* Border Spotlight Glow */}
      {hasMouse && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                200px circle at ${mouseX}px ${mouseY}px,
                rgba(109, 140, 255, 0.4),
                transparent 80%
              )
            `,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      )}
      
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
