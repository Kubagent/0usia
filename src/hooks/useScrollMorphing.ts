import { useCallback, useEffect, useState } from 'react';
import { MotionValue } from 'framer-motion';

/**
 * Interface for scroll morphing configuration
 */
interface ScrollMorphingConfig {
  words: readonly string[];
  scrollProgress: MotionValue<number>;
  startProgress?: number;
  endProgress?: number;
  isPaused?: boolean;
  animationDuration?: number;
}

/**
 * Interface for scroll morphing state
 */
interface ScrollMorphingState {
  currentIndex: number;
  isAnimating: boolean;
  previousIndex: number;
}

/**
 * Custom hook for scroll-linked word morphing animations
 * 
 * Provides optimized scroll-based word transitions with:
 * - Performance optimized state management
 * - Configurable scroll ranges
 * - Animation state tracking
 * - Pause/resume functionality
 * - Error handling
 * 
 * @param config Configuration object for the morphing animation
 * @returns State and control functions for word morphing
 */
export function useScrollMorphing({
  words,
  scrollProgress,
  startProgress = 0.1,
  endProgress = 0.9,
  isPaused = false,
  animationDuration = 300,
}: ScrollMorphingConfig) {
  // State management
  const [state, setState] = useState<ScrollMorphingState>({
    currentIndex: 0,
    isAnimating: false,
    previousIndex: -1,
  });

  /**
   * Calculate word index based on scroll progress
   */
  const calculateWordIndex = useCallback((scrollValue: number): number => {
    if (scrollValue < startProgress || scrollValue > endProgress) {
      return 0;
    }

    const normalizedProgress = (scrollValue - startProgress) / (endProgress - startProgress);
    const segmentSize = 1 / words.length;
    const rawIndex = Math.floor(normalizedProgress / segmentSize);
    
    return Math.max(0, Math.min(words.length - 1, rawIndex));
  }, [words.length, startProgress, endProgress]);

  /**
   * Handle scroll progress changes with debouncing
   */
  const handleScrollChange = useCallback((scrollValue: number) => {
    if (isPaused || state.isAnimating) return;

    const newIndex = calculateWordIndex(scrollValue);
    
    if (newIndex !== state.currentIndex) {
      setState(prev => ({
        ...prev,
        currentIndex: newIndex,
        isAnimating: true,
        previousIndex: prev.currentIndex,
      }));

      // Reset animation state after duration
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isAnimating: false,
        }));
      }, animationDuration);
    }
  }, [
    isPaused,
    state.isAnimating,
    state.currentIndex,
    calculateWordIndex,
    animationDuration
  ]);

  /**
   * Set up scroll progress listener with error handling
   */
  useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (value) => {
      try {
        handleScrollChange(value);
      } catch (error) {
        console.error('Error in scroll morphing:', error);
      }
    });

    return unsubscribe;
  }, [scrollProgress, handleScrollChange]);

  /**
   * Reset to first word when paused state changes
   */
  useEffect(() => {
    if (isPaused) {
      setState(prev => ({
        ...prev,
        isAnimating: false,
      }));
    }
  }, [isPaused]);

  return {
    currentWord: words[state.currentIndex],
    currentIndex: state.currentIndex,
    previousIndex: state.previousIndex,
    isAnimating: state.isAnimating,
    progress: (state.currentIndex / (words.length - 1)) * 100,
  };
}

export default useScrollMorphing;