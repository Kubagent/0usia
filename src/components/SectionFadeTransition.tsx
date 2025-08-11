'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Lightweight Section Fade Transition Component
 * 
 * Provides subtle, elegant animations as sections come into view:
 * - Gentle fade-in effects for content
 * - Smooth entrance animations that respect existing functionality
 * - Minimal performance overhead with optimized Intersection Observer
 * - Preserves all existing functionality while adding elegant transitions
 */

interface SectionFadeTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  enableScrollEffects?: boolean;
  id?: string;
}

const SectionFadeTransition: React.FC<SectionFadeTransitionProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  direction = 'up',
  distance = 30,
  enableScrollEffects = true,
  id,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use Framer Motion's useInView for optimal performance
  const isInView = useInView(ref, {
    once: true, // Animation triggers once when entering view
    margin: '-10% 0px -10% 0px', // Trigger when 10% into viewport
    amount: 0.2, // Trigger when 20% of element is visible
  });

  // Client-side hydration guard and mobile detection
  useEffect(() => {
    setIsClient(true);
    
    // Detect mobile devices for performance optimizations
    const checkIsMobile = () => {
      return window.innerWidth <= 768 || 
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    setIsMobile(checkIsMobile());
    
    // Listen for window resize to update mobile status
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Direction-based initial animation values
  const getInitialValues = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      case 'none':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const getAnimatedValues = () => {
    switch (direction) {
      case 'up':
        return { opacity: 1, y: 0 };
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
        return { opacity: 1, x: 0 };
      case 'right':
        return { opacity: 1, x: 0 };
      case 'none':
        return { opacity: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  // SSR-safe rendering - show content immediately on server
  if (!isClient) {
    return (
      <div className={className} id={id}>
        {children}
      </div>
    );
  }

  // Optimize animation parameters for mobile
  const optimizedDuration = isMobile ? Math.min(duration * 0.7, 0.6) : duration;
  const optimizedDelay = isMobile ? Math.min(delay * 0.5, 0.1) : delay;
  const optimizedDistance = isMobile ? Math.min(distance * 0.6, 20) : distance;

  return (
    <motion.div
      ref={ref}
      className={`section-fade-transition ${isMobile ? 'section-fade-mobile-optimized' : ''} ${className}`}
      id={id}
      initial={direction === 'none' ? { opacity: 0 } : { 
        opacity: 0, 
        [direction === 'up' || direction === 'down' ? 'y' : 'x']: 
          direction === 'up' || direction === 'right' ? optimizedDistance : -optimizedDistance 
      }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{
        duration: optimizedDuration,
        delay: optimizedDelay,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth ease-out curve
        type: "tween"
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Section Wrapper with Subtle Color Transition
 * 
 * Provides gentle color dip transitions between sections while preserving
 * the existing alternating black/white background pattern
 */

interface SectionWrapperProps {
  children: React.ReactNode;
  backgroundColor: string;
  className?: string;
  id?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  backgroundColor,
  className = '',
  id,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    margin: '-20% 0px -20% 0px', // More aggressive margin for color transitions
    amount: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      id={id}
      className={`section-wrapper ${className}`}
      style={{ backgroundColor }}
      initial={{ backgroundColor }}
      animate={{
        backgroundColor: isInView ? backgroundColor : backgroundColor,
      }}
      transition={{
        duration: 0.6,
        ease: "easeInOut"
      }}
    >
      <SectionFadeTransition>
        {children}
      </SectionFadeTransition>
    </motion.div>
  );
};

/**
 * Pre-configured variants for common section types
 */
export const SectionTransitionVariants = {
  // Hero section - subtle fade from below
  Hero: ({ children, className = '', id }: Omit<SectionFadeTransitionProps, 'direction' | 'delay'>) => (
    <SectionFadeTransition
      direction="up"
      duration={1.0}
      delay={0.2}
      distance={20}
      className={className}
      id={id}
    >
      {children}
    </SectionFadeTransition>
  ),

  // Content sections - gentle fade with minimal movement
  Content: ({ children, className = '', id }: Omit<SectionFadeTransitionProps, 'direction' | 'delay'>) => (
    <SectionFadeTransition
      direction="up"
      duration={0.8}
      delay={0.1}
      distance={15}
      className={className}
      id={id}
    >
      {children}
    </SectionFadeTransition>
  ),

  // Footer - fade in without movement
  Footer: ({ children, className = '', id }: Omit<SectionFadeTransitionProps, 'direction' | 'delay'>) => (
    <SectionFadeTransition
      direction="none"
      duration={0.6}
      delay={0}
      className={className}
      id={id}
    >
      {children}
    </SectionFadeTransition>
  ),
};

export default SectionFadeTransition;