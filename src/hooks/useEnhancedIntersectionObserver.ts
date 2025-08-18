'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface IntersectionConfig {
  /** Root margin for intersection calculations */
  rootMargin?: string;
  /** Threshold values for intersection ratio */
  threshold?: number | number[];
  /** Root element for intersection (defaults to viewport) */
  root?: Element | null;
  /** Enable performance tracking */
  trackPerformance?: boolean;
  /** Debounce time for intersection callbacks */
  debounceMs?: number;
  /** Enable adaptive thresholds based on device performance */
  adaptiveThresholds?: boolean;
}

export interface IntersectionEntry {
  /** Target element */
  target: Element;
  /** Whether element is intersecting */
  isIntersecting: boolean;
  /** Intersection ratio (0-1) */
  intersectionRatio: number;
  /** Bounding rectangle of intersection */
  intersectionRect: DOMRectReadOnly;
  /** Root bounds */
  rootBounds: DOMRectReadOnly | null;
  /** Target bounds */
  boundingClientRect: DOMRectReadOnly;
  /** Timestamp of observation */
  time: number;
}

export interface PerformanceMetrics {
  averageCallbackTime: number;
  totalObservations: number;
  lastUpdateTime: number;
  maxCallbackTime: number;
  adaptiveThresholdLevel: number;
}

/**
 * Enhanced Intersection Observer hook optimized for 0usia V4 scroll performance.
 * 
 * Features:
 * - Adaptive thresholds based on device performance
 * - Debounced callbacks to prevent excessive updates
 * - Performance monitoring and optimization
 * - Smart threshold selection for different viewport sizes
 * - Memory leak prevention with proper cleanup
 */
export function useEnhancedIntersectionObserver(config: IntersectionConfig = {}) {
  const {
    rootMargin = '-10% 0px -10% 0px',
    threshold: initialThreshold = [0.1, 0.25, 0.5, 0.75, 0.9],
    root = null,
    trackPerformance = true,
    debounceMs = 16, // 60fps
    adaptiveThresholds = true,
  } = config;

  const [observedElements, setObservedElements] = useState<Map<Element, IntersectionEntry>>(new Map());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageCallbackTime: 0,
    totalObservations: 0,
    lastUpdateTime: 0,
    maxCallbackTime: 0,
    adaptiveThresholdLevel: 1,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbacksRef = useRef<Map<Element, (entry: IntersectionEntry) => void>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const performanceBufferRef = useRef<number[]>([]);
  const lastCallbackTimeRef = useRef<number>(0);

  // Adaptive threshold calculation based on device performance
  const calculateAdaptiveThresholds = useCallback(() => {
    if (!adaptiveThresholds) return initialThreshold;

    // Detect device performance characteristics
    const deviceMemory = (navigator as any).deviceMemory || 4; // GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const connectionSpeed = (navigator as any).connection?.effectiveType || '4g';

    // Calculate performance score (0-1)
    let performanceScore = 0;
    performanceScore += Math.min(deviceMemory / 8, 1) * 0.4; // Memory contribution
    performanceScore += Math.min(hardwareConcurrency / 8, 1) * 0.3; // CPU contribution
    
    // Network contribution
    const networkScoreMap = {
      'slow-2g': 0.1,
      '2g': 0.3,
      '3g': 0.6,
      '4g': 1.0,
    } as const;
    const networkScore = networkScoreMap[connectionSpeed as keyof typeof networkScoreMap] || 0.8;
    performanceScore += networkScore * 0.3;

    // Adjust thresholds based on performance
    if (performanceScore > 0.8) {
      // High performance: More granular thresholds
      return [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95];
    } else if (performanceScore > 0.5) {
      // Medium performance: Standard thresholds
      return [0.1, 0.25, 0.5, 0.75, 0.9];
    } else {
      // Low performance: Fewer thresholds
      return [0.25, 0.5, 0.75];
    }
  }, [adaptiveThresholds, initialThreshold]);

  // Debounced callback handler
  const handleIntersectionDebounced = useCallback((entries: globalThis.IntersectionObserverEntry[]) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const startTime = performance.now();
      
      const updatedElements = new Map(observedElements);
      
      entries.forEach((entry) => {
        const enhancedEntry: IntersectionEntry = {
          target: entry.target,
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          intersectionRect: entry.intersectionRect,
          rootBounds: entry.rootBounds,
          boundingClientRect: entry.boundingClientRect,
          time: entry.time,
        };

        updatedElements.set(entry.target, enhancedEntry);

        // Execute registered callback
        const callback = callbacksRef.current.get(entry.target);
        if (callback) {
          callback(enhancedEntry);
        }
      });

      setObservedElements(updatedElements);

      // Track performance
      if (trackPerformance) {
        const callbackTime = performance.now() - startTime;
        performanceBufferRef.current.push(callbackTime);
        
        // Keep only last 100 measurements
        if (performanceBufferRef.current.length > 100) {
          performanceBufferRef.current.shift();
        }

        // Update metrics
        const buffer = performanceBufferRef.current;
        const averageTime = buffer.reduce((a, b) => a + b, 0) / buffer.length;
        const maxTime = Math.max(...buffer);

        setPerformanceMetrics(prev => ({
          averageCallbackTime: averageTime,
          totalObservations: prev.totalObservations + entries.length,
          lastUpdateTime: Date.now(),
          maxCallbackTime: Math.max(prev.maxCallbackTime, maxTime),
          adaptiveThresholdLevel: prev.adaptiveThresholdLevel,
        }));

        // Adaptive optimization: increase debounce if performance is poor
        if (averageTime > 10 && debounceMs < 32) {
          console.warn('IntersectionObserver performance degraded, consider reducing observation frequency');
        }
      }

      lastCallbackTimeRef.current = performance.now();
    }, debounceMs);
  }, [observedElements, debounceMs, trackPerformance]);

  // Initialize observer
  useEffect(() => {
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver not supported');
      return;
    }

    const adaptiveThreshold = calculateAdaptiveThresholds();
    
    const observer = new IntersectionObserver(handleIntersectionDebounced, {
      root,
      rootMargin,
      threshold: adaptiveThreshold,
    });

    observerRef.current = observer;

    // Log configuration in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Enhanced IntersectionObserver initialized:', {
        rootMargin,
        threshold: adaptiveThreshold,
        debounceMs,
        adaptiveThresholds,
      });
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      observer.disconnect();
      observerRef.current = null;
    };
  }, [root, rootMargin, calculateAdaptiveThresholds, handleIntersectionDebounced]);

  // Observe element
  const observe = useCallback((
    element: Element,
    callback?: (entry: IntersectionEntry) => void
  ) => {
    if (!observerRef.current || !element) return;

    // Register callback if provided
    if (callback) {
      callbacksRef.current.set(element, callback);
    }

    observerRef.current.observe(element);
  }, []);

  // Unobserve element
  const unobserve = useCallback((element: Element) => {
    if (!observerRef.current || !element) return;

    observerRef.current.unobserve(element);
    callbacksRef.current.delete(element);
    
    setObservedElements(prev => {
      const updated = new Map(prev);
      updated.delete(element);
      return updated;
    });
  }, []);

  // Get intersection data for element
  const getIntersectionData = useCallback((element: Element) => {
    return observedElements.get(element) || null;
  }, [observedElements]);

  // Check if element is intersecting with specific ratio
  const isIntersecting = useCallback((
    element: Element,
    minRatio: number = 0.1
  ) => {
    const data = observedElements.get(element);
    return data ? data.isIntersecting && data.intersectionRatio >= minRatio : false;
  }, [observedElements]);

  // Get all currently intersecting elements
  const getIntersectingElements = useCallback((minRatio: number = 0.1) => {
    return Array.from(observedElements.entries())
      .filter(([, entry]) => entry.isIntersecting && entry.intersectionRatio >= minRatio)
      .map(([element]) => element);
  }, [observedElements]);

  // Disconnect all observations
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    callbacksRef.current.clear();
    setObservedElements(new Map());
  }, []);

  // Performance optimization: batch observe multiple elements
  const observeMultiple = useCallback((
    elements: Element[],
    callback?: (entries: IntersectionEntry[]) => void
  ) => {
    if (!observerRef.current) return;

    elements.forEach(element => {
      if (callback) {
        callbacksRef.current.set(element, (entry) => {
          // Collect all entries and call batch callback
          const allEntries = elements
            .map(el => observedElements.get(el))
            .filter(Boolean) as IntersectionEntry[];
          callback(allEntries);
        });
      }
      observerRef.current!.observe(element);
    });
  }, [observedElements]);

  return {
    // Core functionality
    observe,
    unobserve,
    disconnect,
    observeMultiple,
    
    // Data access
    getIntersectionData,
    isIntersecting,
    getIntersectingElements,
    observedElements: Array.from(observedElements.keys()),
    
    // Performance monitoring
    performanceMetrics,
    
    // Observer instance (for advanced usage)
    observer: observerRef.current,
  };
}