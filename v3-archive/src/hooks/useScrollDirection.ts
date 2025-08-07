import { useEffect, useState, useRef, useCallback } from 'react';

export type ScrollDirection = 'up' | 'down' | 'idle';

interface ScrollDirectionState {
  direction: ScrollDirection;
  velocity: number;
  isScrolling: boolean;
}

interface UseScrollDirectionOptions {
  threshold?: number;
  velocityThreshold?: number;
  idleDelay?: number;
  debounceMs?: number;
}

/**
 * Hook to detect scroll direction with velocity and state tracking
 * Optimized for performance with requestAnimationFrame throttling
 * 
 * @param options Configuration options
 * @returns Scroll direction state and utilities
 */
export function useScrollDirection({
  threshold = 10,
  velocityThreshold = 0.5,
  idleDelay = 150,
  debounceMs = 16, // ~60fps
}: UseScrollDirectionOptions = {}) {
  const [state, setState] = useState<ScrollDirectionState>({
    direction: 'idle',
    velocity: 0,
    isScrolling: false,
  });

  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout>();
  const rafId = useRef<number>();
  const isThrottled = useRef(false);

  const updateScrollDirection = useCallback((currentScrollY: number, timestamp: number) => {
    const deltaY = currentScrollY - lastScrollY.current;
    const deltaTime = timestamp - lastTimestamp.current;
    
    // Calculate velocity (pixels per millisecond)
    const velocity = deltaTime > 0 ? Math.abs(deltaY) / deltaTime : 0;
    
    // Only update direction if movement exceeds threshold
    let newDirection: ScrollDirection = state.direction;
    
    if (Math.abs(deltaY) > threshold && velocity > velocityThreshold) {
      newDirection = deltaY > 0 ? 'down' : 'up';
    }

    setState(prev => ({
      direction: newDirection,
      velocity,
      isScrolling: true,
    }));

    // Clear existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    // Set idle state after delay
    timeoutId.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        direction: 'idle',
        isScrolling: false,
        velocity: 0,
      }));
    }, idleDelay);

    lastScrollY.current = currentScrollY;
    lastTimestamp.current = timestamp;
  }, [threshold, velocityThreshold, idleDelay, state.direction]);

  const handleScroll = useCallback(() => {
    if (isThrottled.current) return;
    
    isThrottled.current = true;
    
    rafId.current = requestAnimationFrame((timestamp) => {
      const currentScrollY = window.scrollY;
      updateScrollDirection(currentScrollY, timestamp);
      
      setTimeout(() => {
        isThrottled.current = false;
      }, debounceMs);
    });
  }, [updateScrollDirection, debounceMs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize values
    lastScrollY.current = window.scrollY;
    lastTimestamp.current = performance.now();

    // Add passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return {
    direction: state.direction,
    velocity: state.velocity,
    isScrolling: state.isScrolling,
    isScrollingUp: state.direction === 'up',
    isScrollingDown: state.direction === 'down',
    isIdle: state.direction === 'idle',
  };
}

export default useScrollDirection;