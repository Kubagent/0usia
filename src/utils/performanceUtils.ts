/**
 * Performance monitoring utilities for the rotating cards component
 * Helps track performance metrics and optimize animations
 */

export interface PerformanceMetrics {
  renderTime: number;
  animationFrameRate: number;
  memoryUsage?: number;
}

/**
 * Measures component render time
 */
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    }
  };
};

/**
 * Monitors animation frame rate
 */
export class AnimationFrameMonitor {
  private frames: number[] = [];
  private animationId: number | null = null;
  private startTime: number = 0;

  start() {
    this.frames = [];
    this.startTime = performance.now();
    this.tick();
  }

  stop(): number {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    const duration = performance.now() - this.startTime;
    const averageFPS = this.frames.length / (duration / 1000);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Average FPS: ${averageFPS.toFixed(2)}`);
    }
    
    return averageFPS;
  }

  private tick = () => {
    this.frames.push(performance.now());
    this.animationId = requestAnimationFrame(this.tick);
  };
}

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Intersection Observer for lazy loading optimization
 */
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      ...options,
    });
  }
  return null;
};

/**
 * Memory usage monitoring (if available)
 */
export const getMemoryUsage = (): number | undefined => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return undefined;
};

/**
 * Performance warning thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 16, // ms (60fps target)
  FPS_WARNING: 30,
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
};

/**
 * Log performance warnings
 */
export const checkPerformanceThresholds = (metrics: PerformanceMetrics) => {
  if (process.env.NODE_ENV === 'development') {
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
      console.warn(`⚠️ Slow render detected: ${metrics.renderTime.toFixed(2)}ms`);
    }
    
    if (metrics.animationFrameRate < PERFORMANCE_THRESHOLDS.FPS_WARNING) {
      console.warn(`⚠️ Low FPS detected: ${metrics.animationFrameRate.toFixed(2)}fps`);
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
      console.warn(`⚠️ High memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }
};