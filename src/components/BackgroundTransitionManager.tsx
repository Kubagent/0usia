/**
 * Background Transition Manager Component
 * 
 * A centralized system for managing smooth background color transitions across
 * multiple sections with scroll-triggered animations. Optimized for performance
 * with hardware acceleration and proper cleanup.
 * 
 * Features:
 * - Manages global background state across all sections
 * - Scroll-triggered smooth transitions between black/white
 * - Performance monitoring and optimization
 * - Intersection Observer for efficient section detection
 * - Framer Motion integration for hardware-accelerated animations
 * - Accessibility support with reduced motion preferences
 * 
 * @example
 * ```tsx
 * <BackgroundTransitionManager
 *   sections={[
 *     { id: 'hero', backgroundColor: '#ffffff' },
 *     { id: 'about', backgroundColor: '#000000' },
 *     { id: 'services', backgroundColor: '#ffffff' }
 *   ]}
 *   transitionDuration={0.8}
 *   easing="easeInOut"
 * />
 * ```
 */

'use client';

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export interface SectionConfig {
  /** Unique identifier for the section */
  id: string;
  /** Target background color for this section */
  backgroundColor: string;
  /** Optional custom transition timing */
  transitionTiming?: {
    /** When to start transition (0-1, relative to section visibility) */
    start: number;
    /** When to complete transition (0-1, relative to section visibility) */
    end: number;
  };
  /** Optional section-specific easing */
  easing?: string | number[];
}

export interface BackgroundTransitionManagerProps {
  /** Array of section configurations */
  sections: SectionConfig[];
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
 * Background Transition Manager - Handles global background transitions
 */
export const BackgroundTransitionManager: React.FC<BackgroundTransitionManagerProps> = ({
  sections,
  transitionDuration = 0.8,
  easing = [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth transitions
  enableProfiling = false,
  respectReducedMotion = true,
  className = '',
  children
}) => {
  // Motion values for background color and current section
  const backgroundColor = useMotionValue(sections[0]?.backgroundColor || '#ffffff');
  const currentSectionIndex = useRef(0);
  
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
    ease: prefersReducedMotion ? 'linear' : easing
  }), [transitionDuration, easing, prefersReducedMotion]);

  const backgroundSpring = useSpring(backgroundColor, springConfig);

  // Intersection Observer for efficient section detection
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  /**
   * Handle section visibility changes with performance monitoring
   */
  const handleSectionChange = useCallback((sectionId: string, isVisible: boolean, intersectionRatio: number) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const section = sections[sectionIndex];
    
    // Determine if we should transition based on intersection ratio
    const timing = section.transitionTiming || { start: 0.1, end: 0.9 };
    const shouldTransition = intersectionRatio >= timing.start;

    if (shouldTransition && currentSectionIndex.current !== sectionIndex) {
      // Start performance tracking
      if (enableProfiling) {
        performanceRef.current.transitionStartTime = performance.now();
      }

      currentSectionIndex.current = sectionIndex;
      backgroundColor.set(section.backgroundColor);

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

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Background transition: ${sectionId} -> ${section.backgroundColor}`, {
          intersectionRatio,
          transitionTime: enableProfiling ? 
            performance.now() - performanceRef.current.transitionStartTime : 
            'N/A'
        });
      }
    }
  }, [sections, backgroundColor, enableProfiling]);

  /**
   * Register section element for intersection observation
   */
  const registerSection = useCallback((sectionId: string, element: HTMLElement | null) => {
    if (!element) {
      sectionRefs.current.delete(sectionId);
      return;
    }

    sectionRefs.current.set(sectionId, element);

    // Create observer if it doesn't exist
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              handleSectionChange(sectionId, entry.isIntersecting, entry.intersectionRatio);
            }
          });
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: '-10% 0px -10% 0px' // Trigger transitions slightly before full visibility
        }
      );
    }

    // Add data attribute for identification
    element.setAttribute('data-section-id', sectionId);
    observerRef.current.observe(element);
  }, [handleSectionChange]);

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
   * Cleanup effect
   */
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      {/* Fixed background layer */}
      <motion.div
        className={`fixed inset-0 -z-10 ${className}`}
        style={{
          backgroundColor: backgroundSpring,
          willChange: 'background-color'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Performance overlay (development only) */}
      {enableProfiling && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
          <div>FPS: {metrics.frameRate.toFixed(1)}</div>
          <div>Transitions: {metrics.transitionCount}</div>
          <div>Avg Time: {metrics.averageTransitionTime.toFixed(2)}ms</div>
          {metrics.memoryUsage && (
            <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
          )}
        </div>
      )}

      {/* Content wrapper with section registration context */}
      <BackgroundTransitionContext.Provider value={{ registerSection }}>
        {children}
      </BackgroundTransitionContext.Provider>
    </>
  );
};

/**
 * Context for section registration
 */
const BackgroundTransitionContext = React.createContext<{
  registerSection: (sectionId: string, element: HTMLElement | null) => void;
}>({
  registerSection: () => {}
});

/**
 * Hook for components to register themselves for background transitions
 */
export const useBackgroundTransitionSection = (sectionId: string) => {
  const { registerSection } = React.useContext(BackgroundTransitionContext);
  
  const sectionRef = useCallback((element: HTMLElement | null) => {
    registerSection(sectionId, element);
  }, [sectionId, registerSection]);

  return { sectionRef };
};

/**
 * HOC for automatic section registration
 */
export const withBackgroundTransition = <P extends object>(
  Component: React.ComponentType<P>,
  sectionId: string
) => {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    const { sectionRef } = useBackgroundTransitionSection(sectionId);
    
    return (
      <div ref={sectionRef}>
        <Component {...(props as P)} />
      </div>
    );
  });
};

export default BackgroundTransitionManager;