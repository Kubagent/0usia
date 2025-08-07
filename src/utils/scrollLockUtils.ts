/**
 * Scroll Lock Utilities
 * Performance-optimized utilities for smooth scroll navigation
 */

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function for scroll event handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Request animation frame throttle for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * Smooth scroll to element with custom easing
 */
export function smoothScrollTo(
  target: number | HTMLElement,
  duration = 500,
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' = 'ease-out'
): Promise<void> {
  const targetY = typeof target === 'number' ? target : target.offsetTop;
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  const easingFunctions = {
    linear: (t: number) => t,
    ease: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  };

  const easingFunc = easingFunctions[easing];

  return new Promise((resolve) => {
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunc(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Calculate scroll velocity for gesture detection
 */
export function calculateScrollVelocity(
  currentDelta: number,
  lastDelta: number,
  currentTime: number,
  lastTime: number
): number {
  const timeDiff = currentTime - lastTime;
  if (timeDiff === 0) return 0;

  return (currentDelta - lastDelta) / timeDiff;
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal scroll behavior based on user preferences
 */
export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Performance monitor for scroll events
 */
export class ScrollPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private isMonitoring = false;

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.measure();
  }

  stop() {
    this.isMonitoring = false;
  }

  getCurrentFPS(): number {
    return this.fps;
  }

  private measure = () => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Log performance warnings in development
      if (process.env.NODE_ENV === 'development' && this.fps < 50) {
        console.warn(`Scroll performance warning: ${this.fps} FPS`);
      }
    }

    requestAnimationFrame(this.measure);
  };
}

/**
 * Optimize scroll performance by managing will-change property
 */
export function optimizeScrollPerformance(element: HTMLElement, isScrolling: boolean) {
  if (isScrolling) {
    element.style.willChange = 'transform, opacity';
  } else {
    // Remove will-change after scroll to free up resources
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 200);
  }
}

/**
 * Check if device supports smooth scrolling
 */
export function supportsSmoothScroll(): boolean {
  if (typeof window === 'undefined') return false;
  return 'scrollBehavior' in document.documentElement.style;
}

/**
 * Get viewport dimensions for scroll calculations
 */
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
}

/**
 * Check if element is in viewport
 */
export function isElementInViewport(element: HTMLElement, threshold = 0): boolean {
  const rect = element.getBoundingClientRect();
  const { height } = getViewportDimensions();

  return (
    rect.top >= -threshold &&
    rect.bottom <= height + threshold
  );
}

/**
 * Get scroll progress for an element
 */
export function getScrollProgress(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const { height } = getViewportDimensions();

  // Calculate how much of the element has been scrolled through
  const elementTop = rect.top;
  const elementHeight = rect.height;

  if (elementTop > 0) {
    // Element hasn't entered viewport yet
    return 0;
  } else if (elementTop + elementHeight < 0) {
    // Element has completely left viewport
    return 1;
  } else {
    // Element is partially or fully in viewport
    const visibleHeight = Math.min(height, elementHeight + elementTop);
    return Math.max(0, Math.min(1, visibleHeight / elementHeight));
  }
}