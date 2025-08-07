/**
 * Animation Performance Optimization Utilities
 * 
 * This module provides high-performance animation utilities designed to maintain
 * 60fps during all animations and transitions. Includes GPU acceleration,
 * will-change management, and frame budget controls.
 */

import { MotionValue, useTransform, useSpring, useMotionValue } from 'framer-motion';

// Performance constants
export const PERFORMANCE_CONFIG = {
  TARGET_FPS: 60,
  FRAME_BUDGET_MS: 16.67, // 60fps = 16.67ms per frame
  MAX_FRAME_TIME_MS: 13.33, // Leave 3.33ms buffer for other operations
  THROTTLE_THRESHOLD_MS: 8.33, // Throttle if operations take >8.33ms
  GPU_LAYER_THRESHOLD: 3, // Min transforms to promote to GPU layer
} as const;

// Animation performance metrics
interface FrameMetrics {
  frameTime: number;
  droppedFrames: number;
  averageFPS: number;
  worstFrameTime: number;
}

// Performance monitoring singleton
class AnimationPerformanceMonitor {
  private frameMetrics: number[] = [];
  private lastFrameTime = 0;
  private droppedFrameCount = 0;
  private isMonitoring = false;
  private rafId?: number;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.measureFrame();
  }

  stopMonitoring(): FrameMetrics {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    const avgFrameTime = this.frameMetrics.reduce((a, b) => a + b, 0) / this.frameMetrics.length;
    const avgFPS = Math.round(1000 / avgFrameTime);
    const worstFrameTime = Math.max(...this.frameMetrics);

    return {
      frameTime: avgFrameTime,
      droppedFrames: this.droppedFrameCount,
      averageFPS: avgFPS,
      worstFrameTime,
    };
  }

  private measureFrame = () => {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    this.frameMetrics.push(frameTime);
    
    // Keep only last 60 frames for rolling average
    if (this.frameMetrics.length > 60) {
      this.frameMetrics.shift();
    }

    // Count dropped frames (>16.67ms indicates missed frame)
    if (frameTime > PERFORMANCE_CONFIG.FRAME_BUDGET_MS) {
      this.droppedFrameCount++;
    }

    this.lastFrameTime = currentTime;
    
    if (this.isMonitoring) {
      this.rafId = requestAnimationFrame(this.measureFrame);
    }
  };
}

export const performanceMonitor = new AnimationPerformanceMonitor();

/**
 * GPU-accelerated transform utility
 * Forces hardware acceleration by using transform3d
 */
export function createGPUTransform(
  x: MotionValue<number> | number = 0,
  y: MotionValue<number> | number = 0,
  scale: MotionValue<number> | number = 1,
  rotate: MotionValue<number> | number = 0
): MotionValue<string> {
  if (typeof x === 'number' && typeof y === 'number' && 
      typeof scale === 'number' && typeof rotate === 'number') {
    return useMotionValue(
      `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1) rotate3d(0, 0, 1, ${rotate}deg)`
    );
  }

  return useTransform(
    [x, y, scale, rotate] as [MotionValue<number>, MotionValue<number>, MotionValue<number>, MotionValue<number>],
    ([xVal, yVal, scaleVal, rotateVal]) => 
      `translate3d(${xVal}px, ${yVal}px, 0) scale3d(${scaleVal}, ${scaleVal}, 1) rotate3d(0, 0, 1, ${rotateVal}deg)`
  );
}

/**
 * High-performance spring configuration optimized for 60fps
 */
export const OPTIMIZED_SPRING_CONFIG = {
  // Ultra-smooth for hero animations (slower, more cinematic)
  cinematic: {
    stiffness: 100,
    damping: 20,
    mass: 1.2,
    velocity: 0,
  },
  // Standard smooth for most UI animations
  smooth: {
    stiffness: 200,
    damping: 25,
    mass: 0.8,
    velocity: 0,
  },
  // Snappy for interactive elements
  snappy: {
    stiffness: 400,
    damping: 30,
    mass: 0.6,
    velocity: 0,
  },
  // Ultra-responsive for scroll-triggered animations
  responsive: {
    stiffness: 600,
    damping: 35,
    mass: 0.4,
    velocity: 0,
  },
} as const;

/**
 * Creates a performance-optimized spring motion value
 */
export function createOptimizedSpring(
  source: MotionValue<number>,
  config: keyof typeof OPTIMIZED_SPRING_CONFIG = 'smooth'
): MotionValue<number> {
  return useSpring(source, OPTIMIZED_SPRING_CONFIG[config]);
}

/**
 * Will-change property manager to optimize paint and composite layers
 */
export class WillChangeManager {
  private static activeElements = new WeakMap<Element, Set<string>>();
  private static elementObserver?: IntersectionObserver;

  static addProperty(element: Element, property: string): void {
    const properties = this.activeElements.get(element) || new Set();
    properties.add(property);
    this.activeElements.set(element, properties);
    this.updateWillChange(element);
  }

  static removeProperty(element: Element, property: string): void {
    const properties = this.activeElements.get(element);
    if (properties) {
      properties.delete(property);
      if (properties.size === 0) {
        this.activeElements.delete(element);
      }
      this.updateWillChange(element);
    }
  }

  static startAnimation(element: Element, properties: string[]): void {
    properties.forEach(prop => this.addProperty(element, prop));
  }

  static endAnimation(element: Element, properties: string[]): void {
    properties.forEach(prop => this.removeProperty(element, prop));
  }

  private static updateWillChange(element: Element): void {
    const properties = this.activeElements.get(element);
    const htmlElement = element as HTMLElement;
    
    if (properties && properties.size > 0) {
      htmlElement.style.willChange = Array.from(properties).join(', ');
    } else {
      htmlElement.style.willChange = 'auto';
    }
  }

  /**
   * Initialize intersection observer to clean up will-change on offscreen elements
   */
  static initializeObserver(): void {
    if (typeof window === 'undefined' || this.elementObserver) return;

    this.elementObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            // Clean up will-change for offscreen elements
            const element = entry.target as HTMLElement;
            element.style.willChange = 'auto';
          }
        });
      },
      { threshold: 0, rootMargin: '50px' }
    );
  }

  static observe(element: Element): void {
    this.elementObserver?.observe(element);
  }

  static unobserve(element: Element): void {
    this.elementObserver?.unobserve(element);
  }
}

/**
 * Frame budget manager to prevent animations from blocking the main thread
 */
export class FrameBudgetManager {
  private static operationQueue: (() => void)[] = [];
  private static isProcessing = false;
  private static frameStartTime = 0;

  static scheduleOperation(operation: () => void, priority: 'high' | 'low' = 'low'): void {
    if (priority === 'high') {
      this.operationQueue.unshift(operation);
    } else {
      this.operationQueue.push(operation);
    }
    
    this.processQueue();
  }

  private static processQueue(): void {
    if (this.isProcessing || this.operationQueue.length === 0) return;

    this.isProcessing = true;
    requestAnimationFrame(this.processFrame);
  }

  private static processFrame = (): void => {
    this.frameStartTime = performance.now();
    
    while (this.operationQueue.length > 0) {
      const currentTime = performance.now();
      const elapsedTime = currentTime - this.frameStartTime;
      
      // If we've exceeded our frame budget, defer remaining operations
      if (elapsedTime > PERFORMANCE_CONFIG.MAX_FRAME_TIME_MS) {
        requestAnimationFrame(this.processFrame);
        return;
      }
      
      const operation = this.operationQueue.shift();
      operation?.();
    }
    
    this.isProcessing = false;
  };
}

/**
 * Performance-optimized scroll transforms with automatic GPU promotion
 */
export function createOptimizedScrollTransform(
  scrollProgress: MotionValue<number>,
  inputRange: number[],
  outputRange: number[],
  transformType: 'translateY' | 'translateX' | 'scale' | 'rotate' = 'translateY'
): MotionValue<string> {
  const value = useTransform(scrollProgress, inputRange, outputRange);
  
  return useTransform(value, (latest) => {
    switch (transformType) {
      case 'translateY':
        return `translate3d(0, ${latest}px, 0)`;
      case 'translateX':
        return `translate3d(${latest}px, 0, 0)`;
      case 'scale':
        return `scale3d(${latest}, ${latest}, 1)`;
      case 'rotate':
        return `rotate3d(0, 0, 1, ${latest}deg)`;
      default:
        return `translate3d(0, ${latest}px, 0)`;
    }
  });
}

/**
 * Optimized opacity transforms that avoid paint operations when possible
 */
export function createOptimizedOpacityTransform(
  scrollProgress: MotionValue<number>,
  inputRange: number[],
  outputRange: number[]
): MotionValue<number> {
  return useTransform(scrollProgress, inputRange, outputRange, {
    clamp: true,
  });
}

/**
 * Initialize all performance optimizations
 */
export function initializeAnimationOptimizations(): void {
  WillChangeManager.initializeObserver();
  
  // Set global CSS optimizations
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      /* Force hardware acceleration for animated elements */
      .animate-gpu {
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      /* Optimize repaint areas */
      .animate-contain {
        contain: layout style paint;
      }
      
      /* Prevent layout thrashing */
      .animate-composite {
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Performance-aware animation hook
 */
export function usePerformanceAwareAnimation() {
  return {
    startMonitoring: () => performanceMonitor.startMonitoring(),
    stopMonitoring: () => performanceMonitor.stopMonitoring(),
    scheduleOperation: FrameBudgetManager.scheduleOperation,
    willChange: WillChangeManager,
  };
}