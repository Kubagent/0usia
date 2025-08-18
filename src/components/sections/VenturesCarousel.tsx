'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useImagePreloader } from '@/hooks/useImagePreloader';

interface Venture {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  websiteUrl: string;
  description?: string;
  inactive?: boolean;
  acquired?: boolean;
  popupContent?: {
    title: string;
    description: string;
    details: string[];
  };
}

// Actual venture data with real logos
const venturesData: Venture[] = [
  {
    id: 'violca',
    name: 'Violca',
    tagline: 'Visual Innovation Platform',
    logoUrl: '/venture-logos/violca.png',
    websiteUrl: 'https://violca.com',
    description: 'Transforming visual experiences through technology',
  },
  {
    id: 'wojcistics',
    name: 'Wojcistics',
    tagline: 'Logistics Optimization',
    logoUrl: '/venture-logos/wojcistics.png',
    websiteUrl: 'https://wojcistics.com',
    description: 'Revolutionary supply chain solutions',
    inactive: true,
    popupContent: {
      title: 'Wojcistics',
      description:
        'Advanced logistics optimization platform leveraging AI and machine learning to revolutionize supply chain management.',
      details: [
        'AI-powered route optimization',
        'Real-time supply chain visibility',
        'Predictive demand forecasting',
        'Automated inventory management',
      ],
    },
  },
  {
    id: 'fix',
    name: 'Fix',
    tagline: 'Problem Resolution Platform',
    logoUrl: '/venture-logos/fix.png',
    websiteUrl: 'https://fix-platform.com',
    description: 'Streamlining problem resolution processes',
    inactive: true,
    acquired: true,
    popupContent: {
      title: 'Fix',
      description:
        'Innovative problem resolution platform that streamlines issue tracking and resolution workflows across organizations.',
      details: [
        'Intelligent issue categorization',
        'Automated workflow routing',
        'Real-time collaboration tools',
        'Performance analytics dashboard',
      ],
    },
  },
  {
    id: 'libelo',
    name: 'Libelo',
    tagline: 'Freedom & Innovation',
    logoUrl: '/venture-logos/libelo.png',
    websiteUrl: 'https://libelo.com',
    description: 'Empowering digital freedom through innovation',
  },
  {
    id: 'objects-gallery',
    name: 'Objects Gallery',
    tagline: 'Curated Design Collection',
    logoUrl: '/venture-logos/objectsgallery.png',
    websiteUrl: 'https://objectsgallery.com',
    description: 'Discovering exceptional design objects',
    inactive: true,
    popupContent: {
      title: 'Objects Gallery',
      description:
        'Curated collection of exceptional design objects, connecting creators with discerning collectors and design enthusiasts.',
      details: [
        'Curated design collections',
        'Artist and maker profiles',
        'Exclusive limited editions',
        'Design story narratives',
      ],
    },
  },
  {
    id: 'substans',
    name: 'Substans',
    tagline: 'Substance & Strategy',
    logoUrl: '/venture-logos/substans.png',
    websiteUrl: 'https://www.substans.art',
    description: 'Strategic consulting with substance',
  },
];

export default function VenturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isHoveringCurrentVenture, setIsHoveringCurrentVenture] =
    useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  // Preload all venture logos for smooth rendering
  const ventureLogoUrls = venturesData.map(venture => venture.logoUrl);
  const {
    isLoading: isPreloading,
    progress,
    hasErrors,
    retryFailed,
  } = useImagePreloader(ventureLogoUrls);

  // Don't start auto-play until images are loaded
  const [imagesReady, setImagesReady] = useState(false);

  // Set images ready when preloading completes
  useEffect(() => {
    if (!isPreloading && !hasErrors) {
      setImagesReady(true);
    }
  }, [isPreloading, hasErrors]);

  // Auto-play with visual countdown - only start when images are ready
  useEffect(() => {
    if (!isAutoPlay || !imagesReady) return;

    const progressInterval = setInterval(() => {
      setAutoPlayProgress(prev => {
        const newProgress = prev + (100 / 400); // Update every 10ms for smooth animation (4000ms / 10ms = 400 steps)
        
        if (newProgress >= 100) {
          // When progress reaches 100%, advance to next venture and reset
          setCurrentIndex(prevIndex => (prevIndex + 1) % venturesData.length);
          return 0; // Reset progress
        }
        
        return newProgress;
      });
    }, 10); // Update every 10ms for smooth progress animation

    return () => clearInterval(progressInterval);
  }, [isAutoPlay, imagesReady, currentIndex]); // Include currentIndex to restart progress on manual navigation

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % venturesData.length);
    setAutoPlayProgress(0); // Reset progress on manual navigation
    setIsAutoPlay(false);
  };

  const handlePrev = () => {
    setCurrentIndex(
      prev => (prev - 1 + venturesData.length) % venturesData.length
    );
    setAutoPlayProgress(0); // Reset progress on manual navigation
    setIsAutoPlay(false);
  };

  const handleVentureClick = (index: number) => {
    if (index === currentIndex) {
      const venture = venturesData[index];
      if (venture.inactive && venture.popupContent) {
        // If clicking current venture and it's inactive, show popup
        setActivePopup(venture.id);
      } else {
        // If clicking current venture and it's active, navigate to website
        window.open(venture.websiteUrl, '_blank');
      }
    } else {
      // If clicking adjacent venture, make it current
      setCurrentIndex(index);
      setAutoPlayProgress(0); // Reset progress on manual navigation
      setIsAutoPlay(false);
    }
  };

  const getVisibleVentures = () => {
    const prevIndex =
      (currentIndex - 1 + venturesData.length) % venturesData.length;
    const nextIndex = (currentIndex + 1) % venturesData.length;

    return {
      prev: venturesData[prevIndex],
      current: venturesData[currentIndex],
      next: venturesData[nextIndex],
      prevIndex,
      nextIndex,
    };
  };

  const { prev, current, next, prevIndex, nextIndex } = getVisibleVentures();

  // Loading component
  const LoadingState = () => (
    <div className='flex flex-col items-center justify-center min-h-[400px] text-white'>
      <div className='relative w-24 h-24 mb-6'>
        <motion.div
          className='absolute inset-0 border-2 border-white/20 rounded-full'
          style={{
            clipPath:
              'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)',
          }}
        />
        <motion.div
          className='absolute inset-0 border-2 border-white/60 rounded-full'
          style={{
            clipPath:
              'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <motion.p
        className='text-lg font-light mb-2'
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading venture portfolios...
      </motion.p>
      <div className='flex items-center space-x-2 text-sm text-white/60'>
        <div className='w-32 h-1 bg-white/20 rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-white/60 rounded-full origin-left'
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span>{Math.round(progress)}%</span>
      </div>
      {hasErrors && (
        <motion.button
          onClick={retryFailed}
          className='mt-4 px-4 py-2 border border-white/30 text-white/70 hover:text-white hover:border-white/50 transition-colors rounded-lg'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retry failed images
        </motion.button>
      )}
    </div>
  );

  return (
    <section className='relative min-h-screen flex items-center justify-center py-20'>
      <div className='max-w-7xl mx-auto px-6 w-full'>
        {/* Section Title */}
        <motion.div
          className='text-center mb-8 sm:mb-12 md:mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant tracking-tight text-white mb-2 sm:mb-4'>
            Proof of{' '}
            <span className='relative inline-block'>
              <span className='relative inline-block'>
                O
                <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  {/* Auto-play Toggle - Positioned in center of O */}
                  <button
                    onClick={() => {
                      setIsAutoPlay(!isAutoPlay);
                      setAutoPlayProgress(0); // Reset progress when toggling
                    }}
                    className='group relative flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 transition-all duration-300'
                    aria-label={
                      isAutoPlay ? 'Pause auto-play' : 'Resume auto-play'
                    }
                  >
                    {isAutoPlay ? (
                      // Progress circle that fills up over 4 seconds
                      <div className="relative w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5">
                        {/* Background circle */}
                        <div className='absolute inset-0 border border-white/60 rounded-full group-hover:border-white/80 transition-colors duration-300' />
                        {/* Progress fill */}
                        <svg 
                          className="absolute inset-0 w-full h-full transform -rotate-90"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.6)"
                            strokeWidth="2"
                            strokeDasharray={`${2 * Math.PI * 8}`}
                            strokeDashoffset={`${2 * Math.PI * 8 * (1 - autoPlayProgress / 100)}`}
                            className="transition-all duration-75 ease-linear group-hover:stroke-white/80"
                          />
                        </svg>
                      </div>
                    ) : (
                      // Dot (filled circle when auto-play is PAUSED)
                      <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors duration-300' />
                    )}
                  </button>
                </span>
              </span>
              usia
            </span>
          </h2>
          <p className='text-lg sm:text-xl md:text-2xl text-white font-light max-w-2xl mx-auto px-4'>
            Ventures we have brought to life
          </p>
        </motion.div>

        {/* Loading State or Carousel Container */}
        {!imagesReady ? (
          <LoadingState />
        ) : (
          <motion.div
            className='relative max-w-5xl mx-auto'
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              staggerChildren: 0.1,
            }}
          >
            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className='absolute left-2 sm:left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-3 md:p-2 bg-white/10 md:bg-transparent rounded-full md:rounded-none backdrop-blur-sm md:backdrop-blur-none'
              aria-label='Previous venture'
            >
              <svg
                width='20'
                height='20'
                className='md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className='absolute right-2 sm:right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-3 md:p-2 bg-white/10 md:bg-transparent rounded-full md:rounded-none backdrop-blur-sm md:backdrop-blur-none'
              aria-label='Next venture'
            >
              <svg
                width='20'
                height='20'
                className='md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>

            {/* Ventures Display */}
            <div className='flex items-center justify-between max-w-6xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-0'>
              {/* Previous Venture - Left Side */}
              <motion.div
                key={`prev-${prevIndex}`}
                className='flex-shrink-0 cursor-pointer group'
                onClick={() => handleVentureClick(prevIndex)}
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.1,
                }}
              >
                <div
                  className='w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 aspect-square bg-white/90 flex items-center justify-center group-hover:bg-white/95 transition-all duration-300 p-3 sm:p-4 md:p-5 shadow-lg overflow-hidden'
                  style={{
                    clipPath:
                      'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)',
                    willChange: 'transform',
                  }}
                >
                  <Image
                    src={prev.logoUrl}
                    alt={prev.name}
                    width={120}
                    height={120}
                    priority
                    className={`object-contain opacity-60 group-hover:opacity-80 transition-opacity duration-300 ${
                      prev.id === 'objects-gallery'
                        ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30'
                        : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
                    }`}
                  />
                </div>
              </motion.div>

              {/* Current Venture - Center */}
              <motion.div
                key={`current-${currentIndex}`}
                className='flex-shrink-0 text-center cursor-pointer group mx-8'
                onClick={() => handleVentureClick(currentIndex)}
                onMouseEnter={() => setIsHoveringCurrentVenture(true)}
                onMouseLeave={() => setIsHoveringCurrentVenture(false)}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.2,
                }}
              >
                {/* Current Venture Logo - Container positioned to allow overflow for animation */}
                <div className='relative'>
                  {/* Logo Container with clipPath */}
                  <div
                    className='w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 aspect-square mx-auto mb-6 sm:mb-8 bg-white/85 flex items-center justify-center group-hover:bg-white/95 transition-all duration-300 p-6 sm:p-8 md:p-10 relative shadow-lg transform group-hover:scale-105 overflow-hidden'
                    style={{
                      clipPath:
                        'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)',
                      willChange: 'transform',
                    }}
                  >
                    <Image
                      src={current.logoUrl}
                      alt={current.name}
                      width={240}
                      height={240}
                      priority
                      className={`object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${
                        current.id === 'objects-gallery'
                          ? 'w-40 h-40 sm:w-44 sm:h-44 md:w-50 md:h-50 lg:w-56 lg:h-56 xl:w-60 xl:h-60'
                          : 'w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48'
                      }`}
                    />
                  </div>

                  {/* Acquired Animation - Positioned northwest outside the field for clear visibility */}
                  <motion.div
                    className='absolute -top-8 -right-8 z-50 pointer-events-none'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isHoveringCurrentVenture && current.acquired
                        ? {
                            opacity: [0, 1, 1, 0],
                            scale: [0.8, 1.1, 1, 0.9],
                            y: [10, 0, 0, -5],
                          }
                        : { opacity: 0, scale: 0.8 }
                    }
                    transition={{
                      duration: 2.5,
                      times: [0, 0.2, 0.8, 1],
                      ease: 'easeOut',
                    }}
                  >
                    <div className='relative'>
                      {/* Sparkles - Fixed to match footer exactly */}
                      {isHoveringCurrentVenture && current.acquired && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className='absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full'
                              style={{
                                left: `${-20 + i * 8}px`,
                                top: `${-10 + (i % 2) * 20}px`,
                              }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360],
                              }}
                              transition={{
                                duration: 1.5,
                                delay: i * 0.1,
                                repeat: 1,
                                ease: 'easeInOut',
                              }}
                            />
                          ))}
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={`sparkle-${i}`}
                              className='absolute'
                              style={{
                                left: `${-15 + i * 10}px`,
                                top: `${-5 + (i % 2) * 15}px`,
                              }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1.2,
                                delay: 0.3 + i * 0.15,
                                ease: 'easeInOut',
                              }}
                            >
                              <svg
                                width='8'
                                height='8'
                                viewBox='0 0 24 24'
                                fill='white'
                                className='sm:w-3 sm:h-3'
                              >
                                <path d='M12 0L14.09 8.26L22 6L14.09 15.74L12 24L9.91 15.74L2 18L9.91 8.26L12 0Z' />
                              </svg>
                            </motion.div>
                          ))}
                        </>
                      )}

                      {/* Acquired Text - Matching footer styling */}
                      <motion.p
                        className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-cormorant tracking-tight text-white whitespace-nowrap'
                        animate={
                          isHoveringCurrentVenture && current.acquired
                            ? {
                                opacity: [0.7, 1, 0.8, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          ease: 'easeInOut',
                        }}
                      >
                        acquired
                      </motion.p>
                    </div>
                  </motion.div>
                </div>

                {/* Venture Info */}
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className='space-y-4'
                  >
                    <h3 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-cormorant text-white tracking-tight'>
                      {current.name}
                    </h3>
                    <p className='text-gray-400 text-lg sm:text-xl md:text-2xl font-light max-w-md mx-auto leading-relaxed px-2'>
                      {current.tagline}
                    </p>

                    {/* Visit Website Hint */}
                    <div className='text-sm sm:text-base text-white/40 group-hover:text-white/60 transition-colors duration-300 mt-4 sm:mt-6'>
                      {current.inactive
                        ? 'Click to learn more'
                        : 'Click to visit website'}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Next Venture - Right Side */}
              <motion.div
                key={`next-${nextIndex}`}
                className='flex-shrink-0 cursor-pointer group'
                onClick={() => handleVentureClick(nextIndex)}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.3,
                }}
              >
                <div
                  className='w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 aspect-square bg-white/90 flex items-center justify-center group-hover:bg-white/95 transition-all duration-300 p-3 sm:p-4 md:p-5 shadow-lg overflow-hidden'
                  style={{
                    clipPath:
                      'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)',
                    willChange: 'transform',
                  }}
                >
                  <Image
                    src={next.logoUrl}
                    alt={next.name}
                    width={120}
                    height={120}
                    priority
                    className={`object-contain opacity-60 group-hover:opacity-80 transition-opacity duration-300 ${
                      next.id === 'objects-gallery'
                        ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30'
                        : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
                    }`}
                  />
                </div>
              </motion.div>
            </div>

            {/* Progress Indicators */}
            <motion.div
              className='flex justify-center space-x-2 mt-8'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: 0.5,
              }}
            >
              {venturesData.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to venture ${index + 1}`}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Venture Popup Modal */}
        <AnimatePresence>
          {activePopup &&
            (() => {
              const venture = venturesData.find(v => v.id === activePopup);
              if (!venture?.popupContent) return null;

              return (
                <motion.div
                  className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActivePopup(null)}
                >
                  <motion.div
                    className='
                    bg-white/95
                    backdrop-blur-md
                    rounded-lg
                    max-w-2xl
                    w-full
                    max-h-[80vh]
                    overflow-y-auto
                    flex flex-col items-center justify-center text-center
                    p-6 sm:p-8
                    border border-gray-300/50
                    shadow-2xl shadow-black/20
                    ring-1 ring-gray-200/20
                    relative
                  '
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setActivePopup(null)}
                      className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors duration-200'
                      aria-label='Close popup'
                    >
                      <svg
                        width='16'
                        height='16'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>

                    {/* Venture Logo */}
                    <div className='mb-6'>
                      <Image
                        src={venture.logoUrl}
                        alt={venture.name}
                        width={120}
                        height={120}
                        priority
                        className={`object-contain mx-auto ${
                          venture.id === 'objects-gallery'
                            ? 'w-24 h-24 sm:w-30 sm:h-30'
                            : 'w-20 h-20 sm:w-24 sm:h-24'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <motion.h3
                      className='text-3xl sm:text-4xl md:text-5xl font-cormorant text-black mb-4 tracking-tight'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {venture.popupContent.title}
                    </motion.h3>

                    <motion.p
                      className='text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {venture.popupContent.description}
                    </motion.p>

                    <motion.div
                      className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-gray-600'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {venture.popupContent.details.map((detail, idx) => (
                        <motion.div
                          key={idx}
                          className='flex items-center'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.25 + idx * 0.05 }}
                        >
                          <span className='w-2 h-2 bg-black/60 rounded-full mr-3 flex-shrink-0'></span>
                          <span className='text-left'>{detail}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </div>
    </section>
  );
}
