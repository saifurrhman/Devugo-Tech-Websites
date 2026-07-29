import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagneticButton({
  children,
  className = '',
  magneticPull = 0.5,
  springConfig = { stiffness: 150, damping: 15, mass: 0.1 },
  as = 'button',
  ...props
}) {
  const ref = useRef(null);
  const [hasMouse, setHasMouse] = useState(true);

  // Check if touch device to disable mouse interactions
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) setHasMouse(false);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!hasMouse || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * magneticPull);
    y.set(distanceY * magneticPull);
  };

  const handleMouseLeave = () => {
    if (!hasMouse) return;
    x.set(0);
    y.set(0);
  };

  const Tag = motion[as] || motion.div;

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
