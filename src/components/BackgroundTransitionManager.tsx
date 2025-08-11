/**
 * Background Transition Manager Component
 * 
 * Enhanced centralized system for managing smooth background color transitions across
 * all sections with OptimizedScrollContainer integration. Provides seamless transitions
 * with scroll-triggered animations, optimized for 60fps performance.
 * 
 * Features:
 * - Integrates with OptimizedScrollContainer scroll events
 * - Manages global background state across all sections
 * - Smooth transitions between alternating black/white pattern
 * - Performance monitoring and GPU acceleration
 * - Hero section special handling (preserves its built-in transition)
 * - Accessibility support with reduced motion preferences
 * - Memory efficient with proper cleanup
 * 
 * Section Pattern:
 * 1. Hero: White → Black (built-in transition)
 * 2. Essence Manifesto: Black
 * 3. Core Capabilities: White
 * 4. Proof of Ousia: Black
 * 5. Choose Your Path: White
 * 6. Stay in Ousia: Black
 * 
 * @example
 * ```tsx
 * <BackgroundTransitionManager
 *   currentSection={2}
 *   onTransitionComplete={(sectionIndex) => console.log('Transitioned to', sectionIndex)}
 * />
 * ```
 */

'use client';

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export interface BackgroundTransitionManagerProps {
  /** Current active section index (0-based) */
  currentSection: number;
  /** Total number of sections */
  totalSections?: number;
  /** Global transition duration in seconds */
  transitionDuration?: number;
  /** Global easing function */
  easing?: string | number[];
  /** Enable performance monitoring */
  enableProfiling?: boolean;
  /** Respect user's reduced motion preference */
  respectReducedMotion?: boolean;
  /** Custom CSS class for the background container */
  className?: string;
  /** Callback when transition completes */
  onTransitionComplete?: (sectionIndex: number) => void;
  /** Children components */
  children?: React.ReactNode;
}

interface PerformanceMetrics {
  frameRate: number;
  transitionCount: number;
  averageTransitionTime: number;
  memoryUsage?: number;
}

/**
 * Section color configuration following the Ovsia design pattern:
 * White → Black → White → Black → White → Black
 */
const SECTION_COLORS = [
  '#ffffff', // 0: Hero - White (transitions to black internally)
  '#000000', // 1: Essence Manifesto - Black  
  '#ffffff', // 2: Core Capabilities - White
  '#000000', // 3: Proof of Ousia - Black
  '#ffffff', // 4: Choose Your Path - White
  '#000000'  // 5: Stay in Ousia - Black
] as const;

/**
 * Background Transition Manager - Handles global background transitions
 * Integrates with OptimizedScrollContainer for section-based transitions
 */
export const BackgroundTransitionManager: React.FC<BackgroundTransitionManagerProps> = ({
  currentSection,
  totalSections = 6,
  transitionDuration = 0.8,
  easing = [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth transitions
  enableProfiling = false,
  respectReducedMotion = true,
  className = '',
  onTransitionComplete,
  children
}) => {
  // Motion values for background color
  const backgroundColor = useMotionValue(SECTION_COLORS[0] as string);
  const previousSectionIndex = useRef(0);
  
  // Performance monitoring state
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    frameRate: 60,
    transitionCount: 0,
    averageTransitionTime: 0
  });
  
  // Performance tracking refs
  const performanceRef = useRef({
    frameCount: 0,
    lastFrameTime: performance.now(),
    transitionTimes: [] as number[],
    transitionStartTime: 0
  });

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return respectReducedMotion && 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [respectReducedMotion]);

  // Create spring animation for smooth background transitions
  const springConfig = useMemo(() => ({
    duration: prefersReducedMotion ? 0.1 : transitionDuration,
    ease: prefersReducedMotion ? 'linear' : easing,
    // Optimize spring physics for color transitions
    stiffness: 100,
    damping: 30,
    mass: 1
  }), [transitionDuration, easing, prefersReducedMotion]);

  const backgroundSpring = useSpring(backgroundColor, springConfig);

  /**
   * Handle section changes from OptimizedScrollContainer
   * This is called whenever the active section changes
   */
  const handleSectionChange = useCallback((sectionIndex: number) => {
    // Clamp section index to valid range
    const clampedIndex = Math.max(0, Math.min(sectionIndex, totalSections - 1));
    const targetColor = SECTION_COLORS[clampedIndex] || '#ffffff';

    // Only transition if section actually changed
    if (previousSectionIndex.current !== clampedIndex) {
      // Start performance tracking
      if (enableProfiling) {
        performanceRef.current.transitionStartTime = performance.now();
      }

      // Special handling for Hero section (index 0)
      // Hero handles its own white->black transition, so we only manage 
      // the background for other sections
      if (clampedIndex === 0) {
        // For Hero, set initial white background but let Hero handle the transition
        backgroundColor.set('#ffffff');
      } else {
        // For all other sections, perform smooth transition
        backgroundColor.set(targetColor);
      }

      previousSectionIndex.current = clampedIndex;

      // Update metrics
      if (enableProfiling) {
        const transitionTime = performance.now() - performanceRef.current.transitionStartTime;
        performanceRef.current.transitionTimes.push(transitionTime);
        
        setMetrics(prev => ({
          ...prev,
          transitionCount: prev.transitionCount + 1,
          averageTransitionTime: performanceRef.current.transitionTimes.reduce((a, b) => a + b, 0) / 
                                 performanceRef.current.transitionTimes.length
        }));
      }

      // Call completion callback
      if (onTransitionComplete) {
        onTransitionComplete(clampedIndex);
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[BackgroundTransition] Section ${clampedIndex} -> ${targetColor}`, {
          previousSection: previousSectionIndex.current,
          transitionTime: enableProfiling ? 
            performance.now() - performanceRef.current.transitionStartTime : 
            'N/A'
        });
      }
    }
  }, [backgroundColor, enableProfiling, onTransitionComplete, totalSections]);

  /**
   * Effect to handle section changes from parent component
   */
  useEffect(() => {
    handleSectionChange(currentSection);
  }, [currentSection, handleSectionChange]);

  /**
   * Performance monitoring effect
   */
  useEffect(() => {
    if (!enableProfiling) return;

    let animationFrame: number;
    
    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - performanceRef.current.lastFrameTime;
      
      if (deltaTime > 16) { // ~60fps threshold
        performanceRef.current.frameCount++;
        performanceRef.current.lastFrameTime = now;
        
        // Update frame rate every second
        if (performanceRef.current.frameCount % 60 === 0) {
          setMetrics(prev => ({
            ...prev,
            frameRate: 1000 / deltaTime,
            memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
          }));
        }
      }
      
      animationFrame = requestAnimationFrame(updateMetrics);
    };

    animationFrame = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [enableProfiling]);

  /**
   * Initialize background color on mount
   */
  useEffect(() => {
    const initialColor = SECTION_COLORS[currentSection] || '#ffffff';
    backgroundColor.set(initialColor);
    previousSectionIndex.current = currentSection;
  }, []); // Only run on mount

  return (
    <>
      {/* Fixed background layer with optimized styling */}
      <motion.div
        className={`fixed inset-0 -z-10 ${className}`}
        style={{
          backgroundColor: backgroundSpring,
          willChange: 'background-color',
          // GPU acceleration and optimization
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // Ensure it's truly behind everything
          zIndex: -100
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      
      {/* Performance overlay (development only) */}
      {enableProfiling && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 min-w-[200px]">
          <div className="font-bold mb-2 text-sm">Background Transitions</div>
          <div>Current Section: {currentSection}</div>
          <div>Target Color: {SECTION_COLORS[currentSection] || 'unknown'}</div>
          <div>FPS: {metrics.frameRate.toFixed(1)}</div>
          <div>Transitions: {metrics.transitionCount}</div>
          <div>Avg Time: {metrics.averageTransitionTime.toFixed(2)}ms</div>
          {metrics.memoryUsage && (
            <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
          )}
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative z-0">
        {children}
      </div>
    </>
  );
};

/**
 * Utility function to get section color by index
 */
export const getSectionColor = (sectionIndex: number): string => {
  return SECTION_COLORS[sectionIndex] || '#ffffff';
};

/**
 * Hook to get the current background color for a section
 */
export const useCurrentSectionColor = (sectionIndex: number): string => {
  return useMemo(() => getSectionColor(sectionIndex), [sectionIndex]);
};

/**
 * Legacy compatibility - deprecated hook for backward compatibility
 * @deprecated Use the new centralized BackgroundTransitionManager instead
 */
export const useBackgroundTransitionSection = (sectionId: string) => {
  console.warn('useBackgroundTransitionSection is deprecated. Use the new BackgroundTransitionManager system.');
  
  const sectionRef = useCallback((element: HTMLElement | null) => {
    // No-op for backward compatibility
  }, [sectionId]);

  return { sectionRef };
};

export default BackgroundTransitionManager;