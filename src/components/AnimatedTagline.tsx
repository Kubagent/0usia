'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimatedTagline Component
 * 
 * Features:
 * - Word morphing animation between "vision", "venture", and "virtue"
 * - Continuous loop with smooth transitions
 * - Professional typography with Cormorant font
 * - Optimized for 60fps performance
 * - Centered layout with proper spacing
 * 
 * Usage:
 * <AnimatedTagline />
 */

interface AnimatedTaglineProps {
  className?: string;
  interval?: number; // milliseconds between word changes
}

const AnimatedTagline: React.FC<AnimatedTaglineProps> = ({
  className = '',
  interval = 2000
}) => {
  const words = ['vision', 'venture', 'virtue'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  const textVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.8,
      filter: 'blur(4px)'
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 1.2,
      filter: 'blur(4px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const letterVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="text-4xl md:text-5xl lg:text-6xl font-cormorant text-white leading-tight">
        <span>We get your </span>
        <span className="relative inline-block min-w-[200px] md:min-w-[250px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWordIndex}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex justify-center items-center text-white font-bold"
              style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
              }}
            >
              {words[currentWordIndex].split('').map((letter, index) => (
                <motion.span
                  key={`${currentWordIndex}-${index}`}
                  variants={letterVariants}
                  className="inline-block"
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>, realized</span>
      </div>
      
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Progress indicator dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {words.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentWordIndex 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-40'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: index === currentWordIndex ? 1.25 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

const MemoizedAnimatedTagline = React.memo(AnimatedTagline);
MemoizedAnimatedTagline.displayName = 'AnimatedTagline';

export default MemoizedAnimatedTagline;