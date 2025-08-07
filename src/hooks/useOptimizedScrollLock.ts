'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface OptimizedScrollLockOptions {
  /** Total number of sections */
  sectionCount: number;
  /** Allow natural scrolling within Hero section */
  allowHeroScroll?: boolean;
  /** Throttle time in ms for scroll events */
  throttleMs?: number;
  /** Enable touch/swipe gestures */
  enableTouch?: boolean;
  /** Scroll behavior for section transitions */
  scrollBehavior?: ScrollBehavior;
  /** Performance monitoring callback */
  onPerformanceMetric?: (metric: PerformanceMetric) => void;
}

export interface PerformanceMetric {
  type: 'scroll' | 'snap' | 'intersection';
  duration: number;
  fps?: number;
  timestamp: number;
}

export interface ScrollLockState {
  /** Current active section (0-indexed) */
  currentSection: number;
  /** Whether scroll lock is enabled */
  isEnabled: boolean;
  /** Whether currently transitioning between sections */
  isTransitioning: boolean;
  /** Progress within current section (0-1) for Hero animations */
  sectionProgress: number;
  /** Whether Hero section is currently active */
  isHeroActive: boolean;
}

/**
 * Optimized scroll-lock hook that preserves Hero animations while providing
 * performant "one flick = one section" behavior using CSS scroll-snap
 */
export function useOptimizedScrollLock(options: OptimizedScrollLockOptions) {
  const {
    sectionCount,
    allowHeroScroll = true,
    throttleMs = 16, // ~60fps
    enableTouch = true,
    scrollBehavior = 'smooth',
    onPerformanceMetric,
  } = options;

  const [state, setState] = useState<ScrollLockState>({
    currentSection: 0,
    isEnabled: true,
    isTransitioning: false,
    sectionProgress: 0,
    isHeroActive: true,
  });

  const sectionRefsRef = useRef<(HTMLElement | null)[]>([]);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const performanceStartRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const isManualNavigationRef = useRef<boolean>(false);

  // Register section refs
  const registerSection = useCallback((index: number, element: HTMLElement | null) => {
    sectionRefsRef.current[index] = element;
  }, []);

  // Performance monitoring
  const recordPerformanceMetric = useCallback((type: PerformanceMetric['type'], startTime: number) => {
    if (!onPerformanceMetric) return;
    
    const duration = performance.now() - startTime;
    const fps = frameCountRef.current > 0 ? (frameCountRef.current / (duration / 1000)) : undefined;
    
    onPerformanceMetric({
      type,
      duration,
      fps,
      timestamp: Date.now(),
    });
    
    frameCountRef.current = 0;
  }, [onPerformanceMetric]);

  // Navigate to specific section with performance monitoring
  const goToSection = useCallback(
    (sectionIndex: number, force = false) => {
      if (!state.isEnabled && !force) return;
      if (sectionIndex < 0 || sectionIndex >= sectionCount) return;
      if (sectionIndex === state.currentSection && !force) return;

      const startTime = performance.now();
      const targetElement = sectionRefsRef.current[sectionIndex];
      if (!targetElement) return;

      setState(prev => ({ ...prev, isTransitioning: true }));
      isManualNavigationRef.current = true;

      // Use native scroll-to with smooth behavior for performance
      targetElement.scrollIntoView({
        behavior: scrollBehavior,
        block: 'start',
        inline: 'nearest',
      });

      setState(prev => ({
        ...prev,
        currentSection: sectionIndex,
        isHeroActive: sectionIndex === 0,
      }));

      // Monitor transition completion
      const transitionTimeout = setTimeout(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
        isManualNavigationRef.current = false;
        recordPerformanceMetric('snap', startTime);
      }, 600); // Account for smooth scroll duration

      return () => clearTimeout(transitionTimeout);
    },
    [state.isEnabled, state.currentSection, sectionCount, scrollBehavior, recordPerformanceMetric]
  );

  // Throttled scroll handler for Hero progress tracking
  const handleScroll = useCallback(() => {
    const now = performance.now();
    if (now - lastScrollTimeRef.current < throttleMs) return;
    
    const startTime = performance.now();
    frameCountRef.current++;
    
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Only track Hero progress if we're in section 0 and natural scrolling is allowed
    if (state.currentSection === 0 && allowHeroScroll && !isManualNavigationRef.current) {
      const heroProgress = Math.max(0, Math.min(1, scrollY / windowHeight));
      
      setState(prev => ({
        ...prev,
        sectionProgress: heroProgress,
      }));
    }
    
    lastScrollTimeRef.current = now;
    recordPerformanceMetric('scroll', startTime);
  }, [throttleMs, state.currentSection, allowHeroScroll, recordPerformanceMetric]);

  // Set up Intersection Observer for efficient section detection
  useEffect(() => {
    if (!window.IntersectionObserver) return;

    const startTime = performance.now();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionIndex = sectionRefsRef.current.findIndex(ref => ref === entry.target);
            if (sectionIndex !== -1 && sectionIndex !== state.currentSection && !isManualNavigationRef.current) {
              setState(prev => ({
                ...prev,
                currentSection: sectionIndex,
                isHeroActive: sectionIndex === 0,
              }));
            }
          }
        });
        
        recordPerformanceMetric('intersection', startTime);
      },
      {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: '-10% 0px -10% 0px', // Only trigger when section is well into view
      }
    );

    // Observe all registered sections
    sectionRefsRef.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    intersectionObserverRef.current = observer;

    return () => {
      observer.disconnect();
      intersectionObserverRef.current = null;
    };
  }, [state.currentSection, recordPerformanceMetric]);

  // Handle wheel events with performance optimization
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!state.isEnabled || state.isTransitioning) return;
      
      // Allow completely natural scrolling in Hero section
      if (state.currentSection === 0 && allowHeroScroll) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Only intercept when trying to scroll down past Hero
        if (event.deltaY > 0 && scrollY >= windowHeight * 0.95) {
          // Scrolling down from Hero - transition to next section
          event.preventDefault();
          goToSection(1);
        }
        // For all other Hero scrolling, do nothing (allow natural scroll)
        return;
      } else {
        // Standard section navigation for non-Hero sections
        event.preventDefault();
        
        if (event.deltaY > 0 && state.currentSection < sectionCount - 1) {
          goToSection(state.currentSection + 1);
        } else if (event.deltaY < 0 && state.currentSection > 0) {
          goToSection(state.currentSection - 1);
        }
      }
    },
    [state.isEnabled, state.isTransitioning, state.currentSection, allowHeroScroll, sectionCount, goToSection]
  );

  // Touch handling for mobile
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enableTouch || !state.isEnabled) return;
    
    const touch = event.touches[0];
    touchStartRef.current = {
      y: touch.clientY,
      time: Date.now(),
    };
  }, [enableTouch, state.isEnabled]);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!enableTouch || !state.isEnabled || !touchStartRef.current || state.isTransitioning) return;

      const touch = event.changedTouches[0];
      const deltaY = touchStartRef.current.y - touch.clientY;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      if (Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime) {
        // Similar logic to wheel handler for Hero section
        if (state.currentSection === 0 && allowHeroScroll) {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          
          if (deltaY > 0 && scrollY >= windowHeight * 0.9) {
            event.preventDefault();
            goToSection(1);
          }
        } else {
          event.preventDefault();
          
          if (deltaY > 0 && state.currentSection < sectionCount - 1) {
            goToSection(state.currentSection + 1);
          } else if (deltaY < 0 && state.currentSection > 0) {
            goToSection(state.currentSection - 1);
          }
        }
      }

      touchStartRef.current = null;
    },
    [enableTouch, state.isEnabled, state.isTransitioning, state.currentSection, allowHeroScroll, sectionCount, goToSection]
  );

  // Set up event listeners with passive optimization
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
      // Use passive: false only for wheel events that need preventDefault
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
    handleWheel,
    handleScroll,
    handleTouchStart,
    handleTouchEnd,
    enableTouch,
    goToSection,
  ]);

  // Enable/disable scroll lock
  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isEnabled: enabled }));
  }, []);

  return {
    state,
    goToSection,
    registerSection,
    setEnabled,
  };
}