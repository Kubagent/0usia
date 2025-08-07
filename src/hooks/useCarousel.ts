import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Configuration options for the carousel hook
 */
export interface UseCarouselOptions {
  /** Total number of items in the carousel */
  itemCount: number;
  /** Auto-advance interval in milliseconds */
  autoplayInterval?: number;
  /** Whether to enable autoplay */
  autoplay?: boolean;
  /** Whether to pause on hover */
  pauseOnHover?: boolean;
  /** Whether to loop back to the first item after the last */
  loop?: boolean;
  /** Initial slide index */
  initialIndex?: number;
}

/**
 * Return type for the carousel hook
 */
export interface UseCarouselReturn {
  /** Current active slide index */
  currentIndex: number;
  /** Whether the carousel is currently paused */
  isPaused: boolean;
  /** Whether the carousel is being hovered */
  isHovered: boolean;
  /** Progress of current slide (0-100) */
  progress: number;
  /** Go to next slide */
  goToNext: () => void;
  /** Go to previous slide */
  goToPrevious: () => void;
  /** Go to specific slide by index */
  goToSlide: (index: number) => void;
  /** Pause the carousel */
  pause: () => void;
  /** Resume the carousel */
  resume: () => void;
  /** Toggle pause state */
  togglePause: () => void;
  /** Handle mouse enter event */
  handleMouseEnter: () => void;
  /** Handle mouse leave event */
  handleMouseLeave: () => void;
  /** Reset progress to 0 */
  resetProgress: () => void;
}

/**
 * Custom hook for carousel functionality
 * 
 * Provides state management and controls for carousel components.
 * Handles autoplay, progress tracking, hover states, and navigation.
 * 
 * @param options - Configuration options for the carousel
 * @returns Carousel state and control functions
 * 
 * @example
 * ```tsx
 * const carousel = useCarousel({
 *   itemCount: 3,
 *   autoplayInterval: 4000,
 *   autoplay: true,
 *   pauseOnHover: true
 * });
 * 
 * return (
 *   <div 
 *     onMouseEnter={carousel.handleMouseEnter}
 *     onMouseLeave={carousel.handleMouseLeave}
 *   >
 *     Current slide: {carousel.currentIndex}
 *     Progress: {carousel.progress}%
 *   </div>
 * );
 * ```
 */
export const useCarousel = ({
  itemCount,
  autoplayInterval = 4000,
  autoplay = true,
  pauseOnHover = true,
  loop = true,
  initialIndex = 0
}: UseCarouselOptions): UseCarouselReturn => {
  // State management
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, Math.min(initialIndex, itemCount - 1)));
  const [isPaused, setIsPaused] = useState(!autoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  // Refs for interval management
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate the next index with optional looping
   */
  const getNextIndex = useCallback((current: number): number => {
    if (current >= itemCount - 1) {
      return loop ? 0 : current;
    }
    return current + 1;
  }, [itemCount, loop]);

  /**
   * Calculate the previous index with optional looping
   */
  const getPreviousIndex = useCallback((current: number): number => {
    if (current <= 0) {
      return loop ? itemCount - 1 : current;
    }
    return current - 1;
  }, [itemCount, loop]);

  /**
   * Start progress animation
   */
  const startProgressAnimation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setProgress(0);
    const progressStep = 100 / (autoplayInterval / 16); // 60fps updates

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return Math.min(prev + progressStep, 100);
      });
    }, 16);
  }, [autoplayInterval]);

  /**
   * Stop progress animation
   */
  const stopProgressAnimation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * Start autoplay
   */
  const startAutoplay = useCallback(() => {
    if (!autoplay || itemCount <= 1) return;

    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }

    autoplayIntervalRef.current = setInterval(() => {
      if (!isPaused && !(pauseOnHover && isHovered)) {
        setCurrentIndex(prev => getNextIndex(prev));
      }
    }, autoplayInterval);

    startProgressAnimation();
  }, [autoplay, itemCount, isPaused, isHovered, pauseOnHover, autoplayInterval, getNextIndex, startProgressAnimation]);

  /**
   * Stop autoplay
   */
  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    stopProgressAnimation();
  }, [stopProgressAnimation]);

  /**
   * Navigation functions
   */
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => getNextIndex(prev));
    setProgress(0);
  }, [getNextIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => getPreviousIndex(prev));
    setProgress(0);
  }, [getPreviousIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setCurrentIndex(index);
      setProgress(0);
    }
  }, [itemCount]);

  /**
   * Pause/resume functions
   */
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  /**
   * Mouse event handlers
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  /**
   * Reset progress
   */
  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  // Effect to manage autoplay based on state changes
  useEffect(() => {
    const shouldPlay = autoplay && !isPaused && !(pauseOnHover && isHovered);
    
    if (shouldPlay) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => stopAutoplay();
  }, [autoplay, isPaused, isHovered, pauseOnHover, startAutoplay, stopAutoplay]);

  // Effect to restart progress when slide changes
  useEffect(() => {
    if (autoplay && !isPaused && !(pauseOnHover && isHovered)) {
      startProgressAnimation();
    } else {
      stopProgressAnimation();
    }
  }, [currentIndex, autoplay, isPaused, isHovered, pauseOnHover, startProgressAnimation, stopProgressAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoplay();
    };
  }, [stopAutoplay]);

  // Validate itemCount changes
  useEffect(() => {
    if (currentIndex >= itemCount) {
      setCurrentIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, currentIndex]);

  return {
    currentIndex,
    isPaused,
    isHovered,
    progress,
    goToNext,
    goToPrevious,
    goToSlide,
    pause,
    resume,
    togglePause,
    handleMouseEnter,
    handleMouseLeave,
    resetProgress
  };
};

/**
 * Keyboard navigation hook for carousel
 * 
 * Provides keyboard event handling for carousel navigation.
 * 
 * @param carousel - Carousel controls from useCarousel
 * @param onEscape - Optional callback for escape key
 * @returns Keyboard event handler
 */
export const useCarouselKeyboard = (
  carousel: Pick<UseCarouselReturn, 'goToNext' | 'goToPrevious' | 'togglePause'>,
  onEscape?: () => void
) => {
  return useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        carousel.goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        carousel.goToNext();
        break;
      case ' ':
        event.preventDefault();
        carousel.togglePause();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [carousel.goToNext, carousel.goToPrevious, carousel.togglePause, onEscape]);
};

/**
 * Touch/swipe navigation hook for carousel
 * 
 * Provides touch event handling for mobile swipe navigation.
 * 
 * @param carousel - Carousel controls from useCarousel
 * @param swipeThreshold - Minimum distance for a swipe (default: 50px)
 * @returns Touch event handlers
 */
export const useCarouselTouch = (
  carousel: Pick<UseCarouselReturn, 'goToNext' | 'goToPrevious'>,
  swipeThreshold: number = 50
) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        carousel.goToNext();
      } else {
        carousel.goToPrevious();
      }
    }
  }, [carousel.goToNext, carousel.goToPrevious, swipeThreshold]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

export default useCarousel;