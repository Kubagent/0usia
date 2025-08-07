'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollPerformanceMonitor } from '@/utils/performanceMonitor';
import { frameScheduler, throttleByFrameBudget } from '@/utils/frameThrottling';

export interface PerformantScrollLockOptions {
  /** Total number of sections */
  sectionCount: number;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Threshold for scroll delta to trigger section change */
  scrollThreshold?: number;
  /** Enable touch/swipe gestures */
  enableTouch?: boolean;
  /** Preserve Hero scroll animations */
  preserveHeroAnimations?: boolean;
  /** Target FPS for performance monitoring */
  targetFPS?: number;
}

export interface ScrollLockState {
  /** Current active section (0-indexed) */
  currentSection: number;
  /** Whether scroll lock is enabled */
  isEnabled: boolean;
  /** Whether currently transitioning between sections */
  isTransitioning: boolean;
  /** Current scroll progress within section (0-1) */
  scrollProgress: number;
  /** Performance metrics */
  performanceMetrics: {
    fps: number;
    frameTime: number;
    droppedFrames: number;
  };
}

/**
 * Performance-optimized scroll-lock hook with 60fps target
 * Implements "one flick = one section" navigation while preserving Hero animations
 */
export function usePerformantScrollLock(options: PerformantScrollLockOptions) {
  const {
    sectionCount,
    enablePerformanceMonitoring = true,
    scrollThreshold = 0.15,
    enableTouch = true,
    preserveHeroAnimations = true,
    targetFPS = 60,
  } = options;

  const [state, setState] = useState<ScrollLockState>({
    currentSection: 0,
    isEnabled: true,
    isTransitioning: false,
    scrollProgress: 0,
    performanceMetrics: { fps: 60, frameTime: 16.67, droppedFrames: 0 },
  });

  // Performance monitoring
  const performanceMonitorRef = useRef<ScrollPerformanceMonitor>();
  const sectionRefsRef = useRef<(HTMLElement | null)[]>([]);
  const intersectionObserverRef = useRef<IntersectionObserver>();
  const isManualScrollRef = useRef(false);
  const scrollVelocityRef = useRef({ value: 0, lastTime: 0 });

  // Initialize performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      performanceMonitorRef.current = new ScrollPerformanceMonitor();
    }
  }, [enablePerformanceMonitoring]);

  // Register section refs for navigation
  const registerSection = useCallback((index: number, element: HTMLElement | null) => {
    sectionRefsRef.current[index] = element;
    
    // Update intersection observer when sections change
    if (intersectionObserverRef.current && element) {
      intersectionObserverRef.current.observe(element);
    }
  }, []);

  // Optimized scroll progress calculation
  const updateScrollProgress = useCallback(
    throttleByFrameBudget((scrollY: number) => {
      const windowHeight = window.innerHeight;
      const currentSectionIndex = Math.floor(scrollY / windowHeight);
      const normalizedIndex = Math.max(0, Math.min(currentSectionIndex, sectionCount - 1));
      
      // Calculate progress within current section
      const sectionStart = normalizedIndex * windowHeight;
      const progress = Math.max(0, Math.min(1, (scrollY - sectionStart) / windowHeight));

      // Use frame scheduler for state updates to maintain 60fps
      frameScheduler.schedule(
        'scroll-progress-update',
        () => {
          setState(prev => ({
            ...prev,
            currentSection: normalizedIndex,
            scrollProgress: progress,
          }));
        },
        'high'
      );
    }, 8), // 8ms throttle for ~120fps responsive feel
    [sectionCount]
  );

  // High-performance scroll handler
  const handleScroll = useCallback(() => {
    if (isManualScrollRef.current) return;

    const scrollY = window.scrollY;
    const currentTime = performance.now();
    
    // Calculate scroll velocity for gesture detection
    const velocity = scrollVelocityRef.current.lastTime > 0 
      ? (scrollY - scrollVelocityRef.current.value) / (currentTime - scrollVelocityRef.current.lastTime)
      : 0;
    
    scrollVelocityRef.current = { value: scrollY, lastTime: currentTime };

    // Update scroll progress with frame budget awareness
    if (frameScheduler.hasFrameBudget(4)) {
      updateScrollProgress(scrollY);
    } else {
      // Schedule for next available frame if budget is tight
      frameScheduler.schedule(
        'deferred-scroll-update',
        () => updateScrollProgress(scrollY),
        'normal'
      );
    }
  }, [updateScrollProgress]);

  // Smooth section navigation with performance monitoring
  const goToSection = useCallback(
    (targetSection: number, options?: { duration?: number; force?: boolean }) => {
      const { duration = 800, force = false } = options || {};
      
      if (!state.isEnabled && !force) return;
      if (targetSection < 0 || targetSection >= sectionCount) return;
      if (targetSection === state.currentSection && !force) return;

      const targetElement = sectionRefsRef.current[targetSection];
      if (!targetElement) return;

      // Start performance monitoring for transition
      if (enablePerformanceMonitoring && performanceMonitorRef.current) {
        performanceMonitorRef.current.startMonitoring((metrics) => {
          setState(prev => ({
            ...prev,
            performanceMetrics: {
              fps: metrics.fps,
              frameTime: metrics.frameTime,
              droppedFrames: metrics.droppedFrames,
            },
          }));
        });
      }

      setState(prev => ({ ...prev, isTransitioning: true }));
      isManualScrollRef.current = true;

      // Use native CSS scroll-snap for best performance
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Reset transition state after completion
      setTimeout(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
        isManualScrollRef.current = false;
        
        // Stop performance monitoring
        if (performanceMonitorRef.current) {
          const finalMetrics = performanceMonitorRef.current.stopMonitoring();
          
          // Log performance warnings in development
          if (process.env.NODE_ENV === 'development' && finalMetrics.fps < targetFPS) {
            console.warn(`Section transition performance warning: ${finalMetrics.fps} FPS (target: ${targetFPS})`);
          }
        }
      }, duration);
    },
    [state.isEnabled, state.currentSection, sectionCount, enablePerformanceMonitoring, targetFPS]
  );

  // Optimized wheel event handler
  const handleWheel = useCallback(
    throttleByFrameBudget((event: WheelEvent) => {
      if (!state.isEnabled || state.isTransitioning || isManualScrollRef.current) return;

      // For Hero section, allow native scrolling to preserve animations
      if (preserveHeroAnimations && state.currentSection === 0 && state.scrollProgress < 1) {
        return; // Let native scroll handle Hero animations
      }

      const deltaY = event.deltaY;
      const absDelta = Math.abs(deltaY);
      
      // Only handle significant scroll gestures
      if (absDelta < scrollThreshold * 1000) return;

      event.preventDefault();

      // Determine scroll direction and navigate
      if (deltaY > 0 && state.currentSection < sectionCount - 1) {
        goToSection(state.currentSection + 1);
      } else if (deltaY < 0 && state.currentSection > 0) {
        goToSection(state.currentSection - 1);
      }
    }, 16), // 16ms throttle for smooth gesture detection
    [
      state.isEnabled,
      state.isTransitioning,
      state.currentSection,
      state.scrollProgress,
      sectionCount,
      scrollThreshold,
      preserveHeroAnimations,
      goToSection,
    ]
  );

  // Touch gesture handling for mobile
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enableTouch || !state.isEnabled) return;
    
    const touch = event.touches[0];
    touchStartRef.current = {
      y: touch.clientY,
      time: performance.now(),
    };
  }, [enableTouch, state.isEnabled]);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!enableTouch || !state.isEnabled || !touchStartRef.current || state.isTransitioning) return;

      const touch = event.changedTouches[0];
      const deltaY = touchStartRef.current.y - touch.clientY;
      const deltaTime = performance.now() - touchStartRef.current.time;

      // Gesture recognition parameters
      const minSwipeDistance = 60;
      const maxSwipeTime = 400;
      const velocity = Math.abs(deltaY) / deltaTime;

      if (Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime && velocity > 0.2) {
        event.preventDefault();
        
        if (deltaY > 0 && state.currentSection < sectionCount - 1) {
          goToSection(state.currentSection + 1);
        } else if (deltaY < 0 && state.currentSection > 0) {
          goToSection(state.currentSection - 1);
        }
      }

      touchStartRef.current = null;
    },
    [enableTouch, state.isEnabled, state.isTransitioning, state.currentSection, sectionCount, goToSection]
  );

  // Set up Intersection Observer for efficient section detection
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionIndex = sectionRefsRef.current.indexOf(entry.target as HTMLElement);
            if (sectionIndex !== -1 && sectionIndex !== state.currentSection && !isManualScrollRef.current) {
              setState(prev => ({ ...prev, currentSection: sectionIndex }));
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.1, 0.5, 0.9],
      }
    );

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [state.currentSection]);

  // Event listener setup with passive optimization
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isEnabled || state.isTransitioning) return;

      switch (event.key) {
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          if (state.currentSection > 0) {
            goToSection(state.currentSection - 1);
          }
          break;
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          event.preventDefault();
          if (state.currentSection < sectionCount - 1) {
            goToSection(state.currentSection + 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          goToSection(0);
          break;
        case 'End':
          event.preventDefault();
          goToSection(sectionCount - 1);
          break;
      }
    };

    if (state.isEnabled) {
      // Use passive: false only for wheel to enable preventDefault
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      if (enableTouch) {
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });
      }
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      
      if (enableTouch) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [
    state.isEnabled,
    state.isTransitioning,
    state.currentSection,
    sectionCount,
    handleWheel,
    handleScroll,
    handleTouchStart,
    handleTouchEnd,
    enableTouch,
    goToSection,
  ]);

  // Control functions
  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isEnabled: enabled }));
  }, []);

  const getPerformanceReport = useCallback(() => {
    const { performanceMetrics } = state;
    return {
      ...performanceMetrics,
      isOptimal: performanceMetrics.fps >= targetFPS && performanceMetrics.droppedFrames < 3,
      recommendations: performanceMetrics.fps < targetFPS 
        ? ['Consider reducing animation complexity', 'Check for memory leaks', 'Optimize CSS transforms']
        : ['Performance is optimal'],
    };
  }, [state.performanceMetrics, targetFPS]);

  return {
    state,
    goToSection,
    registerSection,
    setEnabled,
    getPerformanceReport,
  };
}