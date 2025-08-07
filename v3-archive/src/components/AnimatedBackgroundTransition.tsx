"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useScrollWillChange } from '@/hooks/useWillChange';
import { createOptimizedSpring, createOptimizedOpacityTransform } from '@/utils/animationOptimizations';

interface AnimatedBackgroundTransitionProps {
  children: React.ReactNode;
  fromColor?: string;
  toColor?: string;
  enableReversal?: boolean;
  smoothness?: number;
  triggerOffset?: ["start end", "end start"] | ["start start", "end end"] | ["start center", "end center"];
}

/**
 * Enhanced AnimatedBackgroundTransition
 * Smooth background color transitions with scroll reversal support
 * Features performance optimizations and customizable color schemes
 */
export default function AnimatedBackgroundTransition({ 
  children,
  fromColor = "#ffffff",
  toColor = "#000000",
  enableReversal = true,
  smoothness = 0.3,
  triggerOffset = ["start end", "end start"]
}: AnimatedBackgroundTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const willChange = useScrollWillChange(true);
  
  const { direction, isScrolling } = useScrollDirection({
    threshold: 15,
    velocityThreshold: 0.8,
    idleDelay: 100,
  });

  // Observe scroll progress for this wrapper
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: triggerOffset,
    layoutEffect: false 
  });

  // Optimized spring animation for smoother transitions
  const springProgress = createOptimizedSpring(scrollYProgress, 'smooth');

  // Enhanced color interpolation with reversal support
  const backgroundColor = useTransform(
    springProgress,
    [0, 0.2, 0.8, 1],
    [
      fromColor,
      `color-mix(in srgb, ${fromColor} 70%, ${toColor} 30%)`,
      `color-mix(in srgb, ${fromColor} 20%, ${toColor} 80%)`,
      toColor
    ]
  );

  // Optimized gradient overlay
  const gradientOpacity = createOptimizedOpacityTransform(
    springProgress,
    [0, 0.3, 0.7, 1],
    [0, 0.1, 0.3, 0.5]
  );

  // Text color adaptation based on background
  const textColor = useTransform(
    springProgress,
    [0, 0.5, 1],
    ["#000000", "#666666", "#ffffff"]
  );

  return (
    <motion.div
      ref={(node) => {
        // @ts-ignore - Callback ref assignment
        ref.current = node;
        // @ts-ignore - Callback ref assignment  
        willChange.ref.current = node;
      }}
      className="animate-gpu animate-contain"
      style={{ 
        backgroundColor,
        color: textColor,
        width: '100%', 
        minHeight: '100vh',
        position: 'relative',
        willChange: 'background-color, color',
        isolation: 'isolate',
      }}
    >
      {/* Optional gradient overlay for enhanced visual richness */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)`,
          opacity: gradientOpacity,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Content container with proper stacking */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          Progress: {Math.round(scrollYProgress.get() * 100)}% | 
          Direction: {direction} | 
          Scrolling: {isScrolling ? 'Yes' : 'No'}
        </motion.div>
      )}
    </motion.div>
  );
}
