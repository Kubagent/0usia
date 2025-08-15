// Export all hooks for easy importing
export { useOptimizedScrollLock } from './useOptimizedScrollLock';
export { useScrollLock } from './useScrollLock';
export { useBackgroundTransition } from './useBackgroundTransition';
export { useCarousel } from './useCarousel';
export { useRotatingCards } from './useRotatingCards';
export { useScrollDirection } from './useScrollDirection';
export { useWillChange } from './useWillChange';
export { useMobileScrollOptimization } from './useMobileScrollOptimization';
export { useMobileDetection } from './useMobileDetection';

// Export types
export type { 
  OptimizedScrollLockOptions, 
  ScrollLockState, 
  PerformanceMetric 
} from './useOptimizedScrollLock';

export type { 
  ScrollLockOptions 
} from './useScrollLock';

export type {
  TouchGestureConfig,
  TouchMetrics,
  MobilePerformanceMetrics
} from './useMobileScrollOptimization';

export type {
  MobileDetectionResult
} from './useMobileDetection';