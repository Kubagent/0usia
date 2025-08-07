import { motion, Variants, useAnimation } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export type AnimationType = 'fade' | 'fade-up' | 'crossfade' | 'slide-subtle' | 'reveal' | 'slide-down' | 'scale-in' | 'rotate-in';

interface AnimationVariants extends Variants {
  hidden: Record<string, any>;
  visible: Record<string, any>;
  exit: Record<string, any>;
}

const animationVariants: Record<AnimationType, AnimationVariants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.8, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      transition: { duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  'fade-up': {
    hidden: { opacity: 0, y: 64 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.8, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      y: -32,
      transition: { duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -64 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.8, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      y: 32,
      transition: { duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  crossfade: {
    hidden: { opacity: 0.2, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 2.2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0.2,
      filter: 'blur(4px)',
      transition: { duration: 1.5, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  'slide-subtle': {
    hidden: { opacity: 0, x: 48 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.8, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      x: -24,
      transition: { duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.8, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  'rotate-in': {
    hidden: { opacity: 0, rotate: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration: 2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      rotate: 3,
      scale: 0.98,
      transition: { duration: 1.4, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
  reveal: {
    hidden: { opacity: 0, scaleX: 0.92, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      scaleX: 1,
      filter: 'blur(0px)',
      transition: { duration: 2, ease: [0.6, -0.05, 0.01, 0.99] },
    },
    exit: {
      opacity: 0,
      scaleX: 0.96,
      filter: 'blur(2px)',
      transition: { duration: 1.4, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  },
};

interface SectionWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  reverseOnScroll?: boolean;
  viewportAmount?: number;
  enableExitAnimations?: boolean;
  debugMode?: boolean;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ 
  children, 
  animation = 'fade',
  reverseOnScroll = true,
  viewportAmount = 0.3,
  enableExitAnimations = true,
  debugMode = false,
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    amount: viewportAmount,
    margin: "0px 0px -20% 0px" // Start animation slightly before element is fully in view
  });
  
  const { direction, isScrolling } = useScrollDirection({
    threshold: 20,
    velocityThreshold: 1,
    idleDelay: 200,
  });

  // Respect user reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const variants = prefersReducedMotion ? animationVariants['fade'] : animationVariants[animation];

  useEffect(() => {
    if (debugMode) {
      console.log('SectionWrapper:', { isInView, direction, isScrolling, animation });
    }

    if (isInView) {
      controls.start('visible');
    } else if (enableExitAnimations && reverseOnScroll && !isInView) {
      controls.start('exit');
    } else if (!reverseOnScroll && !isInView) {
      controls.start('hidden');
    }
  }, [isInView, direction, isScrolling, controls, enableExitAnimations, reverseOnScroll, debugMode, animation]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className="w-full h-full focus:outline-none"
      style={{ 
        willChange: 'transform, opacity, filter',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
      tabIndex={-1}
      aria-live="polite"
    >
      {children}
    </motion.div>
  );
};

export default SectionWrapper;
