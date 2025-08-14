'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CapabilityCard, RotatingCapabilityCardsProps } from '@/types/capability';
import CapabilityModal from './CapabilityModal';

/**
 * RotatingCapabilityCards Component
 * 
 * Features:
 * - Auto-rotation every 5 seconds (configurable)
 * - Hover to pause rotation
 * - Click to open detailed modal
 * - Smooth 3D-style rotation animation
 * - Responsive design with mobile-first approach
 * - Accessibility features (keyboard navigation, ARIA labels)
 * - Performance optimized with React.memo and useCallback
 * 
 * Usage:
 * <RotatingCapabilityCards 
 *   cards={capabilityData} 
 *   rotationInterval={5000}
 *   onCardClick={handleCardClick}
 * />
 */
const RotatingCapabilityCards: React.FC<RotatingCapabilityCardsProps> = ({
  cards,
  rotationInterval = 5000,
  className = '',
  onCardClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CapabilityCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation logic with pause functionality
  const startRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
      }
    }, rotationInterval);
  }, [cards.length, rotationInterval, isPaused]);

  const stopRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize rotation on mount
  useEffect(() => {
    startRotation();
    return () => stopRotation();
  }, [startRotation, stopRotation]);

  // Restart rotation when pause state changes
  useEffect(() => {
    if (!isPaused) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [isPaused, startRotation, stopRotation]);

  // Handle mouse events for pause functionality
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Handle card click
  const handleCardClick = useCallback((card: CapabilityCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
    onCardClick?.(card);
  }, [onCardClick]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCard(null);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? cards.length - 1 : prevIndex - 1
        );
        break;
      case 'ArrowRight':
        event.preventDefault();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleCardClick(cards[currentIndex]);
        break;
    }
  }, [cards, currentIndex, handleCardClick]);

  // Calculate rotation angle for 3D effect
  const getRotationAngle = (index: number) => {
    const totalCards = cards.length;
    const angleStep = 360 / totalCards;
    const currentAngle = -currentIndex * angleStep;
    return currentAngle + (index * angleStep);
  };

  // Animation variants
  const pillarVariants = {
    initial: { rotateY: 0 },
    animate: {
      rotateY: -currentIndex * (360 / cards.length),
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No capability cards available
      </div>
    );
  }

  return (
    <>
      <div 
        className={`relative w-full min-h-screen bg-white flex items-center justify-center overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Rotating capability cards"
        ref={containerRef}
      >
        {/* 3D Rotating Pillar Container */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 perspective-1000">
          <motion.div
            className="relative w-full h-full preserve-3d"
            variants={pillarVariants}
            initial="initial"
            animate="animate"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          >
            {cards.map((card, index) => {
              const angle = getRotationAngle(index);
              const isActive = index === currentIndex;
              
              return (
                <motion.div
                  key={card.id}
                  className={`absolute inset-0 rounded-xl cursor-pointer backface-hidden ${
                    isActive ? 'z-10' : 'z-0'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(200px)`,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform'
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  onClick={() => handleCardClick(card)}
                  role="button"
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${card.title} capability card`}
                >
                  {/* Card Content */}
                  <div 
                    className={`w-full h-full ${card.color} rounded-xl shadow-2xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center backface-hidden`}
                  >
                    {/* Icon */}
                    <div className="text-6xl mb-6" role="img" aria-label={card.title}>
                      {card.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 font-cormorant">
                      {card.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-base md:text-lg leading-relaxed font-cormorant opacity-80">
                      {card.description}
                    </p>
                    
                    {/* Click indicator */}
                    <div className="mt-6 text-sm opacity-70">
                      Click to learn more
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {cards.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-gray-800 scale-125' 
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        {/* Pause Indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm"
            >
              Rotation Paused
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Instructions */}
        <div className="absolute top-4 right-4 text-sm text-gray-500 hidden md:block">
          Use ← → keys to navigate, Enter to select
        </div>
      </div>

      {/* Modal */}
      <CapabilityModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
};

const MemoizedRotatingCapabilityCards = React.memo(RotatingCapabilityCards);
MemoizedRotatingCapabilityCards.displayName = 'RotatingCapabilityCards';

export default MemoizedRotatingCapabilityCards;