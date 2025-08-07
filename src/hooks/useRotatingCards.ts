import { useState, useEffect, useCallback, useRef } from 'react';
import { CapabilityCard } from '@/types/capability';

/**
 * Custom hook for managing rotating cards logic
 * Separates business logic from UI components for better testability and reusability
 */
export const useRotatingCards = (
  cards: CapabilityCard[],
  rotationInterval: number = 5000
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  }, [cards.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1
    );
  }, [cards.length]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < cards.length) {
      setCurrentIndex(index);
    }
  }, [cards.length]);

  // Auto-rotation management
  const startRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (!isPaused && !isHovered) {
      intervalRef.current = setInterval(goToNext, rotationInterval);
    }
  }, [goToNext, rotationInterval, isPaused, isHovered]);

  const stopRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Effect for managing rotation
  useEffect(() => {
    startRotation();
    return stopRotation;
  }, [startRotation, stopRotation]);

  // Effect for restarting rotation when pause/hover state changes
  useEffect(() => {
    if (!isPaused && !isHovered) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [isPaused, isHovered, startRotation, stopRotation]);

  // Keyboard navigation handler
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
      case 'Home':
        event.preventDefault();
        goToIndex(0);
        break;
      case 'End':
        event.preventDefault();
        goToIndex(cards.length - 1);
        break;
    }
  }, [goToPrevious, goToNext, goToIndex, cards.length]);

  return {
    currentIndex,
    isPaused: isPaused || isHovered,
    isHovered,
    goToNext,
    goToPrevious,
    goToIndex,
    pause,
    resume,
    handleMouseEnter,
    handleMouseLeave,
    handleKeyDown,
    currentCard: cards[currentIndex],
  };
};