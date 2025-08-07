"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';
import { Cormorant_Garamond } from 'next/font/google';
import { useScrollMorphing } from '@/hooks/useScrollMorphing';
import { useFlashTransition } from '@/utils/flashTransition';

// Initialize Cormorant Garamond font with optimized loading
const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

/**
 * Essence Manifesto Section - Section 2 of Ovsia V4
 * 
 * Features:
 * - Black background with centered Cormorant Garamond 56px text
 * - Scroll-linked word morphing animation
 * - Hover interactions with animation freeze and underline pulse
 * - Click navigation to expertise section
 * - White flash transition effect
 * - Performance optimized with proper error handling
 * 
 * @returns {JSX.Element} The Essence Manifesto section component
 */
export default function EssenceManifestoSection(): JSX.Element {
  // Refs for DOM elements
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  // Component state management
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Motion values for performance optimization
  const flashOpacity = useMotionValue(0);
  
  // Scroll progress tracking with optimized offset values
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false
  });

  // Words for morphing animation - optimized sequence
  const morphingWords = [
    "Vision",
    "Purpose", 
    "Strategy",
    "Action",
    "Reality",
    "Essence"
  ] as const;

  // Initialize scroll morphing hook
  const { currentWord, isAnimating } = useScrollMorphing({
    words: morphingWords,
    scrollProgress: scrollYProgress,
    startProgress: 0.1,
    endProgress: 0.9,
    isPaused,
    animationDuration: 300,
  });

  // Initialize flash transition hook
  const { isFlashing, initializeFlashOpacity, triggerFlash } = useFlashTransition();

  // Base text structure
  const baseText = "From 0 → 1, We Make";
  const finalText = "Real.";

  // Scroll-linked transforms with eased transitions
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  /**
   * Handle component mounting and cleanup
   */
  useEffect(() => {
    setIsMounted(true);
    
    // Initialize flash opacity motion value
    initializeFlashOpacity(flashOpacity);

    return () => {
      setIsMounted(false);
    };
  }, [flashOpacity, initializeFlashOpacity]);

  /**
   * Handle mouse enter with animation pause
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsPaused(true);
  }, []);

  /**
   * Handle mouse leave with animation resume
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPaused(false);
  }, []);

  /**
   * Handle click navigation with white flash effect
   */
  const handleClick = useCallback(async () => {
    try {
      await triggerFlash('expertise-section', {
        flashDuration: 150,
        navigationDelay: 100,
        scrollBehavior: 'smooth',
        onError: (error) => {
          console.error('Flash transition error:', error);
        },
      });
    } catch (error) {
      console.error('Error in click navigation:', error);
    }
  }, [triggerFlash]);

  // Animation variants for word morphing
  const wordVariants = {
    enter: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateX: -15,
      transition: {
        duration: 0.3,
        ease: [0.55, 0.085, 0.68, 0.53], // Custom easing
      }
    }
  };

  // Underline pulse animation variants
  const underlineVariants = {
    hidden: {
      scaleX: 0,
      opacity: 0,
    },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      }
    },
    pulse: {
      scaleX: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  // White flash animation variants
  const flashVariants = {
    hidden: { 
      opacity: 0,
      pointerEvents: 'none' as const,
    },
    visible: { 
      opacity: 1,
      pointerEvents: 'auto' as const,
      transition: { 
        duration: 0.1,
        ease: "easeOut",
      } 
    },
    exit: { 
      opacity: 0,
      pointerEvents: 'none' as const,
      transition: { 
        duration: 0.2,
        ease: "easeIn",
      } 
    }
  };

  // Prevent hydration issues
  if (!isMounted) {
    return (
      <section 
        className={cormorantGaramond.className}
        style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#FFFFFF', fontSize: '56px' }}>
          From 0 → 1, We Make Essence Real.
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      ref={sectionRef}
      id="essence-manifesto-section"
      className={cormorantGaramond.className}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        willChange: 'transform',
        opacity: sectionOpacity,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Main content container */}
      <motion.div
        ref={textRef}
        style={{
          color: '#FFFFFF',
          fontSize: '56px',
          fontWeight: 400,
          lineHeight: 1.2,
          textAlign: 'center',
          maxWidth: '90%',
          position: 'relative',
          scale: textScale,
          y: textY,
        }}
      >
        {/* Base text */}
        <span>{baseText} </span>
        
        {/* Morphing word container */}
        <span style={{ position: 'relative', display: 'inline-block', minWidth: '200px' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWord}
              variants={wordVariants}
              initial="exit"
              animate="enter"
              exit="exit"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontWeight: 700,
              }}
            >
              {currentWord}
            </motion.span>
          </AnimatePresence>
        </span>
        
        {/* Final text */}
        <span> {finalText}</span>

        {/* Hover underline effect */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '2px',
            backgroundColor: '#FFFFFF',
            transformOrigin: 'center',
          }}
          variants={underlineVariants}
          initial="hidden"
          animate={isHovered ? "pulse" : "hidden"}
        />
      </motion.div>

      {/* White flash overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 9999,
              pointerEvents: 'none',
              opacity: flashOpacity,
            }}
            variants={flashVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Screen reader accessibility */}
      <div 
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        From 0 to 1, We Make {currentWord} Real. Click to view our expertise.
      </div>
    </motion.section>
  );
}