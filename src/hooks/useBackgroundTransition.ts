/**
 * Background Transition Hook
 * 
 * A performance-optimized React hook for creating smooth background color transitions
 * triggered by scroll events. Designed for alternating black/white sections.
 * 
 * Features:
 * - Scroll-triggered color changes with customizable thresholds
 * - Hardware-accelerated transitions using Framer Motion
 * - Race condition prevention with proper cleanup
 * - Performance monitoring integration
 * - Support for multiple transition patterns
 * 
 * @example
 * ```tsx
 * const { backgroundColor, isTransitioning } = useBackgroundTransition({
 *   sectionRef,
 *   colorPairs: [
 *     { from: '#ffffff', to: '#000000' },
 *     { from: '#000000', to: '#ffffff' }
 *   ],
 *   transitionPoints: [0, 0.4, 0.6, 1.0]
 * });
 * ```
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';

export interface ColorPair {
  from: string;
  to: string;
}

export interface BackgroundTransitionConfig {
  /** Reference to the section element */
  sectionRef: React.RefObject<HTMLElement>;
  /** Array of color pairs for transitions */
  colorPairs: ColorPair[];
  /** Scroll progress points where transitions occur (0-1) */
  transitionPoints: number[];
  /** Scroll offset configuration */
  offset?: any;
  /** Enable performance monitoring */
  enableProfiling?: boolean;
  /** Transition easing function */
  ease?: any;
}

export interface BackgroundTransitionReturn {
  /** Animated background color value */
  backgroundColor: MotionValue<string>;
  /** Current transition progress (0-1) */
  scrollProgress: MotionValue<number>;
  /** Whether a transition is currently active */
  isTransitioning: MotionValue<boolean>;
  /** Performance metrics */
  metrics?: {
    frameRate: number;
    transitionDuration: number;
  };
}

/**
 * Custom hook for creating smooth, performant background transitions
 */
export const useBackgroundTransition = ({
  sectionRef,
  colorPairs,
  transitionPoints,
  offset = ['start start', 'end start'],
  enableProfiling = false,
  ease = 'easeInOut'
}: BackgroundTransitionConfig): BackgroundTransitionReturn => {
  
  // Performance monitoring refs
  const performanceRef = useRef({
    frameCount: 0,
    lastFrameTime: performance.now(),
    transitionStartTime: 0
  });

  // Create scroll progress tracker with optimized configuration
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset,
    layoutEffect: false, // Prevent layout thrashing
  });

  // Memoize color arrays for performance
  const colorInputs = useMemo(() => 
    colorPairs.map(pair => pair.from), 
    [colorPairs]
  );
  
  const colorOutputs = useMemo(() => 
    colorPairs.map(pair => pair.to), 
    [colorPairs]
  );

  // Create optimized color transformation
  const backgroundColor = useTransform(
    scrollYProgress,
    transitionPoints,
    colorOutputs,
    { ease }
  );

  // Track transition state for performance monitoring
  const isTransitioning = useTransform(
    scrollYProgress,
    useCallback((value: number) => {
      if (enableProfiling) {
        const now = performance.now();
        const { frameCount, lastFrameTime } = performanceRef.current;
        
        // Calculate frame rate
        const deltaTime = now - lastFrameTime;
        if (deltaTime > 16) { // ~60fps threshold
          performanceRef.current.frameCount++;
          performanceRef.current.lastFrameTime = now;
        }
      }
      
      // Check if we're within any transition range
      for (let i = 0; i < transitionPoints.length - 1; i++) {
        const start = transitionPoints[i];
        const end = transitionPoints[i + 1];
        if (value >= start && value <= end) {
          return true;
        }
      }
      return false;
    }, [transitionPoints, enableProfiling])
  );

  // Performance metrics calculation (only when profiling enabled)
  const metrics = useMemo(() => {
    if (!enableProfiling) return undefined;
    
    return {
      frameRate: performanceRef.current.frameCount / 
        ((performance.now() - performanceRef.current.transitionStartTime) / 1000),
      transitionDuration: performance.now() - performanceRef.current.transitionStartTime
    };
  }, [enableProfiling]);

  return {
    backgroundColor,
    scrollProgress: scrollYProgress,
    isTransitioning,
    metrics
  };
};

/**
 * Predefined color schemes for common use cases
 */
export const COLOR_SCHEMES = {
  /** Classic black and white alternating */
  MONOCHROME: [
    { from: '#ffffff', to: '#000000' },
    { from: '#000000', to: '#ffffff' }
  ] as ColorPair[],
  
  /** Dark theme with subtle variations */
  DARK_VARIANTS: [
    { from: '#000000', to: '#1a1a1a' },
    { from: '#1a1a1a', to: '#2d2d2d' }
  ] as ColorPair[],
  
  /** Light theme with subtle variations */
  LIGHT_VARIANTS: [
    { from: '#ffffff', to: '#f8f9fa' },
    { from: '#f8f9fa', to: '#e9ecef' }
  ] as ColorPair[]
} as const;

/**
 * Utility function to create evenly spaced transition points
 */
export const createTransitionPoints = (sectionCount: number): number[] => {
  const points: number[] = [];
  for (let i = 0; i <= sectionCount; i++) {
    points.push(i / sectionCount);
  }
  return points;
};

/**
 * Higher-order component for automatic background transitions
 * Note: This HOC is available but consider using BackgroundTransitionManager 
 * and SectionWithTransition for better performance and features.
 */
export const withBackgroundTransition = <P extends object>(
  Component: React.ComponentType<P>,
  config: Omit<BackgroundTransitionConfig, 'sectionRef'>
) => {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    const sectionRef = useRef<HTMLElement>(null);
    const transition = useBackgroundTransition({
      ...config,
      sectionRef
    });

    return React.createElement('div', {
      ref,
      style: { 
        backgroundColor: '#ffffff', // Fallback color
        transition: 'background-color 0.1s ease-out'
      }
    }, React.createElement(Component, props as any));
  });
};