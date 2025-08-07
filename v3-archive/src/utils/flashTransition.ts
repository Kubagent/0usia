import { MotionValue } from 'framer-motion';

/**
 * Configuration for flash transition effect
 */
interface FlashTransitionConfig {
  flashOpacity: MotionValue<number>;
  targetElementId: string;
  flashDuration?: number;
  navigationDelay?: number;
  scrollBehavior?: ScrollBehavior;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Flash transition result
 */
interface FlashTransitionResult {
  success: boolean;
  error?: Error;
}

/**
 * Creates a white flash transition effect and navigates to target element
 * 
 * This utility function provides a reusable way to create dramatic white flash
 * transitions commonly used in modern web applications for section navigation.
 * 
 * Features:
 * - Configurable flash duration and navigation timing
 * - Smooth scroll to target element
 * - Error handling with fallback navigation
 * - Promise-based API for async operations
 * - Performance optimized with requestAnimationFrame
 * 
 * @param config Configuration object for the flash transition
 * @returns Promise that resolves with transition result
 */
export async function createFlashTransition({
  flashOpacity,
  targetElementId,
  flashDuration = 150,
  navigationDelay = 100,
  scrollBehavior = 'smooth',
  onComplete,
  onError,
}: FlashTransitionConfig): Promise<FlashTransitionResult> {
  try {
    // Validate target element exists
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
      throw new Error(`Target element with id "${targetElementId}" not found`);
    }

    // Start flash effect
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        flashOpacity.set(1);

        // Navigate after flash duration
        setTimeout(() => {
          try {
            targetElement.scrollIntoView({
              behavior: scrollBehavior,
              block: 'start',
              inline: 'nearest',
            });

            // Reset flash after navigation delay
            setTimeout(() => {
              flashOpacity.set(0);
              
              if (onComplete) {
                onComplete();
              }

              resolve({ success: true });
            }, navigationDelay);

          } catch (navigationError) {
            // Fallback: reset flash and report error
            flashOpacity.set(0);
            const error = navigationError instanceof Error 
              ? navigationError 
              : new Error('Navigation failed');
            
            if (onError) {
              onError(error);
            }

            resolve({ success: false, error });
          }
        }, flashDuration);
      });
    });

  } catch (error) {
    // Handle immediate errors (e.g., target not found)
    const err = error instanceof Error ? error : new Error('Flash transition failed');
    
    if (onError) {
      onError(err);
    }

    // Fallback navigation without flash
    try {
      const targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: scrollBehavior,
          block: 'start',
        });
      }
    } catch (fallbackError) {
      console.error('Fallback navigation also failed:', fallbackError);
    }

    return { success: false, error: err };
  }
}

/**
 * Creates a simple flash effect without navigation
 * 
 * Useful for providing visual feedback without changing the current view.
 * 
 * @param flashOpacity Motion value controlling flash opacity
 * @param duration Flash duration in milliseconds
 * @returns Promise that resolves when flash completes
 */
export async function createSimpleFlash(
  flashOpacity: MotionValue<number>,
  duration: number = 150
): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      flashOpacity.set(1);
      
      setTimeout(() => {
        flashOpacity.set(0);
        resolve();
      }, duration);
    });
  });
}

/**
 * Custom hook for managing flash transition state
 * 
 * Provides a React hook interface for flash transitions with
 * built-in state management and cleanup.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export function useFlashTransition() {
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const flashOpacityRef = useRef<MotionValue<number> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Initialize flash opacity motion value
   */
  const initializeFlashOpacity = useCallback((motionValue: MotionValue<number>) => {
    flashOpacityRef.current = motionValue;
  }, []);

  /**
   * Trigger flash transition with cleanup
   */
  const triggerFlash = useCallback(async (
    targetElementId: string,
    config?: Partial<FlashTransitionConfig>
  ): Promise<FlashTransitionResult> => {
    if (!flashOpacityRef.current) {
      throw new Error('Flash opacity not initialized. Call initializeFlashOpacity first.');
    }

    setIsFlashing(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      const result = await createFlashTransition({
        flashOpacity: flashOpacityRef.current,
        targetElementId,
        ...config,
      });

      return result;
    } finally {
      // Ensure flash state is reset
      timeoutRef.current = setTimeout(() => {
        setIsFlashing(false);
      }, (config?.flashDuration || 150) + (config?.navigationDelay || 100) + 50);
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isFlashing,
    initializeFlashOpacity,
    triggerFlash,
  };
}

export default createFlashTransition;