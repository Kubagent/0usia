import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { frameScheduler, throttleByFrameBudget, scheduleAnimationWork } from './frameThrottling';
import { WillChangeManager } from './animationOptimizations';

interface ScrollMetrics {
  velocity: number;
  timestamp: number;
  deltaY: number;
  position: number;
}

interface PerformanceConfig {
  selector?: string;
  duration?: number;
  easing?: (t: number) => number;
  velocityThreshold?: number;
  debounceMs?: number;
  enableProfiling?: boolean;
}

export default function usePerformantSectionSnap({
  selector = '.snap-section',
  duration = 1.1,
  easing = (t: number) => 1 - Math.pow(2, -10 * t),
  velocityThreshold = 0.5,
  debounceMs = 50,
  enableProfiling = false
}: PerformanceConfig = {}) {
  
  // Performance tracking refs
  const metricsRef = useRef<ScrollMetrics[]>([]);
  const isSnapping = useRef(false);
  const sectionsCache = useRef<HTMLElement[]>([]);
  const lastUpdateTime = useRef(0);
  const rafId = useRef<number>();
  const lenisRef = useRef<Lenis>();
  
  // Velocity calculation with exponential smoothing
  const velocityBuffer = useRef<number[]>([]);
  const VELOCITY_BUFFER_SIZE = 5;
  const SMOOTHING_FACTOR = 0.3;
  
  // Performance profiling
  const profileScroll = useCallback((label: string, fn: () => void) => {
    if (!enableProfiling) {
      fn();
      return;
    }
    
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (end - start > 16) { // Log operations taking >16ms (missing 60fps)
      console.warn(`Scroll performance bottleneck in ${label}: ${(end - start).toFixed(2)}ms`);
    }
  }, [enableProfiling]);
  
  // Optimized section caching with intersection observer
  const updateSectionsCache = useCallback(() => {
    profileScroll('updateSectionsCache', () => {
      sectionsCache.current = Array.from(document.querySelectorAll<HTMLElement>(selector));
    });
  }, [selector, profileScroll]);
  
  // High-performance velocity calculation
  const calculateVelocity = useCallback((deltaY: number, timestamp: number): number => {
    const buffer = velocityBuffer.current;
    
    // Add new velocity sample
    const velocity = deltaY / Math.max(timestamp - lastUpdateTime.current, 1);
    buffer.push(velocity);
    
    // Maintain buffer size
    if (buffer.length > VELOCITY_BUFFER_SIZE) {
      buffer.shift();
    }
    
    // Exponentially smoothed average
    return buffer.reduce((acc, v, i) => {
      const weight = Math.pow(SMOOTHING_FACTOR, buffer.length - 1 - i);
      return acc + v * weight;
    }, 0) / buffer.reduce((acc, _, i) => {
      return acc + Math.pow(SMOOTHING_FACTOR, buffer.length - 1 - i);
    }, 0);
  }, []);
  
  // Optimized current section detection using binary search
  const getCurrentSectionIndex = useCallback((): number => {
    const sections = sectionsCache.current;
    const scrollY = window.scrollY;
    
    let left = 0;
    let right = sections.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const section = sections[mid];
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollY >= sectionTop - 50 && scrollY < sectionBottom - 50) {
        return mid;
      } else if (scrollY < sectionTop) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    
    // Fallback to closest section
    return Math.max(0, Math.min(sections.length - 1, 
      sections.findIndex(sec => Math.abs(sec.offsetTop - scrollY) < 100)));
  }, []);
  
  // Memory-efficient scroll metrics tracking
  const trackScrollMetrics = useCallback((deltaY: number, velocity: number) => {
    const metrics = metricsRef.current;
    const timestamp = performance.now();
    
    metrics.push({
      velocity,
      timestamp,
      deltaY,
      position: window.scrollY
    });
    
    // Keep only last 100 metrics for memory efficiency
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }, []);
  
  // High-performance section snapping with RAF optimization
  const snapToSection = useCallback((targetIndex: number) => {
    if (isSnapping.current || targetIndex < 0 || targetIndex >= sectionsCache.current.length) {
      return;
    }
    
    const targetSection = sectionsCache.current[targetIndex];
    if (!targetSection || !lenisRef.current) return;
    
    isSnapping.current = true;
    
    // Use transform instead of overflow changes to avoid layout thrashing
    document.body.style.pointerEvents = 'none';
    
    profileScroll('snapToSection', () => {
      lenisRef.current!.scrollTo(targetSection, {
        immediate: false,
        duration: duration * 1000,
        easing: easing as any
      });
    });
    
    // Reset after animation with RAF timing
    const resetTime = duration * 1000 + 100;
    setTimeout(() => {
      isSnapping.current = false;
      document.body.style.pointerEvents = '';
    }, resetTime);
  }, [duration, easing, profileScroll]);
  
  // Optimized wheel handler with velocity-based detection and frame throttling
  const handleWheel = useCallback(throttleByFrameBudget((e: WheelEvent) => {
    if (isSnapping.current) {
      e.preventDefault();
      return;
    }
    
    const timestamp = performance.now();
    const deltaY = e.deltaY;
    
    // Schedule velocity calculation as high-priority work
    scheduleAnimationWork(() => {
      // Calculate velocity with exponential smoothing
      const velocity = calculateVelocity(Math.abs(deltaY), timestamp);
      
      // Track metrics for monitoring
      trackScrollMetrics(deltaY, velocity);
      
      // Only snap if velocity exceeds threshold (indicating intentional flick)
      if (velocity > velocityThreshold) {
        profileScroll('wheelSnapLogic', () => {
          const currentIdx = getCurrentSectionIndex();
          const targetIdx = deltaY > 0 
            ? Math.min(sectionsCache.current.length - 1, currentIdx + 1)
            : Math.max(0, currentIdx - 1);
          
          if (targetIdx !== currentIdx) {
            snapToSection(targetIdx);
          }
        });
      }
      
      lastUpdateTime.current = timestamp;
    }, 'high');
  }, 8), [calculateVelocity, trackScrollMetrics, velocityThreshold, profileScroll, getCurrentSectionIndex, snapToSection]);
  
  // Keyboard navigation optimized for performance
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isSnapping.current) {
      e.preventDefault();
      return;
    }
    
    const currentIdx = getCurrentSectionIndex();
    let targetIdx = currentIdx;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        targetIdx = Math.min(sectionsCache.current.length - 1, currentIdx + 1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        targetIdx = Math.max(0, currentIdx - 1);
        break;
      default:
        return;
    }
    
    if (targetIdx !== currentIdx) {
      e.preventDefault();
      snapToSection(targetIdx);
    }
  }, [getCurrentSectionIndex, snapToSection]);
  
  // Performance monitoring API
  const getPerformanceMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length < 2) return null;
    
    const avgVelocity = metrics.reduce((sum, m) => sum + m.velocity, 0) / metrics.length;
    const maxVelocity = Math.max(...metrics.map(m => m.velocity));
    const scrollFrequency = metrics.length / ((metrics[metrics.length - 1].timestamp - metrics[0].timestamp) / 1000);
    
    return {
      averageVelocity: avgVelocity.toFixed(2),
      maxVelocity: maxVelocity.toFixed(2),
      scrollFrequency: scrollFrequency.toFixed(2),
      totalScrollEvents: metrics.length,
      memoryUsage: `${(JSON.stringify(metrics).length / 1024).toFixed(2)}KB`
    };
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize Lenis with performance optimizations
    const lenis = new Lenis({
      duration,
      easing,
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: false, // Manual RAF control for better performance
    });
    
    lenisRef.current = lenis;
    
    // Cache sections on mount and resize
    updateSectionsCache();
    const resizeObserver = new ResizeObserver(updateSectionsCache);
    resizeObserver.observe(document.body);
    
    // Event listeners with performance optimizations
    const wheelOptions = { passive: false, capture: true };
    const keyOptions: AddEventListenerOptions = { passive: false };
    
    window.addEventListener('wheel', handleWheel, wheelOptions);
    window.addEventListener('keydown', handleKeyDown, keyOptions);
    
    // Manual RAF loop for 60fps performance
    const rafLoop = (time: number) => {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(rafLoop);
    };
    rafId.current = requestAnimationFrame(rafLoop);
    
    // Expose performance API globally for debugging
    if (enableProfiling) {
      (window as any).__scrollMetrics = getPerformanceMetrics;
    }
    
    return () => {
      window.removeEventListener('wheel', handleWheel, wheelOptions);
      window.removeEventListener('keydown', handleKeyDown, keyOptions);
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      resizeObserver.disconnect();
      lenis.destroy();
      
      if (enableProfiling) {
        delete (window as any).__scrollMetrics;
      }
    };
  }, [
    selector, 
    duration, 
    easing, 
    handleWheel, 
    handleKeyDown, 
    updateSectionsCache, 
    enableProfiling, 
    getPerformanceMetrics
  ]);
  
  return {
    getPerformanceMetrics,
    getCurrentSection: getCurrentSectionIndex,
    snapToSection,
    isSnapping: () => isSnapping.current
  };
}