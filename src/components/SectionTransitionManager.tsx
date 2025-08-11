/**
 * Section Transition Manager Component
 * 
 * Orchestrates unique animated transitions between section pairs for the Ovsia website.
 * Each section pair has a distinct visual transition effect that enhances the premium
 * "one flick = one section" navigation experience.
 * 
 * SECTION TRANSITIONS:
 * 1. Hero → Essence Manifesto: Flash transition (white flash effect)
 * 2. Essence Manifesto → Core Capabilities: Word morphing/text dissolve effect  
 * 3. Core Capabilities → Proof of Ousia: Rotating card spin-out transition
 * 4. Proof of Ousia → Choose Your Path: Carousel slide/wipe effect
 * 5. Choose Your Path → Stay in Ousia: Split screen merge animation
 * 6. Stay in Ousia → Hero (loop): Reverse fade/pulse effect
 * 
 * Features:
 * - 60fps performance optimization with GPU acceleration
 * - Bidirectional transitions (works for both scroll directions)
 * - Integrates with OptimizedScrollContainer and BackgroundTransitionManager
 * - Respects user's reduced motion preferences
 * - Professional, minimalist aesthetic aligned with Ovsia brand
 */

'use client';

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  useTransitionPerformanceMonitor, 
  useReducedMotion, 
  gpuAcceleration,
  optimizeElementForTransitions,
  cleanupElementAfterTransitions
} from '@/utils/sectionTransitionOptimizations';

export interface SectionTransitionManagerProps {
  /** Current active section index (0-based) */
  currentSection: number;
  /** Previous section index for transition direction */
  previousSection: number;
  /** Total number of sections */
  totalSections: number;
  /** Whether a transition is currently active */
  isTransitioning: boolean;
  /** Scroll velocity for transition intensity */
  scrollVelocity?: number;
  /** Enable performance profiling */
  enableProfiling?: boolean;
  /** Respect user's reduced motion preference */
  respectReducedMotion?: boolean;
  /** Callback when transition starts */
  onTransitionStart?: (fromSection: number, toSection: number) => void;
  /** Callback when transition completes */
  onTransitionComplete?: (toSection: number) => void;
  /** Custom transition duration override */
  transitionDuration?: number;
}

// Transition types for each section pair
type TransitionType = 
  | 'flash'           // Hero → Essence Manifesto
  | 'word-morph'      // Essence Manifesto → Core Capabilities  
  | 'card-spin'       // Core Capabilities → Proof of Ousia
  | 'carousel-slide'  // Proof of Ousia → Choose Your Path
  | 'split-merge'     // Choose Your Path → Stay in Ousia
  | 'reverse-fade'    // Stay in Ousia → Hero (loop)
  | 'none';           // No transition

// Configuration for each transition type
interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing: string | number[];
  direction: 'forward' | 'backward';
}

/**
 * Get the appropriate transition type based on current and previous sections
 */
function getTransitionType(fromSection: number, toSection: number, totalSections: number): TransitionConfig {
  const isForward = toSection > fromSection;
  const direction = isForward ? 'forward' : 'backward';
  
  // Handle looping (last section to first)
  if (fromSection === totalSections - 1 && toSection === 0) {
    return {
      type: 'reverse-fade',
      duration: 1000,
      easing: [0.23, 1, 0.32, 1],
      direction: 'forward'
    };
  }
  
  // Handle backward looping (first to last)
  if (fromSection === 0 && toSection === totalSections - 1) {
    return {
      type: 'reverse-fade',
      duration: 1000,
      easing: [0.23, 1, 0.32, 1], 
      direction: 'backward'
    };
  }

  // Define forward transitions
  const forwardTransitions: Record<string, TransitionConfig> = {
    '0-1': { // Hero → Essence Manifesto
      type: 'flash',
      duration: 300,
      easing: [0.25, 0.46, 0.45, 0.94],
      direction
    },
    '1-2': { // Essence Manifesto → Core Capabilities
      type: 'word-morph',
      duration: 800,
      easing: [0.16, 1, 0.3, 1],
      direction
    },
    '2-3': { // Core Capabilities → Proof of Ousia
      type: 'card-spin',
      duration: 900,
      easing: [0.68, -0.55, 0.265, 1.55],
      direction
    },
    '3-4': { // Proof of Ousia → Choose Your Path
      type: 'carousel-slide',
      duration: 700,
      easing: [0.645, 0.045, 0.355, 1],
      direction
    },
    '4-5': { // Choose Your Path → Stay in Ousia
      type: 'split-merge',
      duration: 850,
      easing: [0.23, 1, 0.32, 1],
      direction
    }
  };

  // For backward transitions, use the same configs but with backward direction
  const key = isForward ? `${fromSection}-${toSection}` : `${toSection}-${fromSection}`;
  const config = forwardTransitions[key];
  
  if (config) {
    return { ...config, direction };
  }

  // Default no transition
  return {
    type: 'none',
    duration: 0,
    easing: 'linear',
    direction
  };
}

/**
 * Main Section Transition Manager Component
 */
export const SectionTransitionManager: React.FC<SectionTransitionManagerProps> = ({
  currentSection,
  previousSection,
  totalSections,
  isTransitioning,
  scrollVelocity = 0,
  enableProfiling = false,
  respectReducedMotion = true,
  onTransitionStart,
  onTransitionComplete,
  transitionDuration
}) => {
  // Motion values for various transition effects
  const flashOpacity = useMotionValue(0);
  const morphProgress = useMotionValue(0);
  const spinRotation = useMotionValue(0);
  const slideOffset = useMotionValue(0);
  const splitProgress = useMotionValue(0);
  const fadeOpacity = useMotionValue(1);

  // Spring configurations for smooth animations
  const morphSpring = useSpring(morphProgress, { stiffness: 100, damping: 25 });
  const spinSpring = useSpring(spinRotation, { stiffness: 80, damping: 20 });
  const slideSpring = useSpring(slideOffset, { stiffness: 120, damping: 30 });
  const splitSpring = useSpring(splitProgress, { stiffness: 90, damping: 25 });
  const fadeSpring = useSpring(fadeOpacity, { stiffness: 100, damping: 30 });

  // State for transition management
  const [activeTransition, setActiveTransition] = useState<TransitionConfig | null>(null);
  const [transitionState, setTransitionState] = useState<'idle' | 'active' | 'completing'>('idle');
  
  // Performance monitoring and reduced motion hooks
  const { metrics, recordTransition } = useTransitionPerformanceMonitor();
  const prefersReducedMotion = useReducedMotion();

  /**
   * Execute Flash Transition (Hero → Essence Manifesto)
   */
  const executeFlashTransition = useCallback(async (config: TransitionConfig) => {
    const startTime = performance.now();
    
    try {
      // Quick white flash effect
      flashOpacity.set(1);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Fade out flash
      flashOpacity.set(0);
      
      // Record performance metrics
      const duration = performance.now() - startTime;
      recordTransition(duration);
      
      if (enableProfiling) {
        console.log(`[Flash Transition] Completed in ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[Flash Transition] Error:', error);
    }
  }, [flashOpacity, enableProfiling, recordTransition]);

  /**
   * Execute Word Morph Transition (Essence Manifesto → Core Capabilities)
   */
  const executeWordMorphTransition = useCallback(async (config: TransitionConfig) => {
    const startTime = performance.now();
    
    try {
      // Start morphing effect
      morphProgress.set(0);
      
      // Animate to full morph
      const morphAnimation = new Promise(resolve => {
        morphProgress.set(1);
        setTimeout(resolve, config.duration * 0.8);
      });
      
      await morphAnimation;
      
      // Reset for next use
      setTimeout(() => {
        morphProgress.set(0);
      }, config.duration * 0.2);
      
      if (enableProfiling) {
        const duration = performance.now() - startTime;
        console.log(`[Word Morph Transition] Completed in ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[Word Morph Transition] Error:', error);
    }
  }, [morphProgress, enableProfiling]);

  /**
   * Execute Card Spin Transition (Core Capabilities → Proof of Ousia)
   */
  const executeCardSpinTransition = useCallback(async (config: TransitionConfig) => {
    const startTime = performance.now();
    
    try {
      // Reset rotation
      spinRotation.set(0);
      
      // Spin animation
      const targetRotation = config.direction === 'forward' ? 360 : -360;
      spinRotation.set(targetRotation);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, config.duration));
      
      // Reset
      spinRotation.set(0);
      
      if (enableProfiling) {
        const duration = performance.now() - startTime;
        console.log(`[Card Spin Transition] Completed in ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[Card Spin Transition] Error:', error);
    }
  }, [spinRotation, enableProfiling]);

  /**
   * Execute Carousel Slide Transition (Proof of Ousia → Choose Your Path)  
   */
  const executeCarouselSlideTransition = useCallback(async (config: TransitionConfig) => {
    const startTime = performance.now();
    
    try {
      // Reset slide position
      slideOffset.set(0);
      
      // Slide animation
      const targetOffset = config.direction === 'forward' ? 100 : -100;
      slideOffset.set(targetOffset);
      
      // Wait for mid-transition
      await new Promise(resolve => setTimeout(resolve, config.duration * 0.5));
      
      // Complete slide
      slideOffset.set(config.direction === 'forward' ? -100 : 100);
      
      await new Promise(resolve => setTimeout(resolve, config.duration * 0.5));
      
      // Reset
      slideOffset.set(0);
      
      if (enableProfiling) {
        const duration = performance.now() - startTime;
        console.log(`[Carousel Slide Transition] Completed in ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[Carousel Slide Transition] Error:', error);
    }
  }, [slideOffset, enableProfiling]);

  /**
   * Execute Split Merge Transition (Choose Your Path → Stay in Ousia)
   */
  const executeSplitMergeTransition = useCallback(async (config: TransitionConfig) => {
    const startTime = performance.now();
    
    try {
      // Reset split progress
      splitProgress.set(0);
      
      // Split animation
      splitProgress.set(1);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, config.duration));
      
      // Reset
      splitProgress.set(0);
      
      if (enableProfiling) {
        const duration = performance.now() - startTime;
        console.log(`[Split Merge Transition] Completed in ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[Split Merge Transition] Error:', error);
    }
  }, [splitProgress, enableProfiling]);

  /**
   * Execute Reverse Fade Transition (Stay in Ousia → Hero loop)
   */
  const executeReverseFadeTransition = useCallback(async (config: TransitionConfig) => {
    const startTime = performance.now();
    
    try {
      // Start with full opacity
      fadeOpacity.set(1);
      
      // Fade out with pulse effect
      fadeOpacity.set(0.3);
      
      await new Promise(resolve => setTimeout(resolve, config.duration * 0.3));
      
      // Pulse up briefly
      fadeOpacity.set(0.7);
      
      await new Promise(resolve => setTimeout(resolve, config.duration * 0.2));
      
      // Complete fade
      fadeOpacity.set(1);
      
      await new Promise(resolve => setTimeout(resolve, config.duration * 0.5));
      
      if (enableProfiling) {
        const duration = performance.now() - startTime;
        console.log(`[Reverse Fade Transition] Completed in ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[Reverse Fade Transition] Error:', error);
    }
  }, [fadeOpacity, enableProfiling]);

  /**
   * Main transition executor
   */
  const executeTransition = useCallback(async (config: TransitionConfig) => {
    if (respectReducedMotion && prefersReducedMotion) {
      // Skip animations for reduced motion users
      if (onTransitionComplete) {
        onTransitionComplete(currentSection);
      }
      return;
    }

    setTransitionState('active');
    setActiveTransition(config);

    try {
      switch (config.type) {
        case 'flash':
          await executeFlashTransition(config);
          break;
        case 'word-morph':
          await executeWordMorphTransition(config);
          break;
        case 'card-spin':
          await executeCardSpinTransition(config);
          break;
        case 'carousel-slide':
          await executeCarouselSlideTransition(config);
          break;
        case 'split-merge':
          await executeSplitMergeTransition(config);
          break;
        case 'reverse-fade':
          await executeReverseFadeTransition(config);
          break;
        default:
          // No transition
          break;
      }
    } finally {
      setTransitionState('completing');
      
      // Brief delay before marking as idle
      setTimeout(() => {
        setTransitionState('idle');
        setActiveTransition(null);
        
        if (onTransitionComplete) {
          onTransitionComplete(currentSection);
        }
      }, 100);
    }
  }, [
    currentSection,
    prefersReducedMotion,
    onTransitionComplete,
    executeFlashTransition,
    executeWordMorphTransition, 
    executeCardSpinTransition,
    executeCarouselSlideTransition,
    executeSplitMergeTransition,
    executeReverseFadeTransition
  ]);

  /**
   * Handle section changes and trigger transitions
   */
  useEffect(() => {
    if (isTransitioning && currentSection !== previousSection) {
      const transitionConfig = getTransitionType(previousSection, currentSection, totalSections);
      
      if (transitionConfig.type !== 'none') {
        if (onTransitionStart) {
          onTransitionStart(previousSection, currentSection);
        }
        
        executeTransition(transitionConfig);
      }
    }
  }, [
    isTransitioning,
    currentSection,
    previousSection,
    totalSections,
    onTransitionStart,
    executeTransition
  ]);

  return (
    <>
      {/* Flash Overlay */}
      <motion.div
        className="fixed inset-0 z-40 bg-white pointer-events-none"
        style={{
          opacity: flashOpacity,
          willChange: 'opacity'
        }}
        initial={{ opacity: 0 }}
      />

      {/* Word Morph Overlay */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
        style={{
          opacity: morphSpring,
          willChange: 'opacity'
        }}
      >
        <div className="text-white text-6xl font-cormorant">
          <motion.span
            style={{
              filter: `blur(${morphSpring.get() * 10}px)`,
              willChange: 'filter'
            }}
          >
            Transforming...
          </motion.span>
        </div>
      </motion.div>

      {/* Card Spin Overlay */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
        style={{
          opacity: spinSpring.get() > 0 ? 0.8 : 0,
          willChange: 'opacity'
        }}
      >
        <motion.div
          className="w-64 h-40 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
          style={{
            rotateY: spinSpring,
            willChange: 'transform'
          }}
        />
      </motion.div>

      {/* Carousel Slide Overlay */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none overflow-hidden"
        style={{
          willChange: 'transform'
        }}
      >
        <motion.div
          className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{
            x: `${slideSpring.get()}%`,
            willChange: 'transform'
          }}
        />
      </motion.div>

      {/* Split Merge Overlay */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none"
        style={{
          willChange: 'transform'
        }}
      >
        <motion.div
          className="w-full h-full flex"
          style={{
            willChange: 'transform'
          }}
        >
          <motion.div
            className="flex-1 bg-black/20"
            style={{
              x: `${-50 + (splitSpring.get() * 50)}%`,
              willChange: 'transform'
            }}
          />
          <motion.div
            className="flex-1 bg-white/20"
            style={{
              x: `${50 - (splitSpring.get() * 50)}%`,
              willChange: 'transform'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Reverse Fade Overlay */}
      <motion.div
        className="fixed inset-0 z-30 bg-black pointer-events-none"
        style={{
          opacity: 1 - fadeSpring.get(),
          willChange: 'opacity'
        }}
      />

      {/* Performance Monitor (Development Only) */}
      {enableProfiling && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-50 min-w-[250px]">
          <div className="font-bold mb-2">Section Transitions</div>
          <div>State: {transitionState}</div>
          <div>Active: {activeTransition?.type || 'none'}</div>
          <div>Current Section: {currentSection}</div>
          <div>Previous Section: {previousSection}</div>
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="text-gray-300 mb-1">Performance Metrics:</div>
            <div>FPS: {metrics.frameRate.toFixed(1)}</div>
            <div>Frame Time: {metrics.averageFrameTime.toFixed(2)}ms</div>
            <div>Dropped Frames: {metrics.droppedFrames}</div>
            <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
            <div>GPU: {metrics.gpuAccelerated ? 'Yes' : 'No'}</div>
            <div>Transitions: {metrics.transitionCount}</div>
            <div>Last Duration: {metrics.lastTransitionDuration.toFixed(2)}ms</div>
            {respectReducedMotion && prefersReducedMotion && (
              <div className="text-yellow-400">Reduced Motion: ON</div>
            )}
          </div>
        </div>
      )}

      {/* Global CSS for transition optimizations */}
      <style jsx global>{`
        /* Optimize transition overlays for GPU acceleration */
        .transition-overlay {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Reduce motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .transition-overlay * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High performance blur effects */
        .morph-blur {
          filter: blur(0px);
          transition: filter 0.3s ease-out;
        }
        
        .morph-blur.active {
          filter: blur(10px);
        }
        
        /* GPU-accelerated card spin */
        .card-spin {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        /* Smooth slide animations */
        .carousel-slide {
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        
        /* Split merge optimizations */
        .split-panel {
          transform: translate3d(0, 0, 0);
          will-change: transform;
          contain: layout style paint;
        }
      `}</style>
    </>
  );
};

export default SectionTransitionManager;