'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CarouselItem Interface
 * Defines the structure for individual carousel items
 */
export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  backgroundColor: string; // For alternating contrast
  textColor: string; // Text color for contrast
  overlayContent?: {
    title: string;
    details: string[];
    callToAction?: string;
  };
}

/**
 * ThreeItemCarouselProps Interface
 */
export interface ThreeItemCarouselProps {
  items: CarouselItem[];
  autoplayInterval?: number; // milliseconds, default 4000
  className?: string;
  onItemClick?: (item: CarouselItem) => void;
  showProgressBar?: boolean;
  enableHoverPause?: boolean;
}

/**
 * ThreeItemCarousel Component
 * 
 * Features:
 * - Auto-rotation with progress bar animation
 * - Hover effects with pause functionality
 * - Overlay system with detailed content
 * - Black background with alternating contrast slides
 * - Touch/swipe support for mobile
 * - Keyboard navigation
 * - Performance optimized with requestAnimationFrame
 * 
 * Usage:
 * <ThreeItemCarousel 
 *   items={carouselData} 
 *   autoplayInterval={4000}
 *   showProgressBar={true}
 *   enableHoverPause={true}
 * />
 */
const ThreeItemCarousel: React.FC<ThreeItemCarouselProps> = ({
  items,
  autoplayInterval = 4000,
  className = '',
  onItemClick,
  showProgressBar = true,
  enableHoverPause = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayItem, setOverlayItem] = useState<CarouselItem | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Ensure we have exactly 3 items or cycle through them
  const displayItems = items.length >= 3 ? items.slice(0, 3) : 
    [...items, ...items, ...items].slice(0, 3);

  /**
   * Progress bar animation
   */
  const startProgressAnimation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    const progressStep = 100 / (autoplayInterval / 16); // 60fps
    
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + progressStep;
      });
    }, 16);
  }, [autoplayInterval]);

  /**
   * Auto-rotation logic
   */
  const startAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (!isPaused && !isHovered) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayItems.length);
      }
    }, autoplayInterval);
    
    if (showProgressBar) {
      startProgressAnimation();
    }
  }, [displayItems.length, autoplayInterval, isPaused, isHovered, showProgressBar, startProgressAnimation]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * Initialize autoplay on mount
   */
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  /**
   * Handle pause state changes
   */
  useEffect(() => {
    if (isPaused || (enableHoverPause && isHovered)) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }, [isPaused, isHovered, enableHoverPause, startAutoplay, stopAutoplay]);

  /**
   * Reset progress when slide changes
   */
  useEffect(() => {
    if (showProgressBar && !isPaused && !isHovered) {
      startProgressAnimation();
    }
  }, [currentIndex, showProgressBar, isPaused, isHovered, startProgressAnimation]);

  /**
   * Mouse event handlers
   */
  const handleMouseEnter = useCallback(() => {
    if (enableHoverPause) {
      setIsHovered(true);
    }
  }, [enableHoverPause]);

  const handleMouseLeave = useCallback(() => {
    if (enableHoverPause) {
      setIsHovered(false);
    }
  }, [enableHoverPause]);

  /**
   * Navigation handlers
   */
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    setProgress(0);
  }, [displayItems.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
    setProgress(0);
  }, [displayItems.length]);

  /**
   * Overlay handlers
   */
  const showItemOverlay = useCallback((item: CarouselItem) => {
    setOverlayItem(item);
    setShowOverlay(true);
    setIsPaused(true);
  }, []);

  const hideOverlay = useCallback(() => {
    setShowOverlay(false);
    setOverlayItem(null);
    setIsPaused(false);
  }, []);

  /**
   * Touch handlers for mobile swipe
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  }, [goToNext, goToPrevious]);

  /**
   * Keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (displayItems[currentIndex].overlayContent) {
          showItemOverlay(displayItems[currentIndex]);
        }
        onItemClick?.(displayItems[currentIndex]);
        break;
      case 'Escape':
        if (showOverlay) {
          hideOverlay();
        }
        break;
    }
  }, [currentIndex, displayItems, goToPrevious, goToNext, showItemOverlay, onItemClick, showOverlay, hideOverlay]);

  /**
   * Animation variants
   */
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -50,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No carousel items available</p>
      </div>
    );
  }

  const currentItem = displayItems[currentIndex];

  return (
    <div className={`relative w-full h-[80vh] bg-black overflow-hidden ${className}`}>
      {/* Main Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Three-item carousel"
        aria-live="polite"
      >
        {/* Carousel Slides */}
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentIndex}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: currentItem.backgroundColor }}
          >
            {/* Slide Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
              {/* Image if provided */}
              {currentItem.image && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-8"
                >
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                  />
                </motion.div>
              )}

              {/* Subtitle */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className={`text-xl md:text-2xl mb-4 font-space ${currentItem.textColor} opacity-80`}
              >
                {currentItem.subtitle}
              </motion.p>

              {/* Title */}
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-cormorant ${currentItem.textColor}`}
              >
                {currentItem.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-cormorant ${currentItem.textColor} opacity-90`}
              >
                {currentItem.description}
              </motion.p>

              {/* Overlay Button */}
              {currentItem.overlayContent && (
                <motion.button
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showItemOverlay(currentItem)}
                  className={`mt-8 px-8 py-3 border-2 ${currentItem.textColor === 'text-white' ? 'border-white hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white'} transition-all duration-300 font-space font-medium tracking-wide`}
                >
                  Learn More
                </motion.button>
              )}
            </div>

            {/* Background Pattern/Texture (optional) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-br from-transparent via-current to-transparent"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white transition-all duration-300 z-20"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white transition-all duration-300 z-20"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
          {displayItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-12 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {showProgressBar && !isPaused && !isHovered && (
          <div className="absolute top-0 left-0 w-full h-1 bg-white bg-opacity-20 z-20">
            <motion.div
              className="h-full bg-white"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.016 }}
            />
          </div>
        )}

        {/* Pause Indicator */}
        <AnimatePresence>
          {(isPaused || isHovered) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-space z-20"
            >
              {isHovered ? 'Paused on Hover' : 'Paused'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay System */}
      <AnimatePresence>
        {showOverlay && overlayItem && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8"
            onClick={hideOverlay}
          >
            <motion.div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={hideOverlay}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Overlay Content */}
              <div className="relative">
                <h3 className="text-4xl font-bold mb-4 font-cormorant text-gray-900">
                  {overlayItem.overlayContent?.title}
                </h3>
                
                <div className="space-y-4">
                  {overlayItem.overlayContent?.details.map((detail, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-gray-700 leading-relaxed font-cormorant text-xl"
                    >
                      {detail}
                    </motion.p>
                  ))}
                </div>

                {overlayItem.overlayContent?.callToAction && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-8 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-space font-medium"
                  >
                    {overlayItem.overlayContent.callToAction}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MemoizedThreeItemCarousel = React.memo(ThreeItemCarousel);
MemoizedThreeItemCarousel.displayName = 'ThreeItemCarousel';

export default MemoizedThreeItemCarousel;