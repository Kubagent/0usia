'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingWordAnimationProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function RotatingWordAnimation({ 
  words = ['Venture', 'Vision', 'Virtue'],
  interval = 2500,
  className = ''
}: RotatingWordAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ 
            y: 50,
            opacity: 0,
            filter: 'blur(10px)'
          }}
          animate={{ 
            y: 0,
            opacity: 1,
            filter: 'blur(0px)'
          }}
          exit={{ 
            y: -50,
            opacity: 0,
            filter: 'blur(10px)'
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1], // Custom easing for professional feel
            opacity: { duration: 0.6 },
            filter: { duration: 0.6 }
          }}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            // Ensure the text stays centered during animation
            width: '100%',
            height: '100%'
          }}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
      
      {/* Invisible placeholder to maintain layout space */}
      <span className="opacity-0 select-none pointer-events-none">
        {/* Use the longest word to reserve space */}
        {words.reduce((a, b) => a.length > b.length ? a : b)}
      </span>
    </div>
  );
}