'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Venture {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  websiteUrl: string;
  description?: string;
}

// Sample venture data - replace with your actual ventures
const venturesData: Venture[] = [
  {
    id: 'venture-1',
    name: 'Venture Alpha',
    tagline: 'Revolutionizing digital experiences',
    logoUrl: '/ventures/alpha-logo.svg',
    websiteUrl: 'https://venturealpha.com',
    description: 'Leading innovation in digital transformation'
  },
  {
    id: 'venture-2',
    name: 'Venture Beta',
    tagline: 'Sustainable technology solutions',
    logoUrl: '/ventures/beta-logo.svg',
    websiteUrl: 'https://venturebeta.com',
    description: 'Building the future of sustainable tech'
  },
  {
    id: 'venture-3',
    name: 'Venture Gamma',
    tagline: 'AI-powered business intelligence',
    logoUrl: '/ventures/gamma-logo.svg',
    websiteUrl: 'https://venturegamma.com',
    description: 'Transforming data into actionable insights'
  },
  {
    id: 'venture-4',
    name: 'Venture Delta',
    tagline: 'Next-generation financial services',
    logoUrl: '/ventures/delta-logo.svg',
    websiteUrl: 'https://venturedelta.com',
    description: 'Reimagining financial technology'
  },
  {
    id: 'venture-5',
    name: 'Venture Epsilon',
    tagline: 'Healthcare innovation platform',
    logoUrl: '/ventures/epsilon-logo.svg',
    websiteUrl: 'https://ventureepsilon.com',
    description: 'Advancing healthcare through technology'
  }
];

export default function VenturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % venturesData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % venturesData.length);
    setIsAutoPlay(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + venturesData.length) % venturesData.length);
    setIsAutoPlay(false);
  };

  const handleVentureClick = (index: number) => {
    if (index === currentIndex) {
      // If clicking current venture, navigate to website
      window.open(venturesData[index].websiteUrl, '_blank');
    } else {
      // If clicking adjacent venture, make it current
      setCurrentIndex(index);
      setIsAutoPlay(false);
    }
  };

  const getVisibleVentures = () => {
    const prevIndex = (currentIndex - 1 + venturesData.length) % venturesData.length;
    const nextIndex = (currentIndex + 1) % venturesData.length;
    
    return {
      prev: venturesData[prevIndex],
      current: venturesData[currentIndex],
      next: venturesData[nextIndex],
      prevIndex,
      nextIndex
    };
  };

  const { prev, current, next, prevIndex, nextIndex } = getVisibleVentures();

  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4">
            Proof of Ousia
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            Ventures we've helped bring to life
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-2 -translate-x-12"
            aria-label="Previous venture"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-2 translate-x-12"
            aria-label="Next venture"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Ventures Display */}
          <div className="flex items-center justify-between max-w-6xl mx-auto py-12">
            
            {/* Previous Venture - Left Side */}
            <motion.div
              key={`prev-${prevIndex}`}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => handleVentureClick(prevIndex)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-32 h-32 bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-300">
                <div className="text-white/60 group-hover:text-white/80 text-sm text-center px-3 leading-tight transition-colors duration-300">
                  {prev.name}
                </div>
              </div>
            </motion.div>

            {/* Current Venture - Center */}
            <motion.div
              key={`current-${currentIndex}`}
              className="flex-shrink-0 text-center cursor-pointer group mx-8"
              onClick={() => handleVentureClick(currentIndex)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Logo Placeholder - Much Bigger */}
              <div className="w-64 h-64 mx-auto mb-8 bg-white/10 border-2 border-white/30 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/50 transition-all duration-300 group-hover:scale-105">
                <div className="text-white/80 group-hover:text-white text-lg text-center px-6 leading-tight transition-colors duration-300">
                  {current.name}
                </div>
              </div>

              {/* Venture Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                    {current.name}
                  </h3>
                  <p className="text-gray-400 text-xl font-light max-w-md mx-auto leading-relaxed">
                    {current.tagline}
                  </p>
                  
                  {/* Visit Website Hint */}
                  <div className="text-sm text-white/40 group-hover:text-white/60 transition-colors duration-300 mt-6">
                    Click to visit website
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Next Venture - Right Side */}
            <motion.div
              key={`next-${nextIndex}`}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => handleVentureClick(nextIndex)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-32 h-32 bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-300">
                <div className="text-white/60 group-hover:text-white/80 text-sm text-center px-3 leading-tight transition-colors duration-300">
                  {next.name}
                </div>
              </div>
            </motion.div>

          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {venturesData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to venture ${index + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Auto-play Toggle - Dot/Donut Design */}
        <div className="text-center mt-8">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="group relative flex items-center justify-center w-8 h-8 transition-all duration-300"
            aria-label={isAutoPlay ? 'Pause auto-play' : 'Resume auto-play'}
          >
            {isAutoPlay ? (
              // Donut (circle outline when auto-play is ON)
              <div className="w-4 h-4 border-2 border-white/60 rounded-full group-hover:border-white/80 transition-colors duration-300" />
            ) : (
              // Dot (filled circle when auto-play is PAUSED)
              <div className="w-3 h-3 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors duration-300" />
            )}
          </button>
        </div>

      </div>
    </section>
  );
}