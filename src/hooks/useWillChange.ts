import { useEffect, useRef, useCallback } from 'react';
import { WillChangeManager } from '@/utils/animationOptimizations';

/**
 * Hook for managing will-change CSS property for optimal animation performance
 * 
 * Automatically manages will-change properties during animations to:
 * - Promote elements to composite layer before animation starts
 * - Clean up will-change after animations complete
 * - Prevent memory leaks from persistent composite layers
 * 
 * @param properties - CSS properties that will be animated
 * @param enabled - Whether to enable will-change management
 */
export function useWillChange(
  properties: string[] = ['transform', 'opacity'],
  enabled: boolean = true
) {
  const elementRef = useRef<HTMLElement>(null);
  const isActiveRef = useRef(false);

  const startAnimation = useCallback(() => {
    if (!enabled || !elementRef.current || isActiveRef.current) return;
    
    isActiveRef.current = true;
    WillChangeManager.startAnimation(elementRef.current, properties);
  }, [properties, enabled]);

  const endAnimation = useCallback(() => {
    if (!enabled || !elementRef.current || !isActiveRef.current) return;
    
    isActiveRef.current = false;
    WillChangeManager.endAnimation(elementRef.current, properties);
  }, [properties, enabled]);

  const updateProperties = useCallback((newProperties: string[]) => {
    if (!enabled || !elementRef.current) return;
    
    if (isActiveRef.current) {
      // Remove old properties and add new ones
      WillChangeManager.endAnimation(elementRef.current, properties);
      WillChangeManager.startAnimation(elementRef.current, newProperties);
    }
  }, [properties, enabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Observe element for intersection-based cleanup
    WillChangeManager.observe(element);

    return () => {
      if (element) {
        WillChangeManager.endAnimation(element, properties);
        WillChangeManager.unobserve(element);
      }
    };
  }, [properties, enabled]);

  return {
    ref: elementRef,
    startAnimation,
    endAnimation,
    updateProperties,
    isActive: isActiveRef.current,
  };
}

/**
 * Hook for automatic will-change management during scroll animations
 */
export function useScrollWillChange(enabled: boolean = true) {
  return useWillChange(['transform', 'opacity'], enabled);
}

/**
 * Hook for automatic will-change management during hover animations  
 */
export function useHoverWillChange(enabled: boolean = true) {
  const willChange = useWillChange(['transform', 'opacity', 'filter'], enabled);

  const handleMouseEnter = useCallback(() => {
    willChange.startAnimation();
  }, [willChange]);

  const handleMouseLeave = useCallback(() => {
    willChange.endAnimation();
  }, [willChange]);

  return {
    ...willChange,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}

/**
 * Hook for managing will-change during touch interactions
 */
export function useTouchWillChange(enabled: boolean = true) {
  const willChange = useWillChange(['transform', 'opacity'], enabled);

  const handleTouchStart = useCallback(() => {
    willChange.startAnimation();
  }, [willChange]);

  const handleTouchEnd = useCallback(() => {
    // Delay cleanup to allow for any final animations
    setTimeout(() => {
      willChange.endAnimation();
    }, 100);
  }, [willChange]);

  return {
    ...willChange,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}