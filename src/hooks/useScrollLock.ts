'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ScrollLockOptions {
  /** Total number of sections */
  sectionCount: number;
  /** Threshold for scroll delta to trigger section change (0-1) */
  threshold?: number;
  /** Debounce time in ms for scroll events */
  debounceMs?: number;
  /** Enable smooth scrolling between sections */
  smoothScroll?: boolean;
  /** Scroll behavior for section transitions */
  scrollBehavior?: ScrollBehavior;
  /** Enable touch/swipe gestures */
  enableTouch?: boolean;
}

export interface ScrollLockState {
  /** Current active section (0-indexed) */
  currentSection: number;
  /** Whether scroll lock is enabled */
  isEnabled: boolean;
  /** Whether currently scrolling between sections */
  isScrolling: boolean;
  /** Progress within current section (0-1) */
  sectionProgress: number;
}

/**
 * Hook for implementing scroll-lock navigation between sections
 * Provides "one flick = one section" behavior while preserving Hero animations
 */
export function useScrollLock(options: ScrollLockOptions) {
  const {
    sectionCount,
    threshold = 0.1,
    debounceMs = 100,
    smoothScroll = true,
    scrollBehavior = 'smooth',
    enableTouch = true,
  } = options;

  const [state, setState] = useState<ScrollLockState>({
    currentSection: 0,
    isEnabled: true,
    isScrolling: false,
    sectionProgress: 0,
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollTimeRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<number>(0);
  const sectionRefsRef = useRef<(HTMLElement | null)[]>([]);
  const isManualScrollRef = useRef<boolean>(false);

  // Register section refs
  const registerSection = useCallback((index: number, element: HTMLElement | null) => {
    sectionRefsRef.current[index] = element;
  }, []);

  // Navigate to specific section
  const goToSection = useCallback(
    (sectionIndex: number, force = false) => {
      if (!state.isEnabled && !force) return;
      if (sectionIndex < 0 || sectionIndex >= sectionCount) return;
      if (sectionIndex === state.currentSection && !force) return;

      const targetElement = sectionRefsRef.current[sectionIndex];
      if (!targetElement) return;

      setState(prev => ({ ...prev, isScrolling: true }));
      isManualScrollRef.current = true;

      // Calculate target scroll position
      const targetTop = targetElement.offsetTop;

      if (smoothScroll) {
        window.scrollTo({
          top: targetTop,
          behavior: scrollBehavior,
        });
      } else {
        window.scrollTo(0, targetTop);
      }

      setState(prev => ({
        ...prev,
        currentSection: sectionIndex,
      }));

      // Reset scrolling state after animation
      setTimeout(() => {
        setState(prev => ({ ...prev, isScrolling: false }));
        isManualScrollRef.current = false;
      }, 500);
    },
    [state.isEnabled, state.currentSection, sectionCount, smoothScroll, scrollBehavior]
  );

  // Handle wheel events for desktop
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!state.isEnabled || state.isScrolling || isManualScrollRef.current) return;

      const now = Date.now();
      const timeDelta = now - lastScrollTimeRef.current;

      // Prevent default scrolling for section navigation
      event.preventDefault();

      // Accumulate scroll delta
      accumulatedDeltaRef.current += event.deltaY;

      // Reset accumulated delta if too much time has passed
      if (timeDelta > 150) {
        accumulatedDeltaRef.current = event.deltaY;
      }

      lastScrollTimeRef.current = now;

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce scroll handling
      scrollTimeoutRef.current = setTimeout(() => {
        const delta = accumulatedDeltaRef.current;
        const absThreshold = threshold * 1000; // Convert to pixel threshold

        if (Math.abs(delta) > absThreshold) {
          if (delta > 0 && state.currentSection < sectionCount - 1) {
            // Scroll down
            goToSection(state.currentSection + 1);
          } else if (delta < 0 && state.currentSection > 0) {
            // Scroll up
            goToSection(state.currentSection - 1);
          }
        }

        accumulatedDeltaRef.current = 0;
      }, debounceMs);
    },
    [state.isEnabled, state.isScrolling, state.currentSection, sectionCount, threshold, debounceMs, goToSection]
  );

  // Handle touch events for mobile
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
      if (!enableTouch || !state.isEnabled || !touchStartRef.current || state.isScrolling) return;

      const touch = event.changedTouches[0];
      const deltaY = touchStartRef.current.y - touch.clientY;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Minimum swipe distance and maximum time for gesture recognition
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      if (Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime) {
        event.preventDefault();
        
        if (deltaY > 0 && state.currentSection < sectionCount - 1) {
          // Swipe up = scroll down
          goToSection(state.currentSection + 1);
        } else if (deltaY < 0 && state.currentSection > 0) {
          // Swipe down = scroll up
          goToSection(state.currentSection - 1);
        }
      }

      touchStartRef.current = null;
    },
    [enableTouch, state.isEnabled, state.isScrolling, state.currentSection, sectionCount, goToSection]
  );

  // Handle scroll events to update section progress (for Hero animations)
  const handleScroll = useCallback(() => {
    if (isManualScrollRef.current) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate which section we're in based on scroll position
    let currentSection = Math.floor(scrollY / windowHeight);
    currentSection = Math.max(0, Math.min(currentSection, sectionCount - 1));

    // Calculate progress within current section (for Hero animations)
    const sectionStart = currentSection * windowHeight;
    const sectionProgress = Math.max(0, Math.min(1, (scrollY - sectionStart) / windowHeight));

    setState(prev => ({
      ...prev,
      currentSection,
      sectionProgress,
    }));
  }, [sectionCount]);

  // Set up event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isEnabled || state.isScrolling) return;

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

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    state.isEnabled,
    state.isScrolling,
    state.currentSection,
    sectionCount,
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