/**
 * Performance utilities for carousel components
 * 
 * Provides performance monitoring, optimization helpers, and
 * debugging tools for carousel implementations.
 */

/**
 * Performance metrics interface
 */
export interface CarouselPerformanceMetrics {
  /** Average frame rate during animations */
  averageFPS: number;
  /** Animation duration in milliseconds */
  animationDuration: number;
  /** Memory usage delta during animation */
  memoryDelta?: number;
  /** Number of reflows/repaints during animation */
  layoutShifts: number;
  /** Time to first meaningful paint */
  timeToFirstPaint: number;
  /** Interaction responsiveness in milliseconds */
  interactionLatency: number;
}

/**
 * Performance monitor class for carousel components
 */
export class CarouselPerformanceMonitor {
  private metrics: Partial<CarouselPerformanceMetrics> = {};
  private animationStartTime: number = 0;
  private frameCount: number = 0;
  private frameStartTime: number = 0;
  private observer?: PerformanceObserver;
  private resizeObserver?: ResizeObserver;
  private layoutShiftCount: number = 0;

  constructor(private enableLogging: boolean = false) {
    this.setupPerformanceObserver();
  }

  /**
   * Setup performance observer to track layout shifts and other metrics
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            this.layoutShiftCount++;
          }
        }
      });

      this.observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      this.log('Failed to setup performance observer:', error);
    }
  }

  /**
   * Start monitoring a carousel animation
   */
  startAnimation(): void {
    this.animationStartTime = performance.now();
    this.frameCount = 0;
    this.frameStartTime = performance.now();
    this.layoutShiftCount = 0;
    
    this.trackFrameRate();
  }

  /**
   * End monitoring and calculate metrics
   */
  endAnimation(): CarouselPerformanceMetrics {
    const endTime = performance.now();
    const animationDuration = endTime - this.animationStartTime;
    const averageFPS = this.frameCount / (animationDuration / 1000);

    const metrics: CarouselPerformanceMetrics = {
      averageFPS,
      animationDuration,
      layoutShifts: this.layoutShiftCount,
      timeToFirstPaint: this.animationStartTime,
      interactionLatency: animationDuration
    };

    this.metrics = metrics;
    this.log('Carousel animation metrics:', metrics);

    return metrics;
  }

  /**
   * Track frame rate during animation
   */
  private trackFrameRate(): void {
    const trackFrame = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.animationStartTime < 5000) { // Track for 5 seconds max
        requestAnimationFrame(trackFrame);
      }
    };

    requestAnimationFrame(trackFrame);
  }

  /**
   * Measure interaction latency
   */
  measureInteractionLatency(callback: () => void): number {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    
    const latency = endTime - startTime;
    this.log('Interaction latency:', latency, 'ms');
    
    return latency;
  }

  /**
   * Check if device has reduced motion preference
   */
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get optimal animation duration based on device capabilities
   */
  static getOptimalAnimationDuration(): number {
    if (typeof window === 'undefined') return 300;

    // Check for reduced motion preference
    if (CarouselPerformanceMonitor.prefersReducedMotion()) {
      return 150; // Shorter animations for reduced motion
    }

    // Check device performance indicators
    const connection = (navigator as any).connection;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Adjust based on network and hardware
    if (connection?.effectiveType === '4g' && hardwareConcurrency >= 4) {
      return 400; // Longer, smoother animations for capable devices
    } else if (connection?.effectiveType === '3g' || hardwareConcurrency < 4) {
      return 200; // Shorter animations for less capable devices  
    }

    return 300; // Default duration
  }

  /**
   * Optimize carousel for current device
   */
  static getOptimizationSettings(): {
    animationDuration: number;
    useTransform3D: boolean;
    enableProgressBar: boolean;
    autoplayInterval: number;
  } {
    const duration = CarouselPerformanceMonitor.getOptimalAnimationDuration();
    const prefersReducedMotion = CarouselPerformanceMonitor.prefersReducedMotion();
    
    // Check if device supports hardware acceleration
    const supportsTransform3D = CarouselPerformanceMonitor.supportsTransform3D();
    
    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    return {
      animationDuration: duration,
      useTransform3D: supportsTransform3D,
      enableProgressBar: !prefersReducedMotion && deviceMemory >= 2,
      autoplayInterval: prefersReducedMotion ? 8000 : 4000
    };
  }

  /**
   * Check if device supports 3D transforms
   */
  static supportsTransform3D(): boolean {
    if (typeof window === 'undefined') return false;

    const testEl = document.createElement('div');
    testEl.style.transform = 'translate3d(0,0,0)';
    
    return testEl.style.transform !== '';
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Preload images for better performance
   */
  static preloadImages(imageSrcs: string[]): Promise<void[]> {
    const promises = imageSrcs.map((src) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    });

    return Promise.all(promises);
  }

  /**
   * Calculate optimal batch size for DOM updates
   */
  static getOptimalBatchSize(): number {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Adjust batch size based on available cores
    if (hardwareConcurrency >= 8) return 10;
    if (hardwareConcurrency >= 4) return 6;
    return 3;
  }

  /**
   * Use requestAnimationFrame for smooth updates
   */
  static rafSchedule(callback: () => void): number {
    return requestAnimationFrame(callback);
  }

  /**
   * Use requestIdleCallback for non-critical updates
   */
  static idleSchedule(callback: () => void, timeout: number = 5000): number {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      return (window as any).requestIdleCallback(callback, { timeout });
    } else {
      // Fallback to setTimeout
      return setTimeout(callback, 0) as any;
    }
  }

  /**
   * Memory usage tracking (experimental)
   */
  static trackMemoryUsage(): number | null {
    if (typeof window === 'undefined') return null;
    
    const memory = (performance as any).memory;
    if (memory) {
      return memory.usedJSHeapSize;
    }
    
    return null;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Partial<CarouselPerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Log performance information (if enabled)
   */
  private log(...args: any[]): void {
    if (this.enableLogging && typeof console !== 'undefined') {
      console.log('[CarouselPerformance]', ...args);
    }
  }
}

/**
 * Performance decorator for carousel components
 */
export function withCarouselPerformance<T extends React.ComponentType<any>>(
  Component: T,
  options: { enableLogging?: boolean } = {}
): React.ForwardRefExoticComponent<React.PropsWithoutRef<React.ComponentProps<T>> & React.RefAttributes<any>> {
  const WrappedComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const monitor = React.useMemo(
      () => new CarouselPerformanceMonitor(options.enableLogging),
      [options.enableLogging]
    );

    React.useEffect(() => {
      return () => monitor.dispose();
    }, [monitor]);

    return React.createElement(Component, { ...props, ref, performanceMonitor: monitor });
  });

  WrappedComponent.displayName = `withCarouselPerformance(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * React hook for carousel performance monitoring
 */
export function useCarouselPerformance(enableLogging: boolean = false) {
  const monitor = React.useMemo(
    () => new CarouselPerformanceMonitor(enableLogging),
    [enableLogging]
  );

  React.useEffect(() => {
    return () => monitor.dispose();
  }, [monitor]);

  const optimizationSettings = React.useMemo(
    () => CarouselPerformanceMonitor.getOptimizationSettings(),
    []
  );

  return {
    monitor,
    optimizationSettings,
    prefersReducedMotion: CarouselPerformanceMonitor.prefersReducedMotion(),
    preloadImages: CarouselPerformanceMonitor.preloadImages,
    debounce: CarouselPerformanceMonitor.debounce,
    throttle: CarouselPerformanceMonitor.throttle
  };
}

// Re-export React for the decorator
import React from 'react';

export default CarouselPerformanceMonitor;