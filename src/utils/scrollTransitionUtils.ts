/**
 * Scroll Transition Utilities
 * 
 * Performance-optimized utilities for managing scroll-triggered background transitions.
 * Implements RAF throttling, passive event listeners, and memory-efficient cleanup.
 * 
 * Features:
 * - RequestAnimationFrame throttling for smooth 60fps performance
 * - Passive event listeners to prevent scroll blocking
 * - Intersection Observer API for efficient viewport detection
 * - Memory leak prevention with proper cleanup
 * - Browser compatibility fallbacks
 * - Performance profiling hooks
 */

import { RefObject } from 'react';

export interface ScrollTransitionConfig {
  /** Element to monitor for scroll transitions */
  element: HTMLElement;
  /** Callback fired when transition should occur */
  onTransition: (progress: number, isVisible: boolean) => void;
  /** Threshold values for intersection detection (0-1) */
  thresholds?: number[];
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Enable performance profiling */
  enableProfiling?: boolean;
}

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  scrollProgress: number;
  velocity: number;
  direction: 'up' | 'down' | 'none';
}

/**
 * Performance-optimized scroll listener with RAF throttling
 */
export class ScrollTransitionManager {
  private observers: Map<HTMLElement, IntersectionObserver> = new Map();
  private scrollCallbacks: Map<HTMLElement, (metrics: ScrollMetrics) => void> = new Map();
  private rafId: number | null = null;
  private lastScrollTime = 0;
  private lastScrollTop = 0;
  private velocityBuffer: number[] = [];
  private isDestroyed = false;

  // Performance monitoring
  private performanceMetrics = {
    frameCount: 0,
    droppedFrames: 0,
    averageFrameTime: 16.67, // Target 60fps
    lastFrameTime: performance.now()
  };

  constructor(private config: { enableProfiling?: boolean } = {}) {
    this.handleScroll = this.handleScroll.bind(this);
    this.updateFrame = this.updateFrame.bind(this);
  }

  /**
   * Register an element for scroll-based background transitions
   */
  registerElement(config: ScrollTransitionConfig): () => void {
    if (this.isDestroyed) {
      console.warn('ScrollTransitionManager: Attempted to register element after destruction');
      return () => {};
    }

    const {
      element,
      onTransition,
      thresholds = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0],
      rootMargin = '-10% 0px -10% 0px',
      enableProfiling = false
    } = config;

    // Create intersection observer for this element
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const progress = entry.intersectionRatio;
          const isVisible = entry.isIntersecting;
          
          // Performance profiling
          if (enableProfiling || this.config.enableProfiling) {
            this.updatePerformanceMetrics();
          }

          // Call transition callback with current progress
          onTransition(progress, isVisible);
          
          // Debug logging in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Scroll transition:', {
              element: element.tagName,
              progress: progress.toFixed(3),
              isVisible,
              intersectionRatio: entry.intersectionRatio
            });
          }
        });
      },
      {
        threshold: thresholds,
        rootMargin
      }
    );

    observer.observe(element);
    this.observers.set(element, observer);

    // Return cleanup function
    return () => {
      observer.disconnect();
      this.observers.delete(element);
      this.scrollCallbacks.delete(element);
    };
  }

  /**
   * Register a scroll callback for an element
   */
  registerScrollCallback(
    element: HTMLElement, 
    callback: (metrics: ScrollMetrics) => void
  ): () => void {
    this.scrollCallbacks.set(element, callback);
    
    // Start scroll monitoring if not already active
    if (this.scrollCallbacks.size === 1) {
      this.startScrollMonitoring();
    }

    return () => {
      this.scrollCallbacks.delete(element);
      
      // Stop monitoring if no callbacks remain
      if (this.scrollCallbacks.size === 0) {
        this.stopScrollMonitoring();
      }
    };
  }

  /**
   * Start monitoring scroll events with RAF throttling
   */
  private startScrollMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Use passive listener for better performance
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.updateFrame();
  }

  /**
   * Stop monitoring scroll events
   */
  private stopScrollMonitoring(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('scroll', this.handleScroll);
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Handle scroll events (throttled via RAF)
   */
  private handleScroll(): void {
    if (this.rafId) return; // Already scheduled
    
    this.rafId = requestAnimationFrame(this.updateFrame);
  }

  /**
   * Update frame with scroll metrics
   */
  private updateFrame(): void {
    this.rafId = null;
    
    const now = performance.now();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    
    // Calculate scroll progress
    const maxScroll = scrollHeight - clientHeight;
    const scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    // Calculate velocity
    const deltaTime = now - this.lastScrollTime;
    const deltaScroll = scrollTop - this.lastScrollTop;
    const velocity = deltaTime > 0 ? deltaScroll / deltaTime : 0;
    
    // Update velocity buffer for smoothing
    this.velocityBuffer.push(velocity);
    if (this.velocityBuffer.length > 5) {
      this.velocityBuffer.shift();
    }
    
    const averageVelocity = this.velocityBuffer.reduce((a, b) => a + b, 0) / this.velocityBuffer.length;
    
    // Determine scroll direction
    let direction: 'up' | 'down' | 'none' = 'none';
    if (Math.abs(averageVelocity) > 0.1) {
      direction = averageVelocity > 0 ? 'down' : 'up';
    }

    const metrics: ScrollMetrics = {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollProgress,
      velocity: averageVelocity,
      direction
    };

    // Call all registered callbacks
    this.scrollCallbacks.forEach(callback => {
      callback(metrics);
    });

    // Update timing for next frame
    this.lastScrollTime = now;
    this.lastScrollTop = scrollTop;
    
    // Performance monitoring
    if (this.config.enableProfiling) {
      this.updatePerformanceMetrics();
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    const now = performance.now();
    const frameTime = now - this.performanceMetrics.lastFrameTime;
    
    this.performanceMetrics.frameCount++;
    
    // Track dropped frames (>20ms indicates dropped frame at 60fps)
    if (frameTime > 20) {
      this.performanceMetrics.droppedFrames++;
    }
    
    // Update average frame time with exponential smoothing
    this.performanceMetrics.averageFrameTime = 
      this.performanceMetrics.averageFrameTime * 0.9 + frameTime * 0.1;
    
    this.performanceMetrics.lastFrameTime = now;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    const fps = 1000 / this.performanceMetrics.averageFrameTime;
    const droppedFramePercentage = 
      (this.performanceMetrics.droppedFrames / this.performanceMetrics.frameCount) * 100;
    
    return {
      fps: fps.toFixed(1),
      averageFrameTime: this.performanceMetrics.averageFrameTime.toFixed(2),
      droppedFramePercentage: droppedFramePercentage.toFixed(1),
      totalFrames: this.performanceMetrics.frameCount,
      droppedFrames: this.performanceMetrics.droppedFrames
    };
  }

  /**
   * Cleanup all observers and event listeners
   */
  destroy(): void {
    this.isDestroyed = true;
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear callbacks
    this.scrollCallbacks.clear();
    
    // Stop scroll monitoring
    this.stopScrollMonitoring();
    
    // Clear performance data
    this.performanceMetrics = {
      frameCount: 0,
      droppedFrames: 0,
      averageFrameTime: 16.67,
      lastFrameTime: performance.now()
    };
  }
}

/**
 * Global scroll transition manager instance
 */
let globalScrollManager: ScrollTransitionManager | null = null;

/**
 * Get or create the global scroll transition manager
 */
export const getScrollTransitionManager = (config?: { enableProfiling?: boolean }): ScrollTransitionManager => {
  if (!globalScrollManager) {
    globalScrollManager = new ScrollTransitionManager(config);
  }
  return globalScrollManager;
};

/**
 * Utility function to create smooth color interpolation
 */
export const interpolateColor = (
  color1: string,
  color2: string,
  progress: number
): string => {
  // Convert hex colors to RGB
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  // Interpolate RGB values
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Debounced scroll handler for less frequent updates
 */
export const createDebouncedScrollHandler = (
  callback: (metrics: ScrollMetrics) => void,
  delay: number = 16 // ~60fps
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCall = 0;
  
  return (metrics: ScrollMetrics) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      callback(metrics);
      lastCall = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(metrics);
        lastCall = Date.now();
      }, delay - (now - lastCall));
    }
  };
};

/**
 * Cleanup function for global scroll manager
 */
export const cleanupScrollTransitions = (): void => {
  if (globalScrollManager) {
    globalScrollManager.destroy();
    globalScrollManager = null;
  }
};