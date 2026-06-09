'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Wraps a section so its content drifts gently on scroll (parallax connective tissue).
// Intentionally does NOT fade the background — alternating black/white stays solid
// and the motion is felt only in the content layer.
export default function SectionTransition({ children, className = '' }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 28, mass: 0.8 });

  // Very subtle upward drift as section scrolls through: enters from +20px, exits to -20px.
  // Kept tight so it reads as elegance, not movement.
  const translateY = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [20, 0, 0, -20]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ translateY, willChange: 'transform' }}>
        {children}
      </motion.div>
    </div>
  );
}
