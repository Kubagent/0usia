/**
 * Enhanced Hero Section Component
 * 
 * Integrates the original V3 Hero functionality with the new background transition
 * system for improved performance and consistency across sections.
 * 
 * Preserves all V3 features:
 * - Large-scale logo display (600x600px)
 * - Scroll-triggered white→black background transition
 * - Logo color inversion on scroll (black→white logo)
 * - Precise 40% scroll progress timing
 * - Debug logging for scroll progress
 * 
 * Enhancements:
 * - Integration with BackgroundTransitionManager
 * - Performance monitoring and optimization
 * - Hardware-accelerated transitions
 * - Accessibility improvements
 * - Better error handling and cleanup
 */

'use client';

import { useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useBackgroundTransitionSection } from '../BackgroundTransitionManager';
import { getTransitionProfiler } from '../../utils/backgroundTransitionProfiler';

interface EnhancedHeroProps {
  /** Enable performance profiling */
  enableProfiling?: boolean;
  /** Custom logo size (default: 600px) */
  logoSize?: number;
  /** Custom transition timing (default: [0, 0.4]) */
  transitionTiming?: [number, number];
  /** Enable accessibility features */
  enableA11y?: boolean;
  /** Logo alt text for accessibility */
  logoAlt?: string;
}

/**
 * Enhanced Hero Section with integrated background transitions
 */
export const EnhancedHero: React.FC<EnhancedHeroProps> = ({
  enableProfiling = process.env.NODE_ENV === 'development',
  logoSize = 600,
  transitionTiming = [0, 0.4],
  enableA11y = true,
  logoAlt = 'Ovsia Logo'
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { sectionRef: transitionRef } = useBackgroundTransitionSection('hero');
  const profiler = useMemo(() => 
    enableProfiling ? getTransitionProfiler() : null, 
    [enableProfiling]
  );

  // Track scroll progress for this section (V3 configuration preserved)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
    layoutEffect: false,
  });

  // Create spring for smoother transitions
  const scrollSpring = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 50,
    mass: 0.5
  });

  // Background transformation: white → black (V3 timing preserved)
  const bgColor = useTransform(
    scrollSpring,
    transitionTiming,
    ['#ffffff', '#000000']
  );

  // Logo inversion: black logo → white logo (synchronized with background)
  const logoFilter = useTransform(
    scrollSpring,
    transitionTiming,
    ['invert(0)', 'invert(1)']
  );

  // Logo scale effect for enhanced visual appeal
  const logoScale = useTransform(
    scrollSpring,
    [0, 0.2, 0.4],
    [1, 1.05, 1]
  );

  // Logo opacity for fade effect
  const logoOpacity = useTransform(
    scrollSpring,
    [0, 0.3, 0.4],
    [1, 0.9, 0.8]
  );

  // Performance monitoring and debugging (V3 preserved + enhanced)
  useEffect(() => {
    console.log('Enhanced Hero mounted');

    const unsubscribe = scrollYProgress.on('change', value => {
      // V3 debug logging preserved
      console.log('Hero scroll progress:', value);
      
      // Enhanced profiling
      if (profiler && value > 0 && value < 0.4) {
        // Record transition progress for profiling
        profiler.recordTransitionStart('hero', '#ffffff', '#000000');
      }
      
      if (profiler && value >= 0.4) {
        profiler.recordTransitionEnd('hero');
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, profiler]);

  // Combine refs for both scroll tracking and transition management
  const combinedRef = (element: HTMLDivElement | null) => {
    if (element) {
      (sectionRef as any).current = element;
      transitionRef(element);
    }
  };

  // Accessibility enhancements
  const a11yProps = useMemo(() => {
    if (!enableA11y) return {};
    
    return {
      'aria-label': 'Hero section with Ovsia logo',
      'role': 'banner',
      'tabIndex': -1
    };
  }, [enableA11y]);

  return (
    <motion.section
      ref={combinedRef}
      className="relative min-h-screen flex items-center justify-center will-change-[background-color]"
      style={{ 
        background: bgColor,
        // Hardware acceleration hints
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...a11yProps}
    >
      {/* Logo container - preserving V3 structure with enhancements */}
      <div className="relative">
        <motion.div
          style={{
            filter: logoFilter,
            scale: logoScale,
            opacity: logoOpacity,
            // Performance optimizations
            willChange: 'filter, transform, opacity',
            transform: 'translateZ(0)'
          }}
          className="select-none drop-shadow-xl"
          whileHover={{ 
            scale: 1.02, 
            transition: { duration: 0.3, ease: 'easeOut' } 
          }}
        >
          <Image
            src="/ousia_logo.png"
            alt={logoAlt}
            width={logoSize}
            height={logoSize}
            priority
            quality={100}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwuIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            style={{
              // Additional performance hints
              imageRendering: 'crisp-edges',
              transform: 'translateZ(0)'
            }}
            onLoad={() => {
              console.log('Hero logo loaded successfully');
            }}
            onError={(e) => {
              console.error('Hero logo failed to load:', e);
            }}
          />
        </motion.div>
      </div>

      {/* Performance overlay (development only) */}
      {enableProfiling && process.env.NODE_ENV === 'development' && (
        <motion.div
          className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="font-semibold mb-1">Hero Performance</div>
          <div>Scroll Progress: {(scrollYProgress.get() * 100).toFixed(1)}%</div>
          <div>Background: {scrollYProgress.get() < 0.4 ? 'Transitioning' : 'Complete'}</div>
          <div>Logo Filter: {logoFilter.get()}</div>
        </motion.div>
      )}

      {/* Scroll indicator for better UX */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: scrollYProgress.get() > 0.2 ? 0 : 1,
          y: scrollYProgress.get() > 0.2 ? 20 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-current rounded-full flex justify-center"
          animate={{ 
            borderColor: scrollYProgress.get() > 0.2 ? '#ffffff' : '#000000'
          }}
        >
          <motion.div
            className="w-1 h-3 bg-current rounded-full mt-2"
            animate={{
              backgroundColor: scrollYProgress.get() > 0.2 ? '#ffffff' : '#000000',
              y: [0, 12, 0]
            }}
            transition={{
              y: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              },
              backgroundColor: {
                duration: 0.3
              }
            }}
          />
        </motion.div>
      </motion.div>

      {/* Accessibility: Screen reader content */}
      {enableA11y && (
        <div className="sr-only">
          <h1>Ovsia - From 0 to 1, We Make Essence Real</h1>
          <p>Welcome to Ovsia, a venture studio building the impossible through strategy, AI operations, and capital.</p>
        </div>
      )}
    </motion.section>
  );
};

export default EnhancedHero;