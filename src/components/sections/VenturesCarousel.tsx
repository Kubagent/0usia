'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Venture {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  websiteUrl: string;
  description?: string;
}

// Actual venture data with real logos
const venturesData: Venture[] = [
  {
    id: 'violca',
    name: 'Violca',
    tagline: 'Visual Innovation Platform',
    logoUrl: '/venture-logos/Violca-logo.png',
    websiteUrl: 'https://violca.com',
    description: 'Transforming visual experiences through technology'
  },
  {
    id: 'wojcistics',
    name: 'Wojcistics',
    tagline: 'Logistics Optimization',
    logoUrl: '/venture-logos/WOJCISTICS.png',
    websiteUrl: 'https://wojcistics.com',
    description: 'Revolutionary supply chain solutions'
  },
  {
    id: 'fix',
    name: 'Fix',
    tagline: 'Problem Resolution Platform',
    logoUrl: '/venture-logos/fix.png',
    websiteUrl: 'https://fix-platform.com',
    description: 'Streamlining problem resolution processes'
  },
  {
    id: 'libelo',
    name: 'Libelo',
    tagline: 'Freedom & Innovation',
    logoUrl: '/venture-logos/libelo.png',
    websiteUrl: 'https://libelo.com',
    description: 'Empowering digital freedom through innovation'
  },
  {
    id: 'objects-gallery',
    name: 'Objects Gallery',
    tagline: 'Curated Design Collection',
    logoUrl: '/venture-logos/objects_gallery.png',
    websiteUrl: 'https://objectsgallery.com',
    description: 'Discovering exceptional design objects'
  },
  {
    id: 'substans',
    name: 'Substans',
    tagline: 'Substance & Strategy',
    logoUrl: '/venture-logos/substans.png',
    websiteUrl: 'https://www.substans.art',
    description: 'Strategic consulting with substance'
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
    <section className="relative min-h-screen flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Section Title */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant tracking-tight text-white mb-2 sm:mb-4">
            Proof of Ousia
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto px-4">
            Ventures we've brought to life
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-3 md:p-2 bg-white/10 md:bg-transparent rounded-full md:rounded-none backdrop-blur-sm md:backdrop-blur-none"
            aria-label="Previous venture"
          >
            <svg width="20" height="20" className="md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-3 md:p-2 bg-white/10 md:bg-transparent rounded-full md:rounded-none backdrop-blur-sm md:backdrop-blur-none"
            aria-label="Next venture"
          >
            <svg width="20" height="20" className="md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Ventures Display */}
          <div className="flex items-center justify-between max-w-6xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-0">
            
            {/* Previous Venture - Left Side */}
            <motion.div
              key={`prev-${prevIndex}`}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => handleVentureClick(prevIndex)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 aspect-square bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-sm flex items-center justify-center group-hover:from-white/18 group-hover:to-white/12 transition-all duration-300 p-3 sm:p-4 md:p-5"
                style={{clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)'}}
              >
                <Image
                  src={prev.logoUrl}
                  alt={prev.name}
                  width={120}
                  height={120}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain filter invert opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
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
              {/* Current Venture Logo */}
              <div 
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 aspect-square mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-sm flex items-center justify-center group-hover:from-white/22 group-hover:to-white/15 transition-all duration-300 group-hover:scale-105 p-6 sm:p-8 md:p-10"
                style={{clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)'}}
              >
                <Image
                  src={current.logoUrl}
                  alt={current.name}
                  width={240}
                  height={240}
                  className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-contain filter invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
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
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-cormorant text-white tracking-tight">
                    {current.name}
                  </h3>
                  <p className="text-gray-400 text-lg sm:text-xl md:text-2xl font-light max-w-md mx-auto leading-relaxed px-2">
                    {current.tagline}
                  </p>
                  
                  {/* Visit Website Hint */}
                  <div className="text-sm sm:text-base text-white/40 group-hover:text-white/60 transition-colors duration-300 mt-4 sm:mt-6">
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
              <div 
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 aspect-square bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-sm flex items-center justify-center group-hover:from-white/18 group-hover:to-white/12 transition-all duration-300 p-3 sm:p-4 md:p-5"
                style={{clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)'}}
              >
                <Image
                  src={next.logoUrl}
                  alt={next.name}
                  width={120}
                  height={120}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain filter invert opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
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