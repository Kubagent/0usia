/**
 * Section Transition Performance Optimizations
 * 
 * Collection of utilities and hooks for optimizing section transitions
 * to maintain 60fps performance with GPU acceleration and proper cleanup.
 * 
 * Features:
 * - GPU acceleration utilities
 * - Frame rate monitoring
 * - Memory management
 * - Intersection observer optimizations
 * - Animation frame throttling
 * - Reduced motion handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Performance metrics for transition monitoring
 */
export interface TransitionPerformanceMetrics {
  frameRate: number;
  averageFrameTime: number;
  droppedFrames: number;
  memoryUsage: number;
  gpuAccelerated: boolean;
  transitionCount: number;
  lastTransitionDuration: number;
}

/**
 * GPU acceleration utilities
 */
export const gpuAcceleration = {
  /**
   * Apply GPU acceleration styles to an element
   */
  applyToElement: (element: HTMLElement) => {
    element.style.transform = element.style.transform || 'translateZ(0)';
    element.style.willChange = 'transform, opacity';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
  },

  /**
   * Remove GPU acceleration styles from an element
   */
  removeFromElement: (element: HTMLElement) => {
    element.style.willChange = 'auto';
    // Keep transform and perspective for ongoing animations
  },

  /**
   * Check if GPU acceleration is available
   */
  isSupported: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  },

  /**
   * Get optimal CSS properties for GPU acceleration
   */
  getOptimalStyles: () => ({
    transform: 'translateZ(0)',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
    contain: 'layout style paint' as const,
    isolation: 'isolate' as const,
  })
};

/**
 * Frame rate monitoring utility
 */
export class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameRates: number[] = [];
  private animationId: number | null = null;
  private onUpdate?: (fps: number) => void;

  constructor(onUpdate?: (fps: number) => void) {
    this.onUpdate = onUpdate;
  }

  start() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameRates = [];
    this.measureFrame();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private measureFrame = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 16.67) { // ~60fps threshold
      this.frameCount++;
      const fps = 1000 / deltaTime;
      this.frameRates.push(fps);
      
      // Keep only last 60 frames
      if (this.frameRates.length > 60) {
        this.frameRates.shift();
      }
      
      this.lastTime = currentTime;
      
      if (this.onUpdate) {
        this.onUpdate(fps);
      }
    }
    
    this.animationId = requestAnimationFrame(this.measureFrame);
  };

  getAverageFrameRate(): number {
    if (this.frameRates.length === 0) return 60;
    return this.frameRates.reduce((sum, fps) => sum + fps, 0) / this.frameRates.length;
  }

  getDroppedFrames(): number {
    return this.frameRates.filter(fps => fps < 55).length; // Below 55fps considered dropped
  }
}

/**
 * Memory usage monitoring
 */
export const memoryMonitor = {
  /**
   * Get current memory usage (if available)
   */
  getCurrentUsage: (): number => {
    if (typeof window === 'undefined') return 0;
    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // Convert to MB
  },

  /**
   * Check if memory usage is above threshold
   */
  isAboveThreshold: (thresholdMB: number = 50): boolean => {
    return memoryMonitor.getCurrentUsage() > thresholdMB;
  },

  /**
   * Force garbage collection (if available in development)
   */
  forceGarbageCollection: () => {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }
};

/**
 * Animation frame throttling utility
 */
export class AnimationThrottle {
  private lastTime = 0;
  private targetFPS: number;
  private frameInterval: number;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  shouldUpdate(currentTime: number = performance.now()): boolean {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameInterval) {
      this.lastTime = currentTime;
      return true;
    }
    
    return false;
  }

  setTargetFPS(fps: number) {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }
}

/**
 * Intersection Observer optimization for transitions
 */
export const useOptimizedIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver>();
  const elementsRef = useRef<Set<Element>>(new Set());

  const observe = useCallback((element: Element) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(callback);
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: '50px',
          ...options
        }
      );
    }

    if (element && !elementsRef.current.has(element)) {
      observerRef.current.observe(element);
      elementsRef.current.add(element);
    }
  }, [callback, options]);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current && elementsRef.current.has(element)) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        elementsRef.current.clear();
      }
    };
  }, []);

  return { observe, unobserve };
};

/**
 * Motion value optimization utilities
 */
export const motionValueOptimizer = {
  /**
   * Batch motion value updates for better performance
   */
  batchUpdate: (updates: Array<{ motionValue: any; value: any }>) => {
    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
      updates.forEach(({ motionValue, value }) => {
        if (motionValue && typeof motionValue.set === 'function') {
          motionValue.set(value);
        }
      });
    });
  },

  /**
   * Cleanup motion values to prevent memory leaks
   */
  cleanup: (motionValues: any[]) => {
    motionValues.forEach(mv => {
      if (mv && typeof mv.destroy === 'function') {
        mv.destroy();
      }
    });
  }
};

/**
 * Reduced motion handling
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Performance monitoring hook for transitions
 */
export const useTransitionPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<TransitionPerformanceMetrics>({
    frameRate: 60,
    averageFrameTime: 16.67,
    droppedFrames: 0,
    memoryUsage: 0,
    gpuAccelerated: false,
    transitionCount: 0,
    lastTransitionDuration: 0
  });

  const frameMonitorRef = useRef<FrameRateMonitor>();
  const transitionCountRef = useRef(0);

  useEffect(() => {
    frameMonitorRef.current = new FrameRateMonitor((fps) => {
      setMetrics(prev => ({
        ...prev,
        frameRate: fps,
        averageFrameTime: 1000 / fps,
        droppedFrames: frameMonitorRef.current?.getDroppedFrames() || 0
      }));
    });

    frameMonitorRef.current.start();

    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryMonitor.getCurrentUsage(),
        gpuAccelerated: gpuAcceleration.isSupported()
      }));
    };

    const intervalId = setInterval(updateMetrics, 1000);

    return () => {
      frameMonitorRef.current?.stop();
      clearInterval(intervalId);
    };
  }, []);

  const recordTransition = useCallback((duration: number) => {
    transitionCountRef.current++;
    setMetrics(prev => ({
      ...prev,
      transitionCount: transitionCountRef.current,
      lastTransitionDuration: duration
    }));
  }, []);

  return { metrics, recordTransition };
};

/**
 * Optimize element for transitions
 */
export const optimizeElementForTransitions = (element: HTMLElement) => {
  if (!element) return;

  // Apply GPU acceleration
  gpuAcceleration.applyToElement(element);

  // Set optimal CSS properties
  const styles = gpuAcceleration.getOptimalStyles();
  Object.assign(element.style, styles);

  // Add performance classes
  element.classList.add('transition-optimized');
};

/**
 * Cleanup element after transitions
 */
export const cleanupElementAfterTransitions = (element: HTMLElement) => {
  if (!element) return;

  // Remove GPU acceleration
  gpuAcceleration.removeFromElement(element);

  // Remove performance classes
  element.classList.remove('transition-optimized');
};

/**
 * Global CSS for transition optimizations
 */
export const TRANSITION_OPTIMIZATION_CSS = `
  /* Base transition optimizations */
  .transition-optimized {
    transform: translateZ(0);
    will-change: transform, opacity;
    backface-visibility: hidden;
    perspective: 1000px;
    contain: layout style paint;
    isolation: isolate;
  }

  /* GPU-accelerated animations */
  .gpu-accelerated {
    transform: translate3d(0, 0, 0);
    will-change: transform, opacity;
  }

  /* High-performance blur effects */
  .optimized-blur {
    filter: blur(0);
    will-change: filter;
  }

  /* Memory-efficient animations */
  .memory-optimized * {
    pointer-events: none;
  }

  .memory-optimized.active * {
    pointer-events: auto;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .transition-optimized {
      animation: none !important;
      transition: none !important;
    }
  }

  /* Performance monitoring indicators */
  .perf-indicator {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
  }

  .perf-indicator.warning {
    background: rgba(255, 165, 0, 0.8);
  }

  .perf-indicator.error {
    background: rgba(255, 0, 0, 0.8);
  }
`;

export default {
  gpuAcceleration,
  FrameRateMonitor,
  memoryMonitor,
  AnimationThrottle,
  useOptimizedIntersectionObserver,
  motionValueOptimizer,
  useReducedMotion,
  useTransitionPerformanceMonitor,
  optimizeElementForTransitions,
  cleanupElementAfterTransitions,
  TRANSITION_OPTIMIZATION_CSS
};