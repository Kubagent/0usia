'use client';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Venture {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  websiteUrl: string;
  description?: string;
  inactive?: boolean;
  acquired?: boolean;
  status?: 'sold' | 'discontinued' | 'active' | 'profit';
  popupContent?: {
    title: string;
    description: string;
    details: string[];
  };
}

// Actual venture data with real logos
const venturesData: Venture[] = [
  {
    id: 'substans',
    name: 'Substans',
    tagline: 'Art Institution',
    logoUrl: '/venture-logos/substans.png',
    websiteUrl: 'https://www.substans.art',
    description: 'Institution of art for the furtherment of what really matters – the substance',
    status: 'active',
    popupContent: {
      title: 'Substans',
      description:
        'Institution of art for the furtherment of what really matters – the substance, advancing substantial artistic expression through cultural initiatives.',
      details: [
        'Industry: Arts & Culture / Performance',
        'Business Model: Cultural Institution (B2C/Non-profit)',
        'USP: Advancing substantial artistic expression',
        'Focus: Dissemination and distribution of art',
      ],
    },
  },
  {
    id: 'violca',
    name: 'Violca',
    tagline: 'Cycling Gear & Adventures',
    logoUrl: '/venture-logos/violca.png',
    websiteUrl: 'https://violca.com',
    description: 'Ecommerce in cycling gear, to prepare you for cycling adventures to get to know oneself',
    status: 'active',
    popupContent: {
      title: 'Violca',
      description:
        'Ecommerce platform specializing in cycling gear, preparing customers for cycling adventures that lead to self-discovery.',
      details: [
        'Industry: Community & E-commerce for cycling ',
        'Business Model: Direct-to-Consumer (B2C)',
        'USP: Self-discovery through cycling adventures',
        'Focus: Premium cycling gear and experiences',
      ],
    },
  },
  {
    id: 'wojcistics',
    name: 'Wojcistics',
    tagline: 'Logistics Tech Distribution',
    logoUrl: '/venture-logos/wojcistics.png',
    websiteUrl: 'https://wojcistics.com',
    description: 'Land transport innovative machine/vehicle distribution company',
    inactive: true,
    status: 'discontinued',
    popupContent: {
      title: 'Wojcistics',
      description:
        'Innovative distribution platform specializing in land transport vehicles and machinery, connecting manufacturers with dealers.',
      details: [
        'Industry: Land transport / Logistics',
        'Business Model: Distribution(B2B)',
        'USP: Innovative vehicle distribution platform',
        'Focus: Land transport machinery distribution',
      ],
    },
  },
  {
    id: 'fix',
    name: 'Fix',
    tagline: 'Maintenance Services Marketplace',
    logoUrl: '/venture-logos/fix.png',
    websiteUrl: 'https://fix-platform.com',
    description: 'Connecting facility management professionals with customers as smoothly as Uber gets you rides',
    inactive: true,
    acquired: true,
    status: 'sold',
    popupContent: {
      title: 'Fix',
      description:
        'Connecting facility management professionals with customers as smoothly as Uber gets you rides.',
      details: [
        'Industry: Facility Management / Maintenance',
        'Business Model: Marketplace (B2B)',
        'USP: Seamless service connection',
        'Focus: Facility management services',
      ],
    },
  },
  {
    id: 'libelo',
    name: 'Libelo',
    tagline: 'Nature Exploration App',
    logoUrl: '/venture-logos/libelo.png',
    websiteUrl: 'https://libelo.app',
    description: 'Empowering you on adventures into the wild',
    status: 'profit',
    popupContent: {
      title: 'Libelo',
      description:
        'Empowering you on adventures into the wild',
      details: [
        'Industry: Nature Exploration /Adventure travel',
        'Business Model: Direct-to-Consumer (B2C)',
        'USP: Seamless service connection',
        'Focus: Adventure travel',
      ],
    },
  },
  {
    id: 'objects-gallery',
    name: 'Objects Gallery',
    tagline: 'Curated Design Collection',
    logoUrl: '/venture-logos/objectsgallery.png',
    websiteUrl: 'https://objectsgallery.com',
    description: 'Discovering exceptional design objects',
    inactive: true,
    status: 'active',
    popupContent: {
      title: 'Objects Gallery',
      description:
        'Curated collection of exceptional design objects, connecting creators with discerning collectors and design enthusiasts.',
      details: [
        'Industry: Curated design collections',
        'Business Model: Marketplace (B2C)',
        'USP: Exclusive limited editions',
        'Focus: Design story narratives',
      ],
    },
  },
];

// Status Tag Component
interface StatusTagProps {
  status: 'sold' | 'discontinued' | 'active' | 'profit';
  className?: string;
}

function StatusTag({ status, className = '' }: StatusTagProps) {
  const getTagConfig = (status: string) => {
    switch (status) {
      case 'sold':
        return { letter: 'S', color: 'bg-yellow-500', textColor: 'text-yellow-900', label: 'Sold' };
      case 'discontinued':
        return { letter: 'D', color: 'bg-red-500', textColor: 'text-red-900', label: 'Discontinued' };
      case 'active':
        return { letter: 'A', color: 'bg-blue-500', textColor: 'text-blue-900', label: 'Active' };
      case 'profit':
        return { letter: 'P', color: 'bg-green-500', textColor: 'text-green-900', label: 'Profit' };
      default:
        return { letter: '?', color: 'bg-gray-500', textColor: 'text-gray-900', label: 'Unknown' };
    }
  };

  const config = getTagConfig(status);

  return (
    <div className={`group relative inline-block ${className}`}>
      <motion.div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center
          ${config.color} ${config.textColor}
          text-xs font-bold cursor-pointer
          shadow-lg border-2 border-white/20
        `}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {config.letter}
      </motion.div>
      
      {/* Tooltip */}
      <div className="
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        px-2 py-1 bg-black/90 text-white text-xs rounded-md
        opacity-0 group-hover:opacity-100 pointer-events-none
        whitespace-nowrap z-50 transition-all duration-200
        group-hover:translate-y-0 translate-y-1
      ">
        {config.label}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-black/90"></div>
        </div>
      </div>
    </div>
  );
}

export default function VenturesCarousel() {
  // Start with Substans (now at index 0)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Auto-play is now always enabled - removed toggle functionality
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isHoveringCurrentVenture, setIsHoveringCurrentVenture] =
    useState(false);
  // Removed autoPlayProgress state as it's no longer needed without the button

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
    if (!isPreloading) {
      setImagesReady(true);
    }
  }, [isPreloading]);

  // Fallback timeout to ensure carousel shows even if preloading gets stuck
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!imagesReady) {
        console.warn('Image preloading timeout - showing carousel anyway');
        setImagesReady(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(fallbackTimer);
  }, [imagesReady]);

  // Auto-play timer management using useRef to avoid stale closures
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to start/restart the auto-play timer
  const startAutoPlayTimer = useCallback(() => {
    // Clear existing timer if any
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    // Start new timer
    autoPlayTimerRef.current = setTimeout(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % venturesData.length);
    }, 6000); // 6 seconds
  }, []);

  // Auto-play carousel - advance every 5 seconds when images are ready
  useEffect(() => {
    if (!imagesReady) return;

    // Start the initial timer
    startAutoPlayTimer();

    // Cleanup on unmount
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [imagesReady, startAutoPlayTimer]);

  // Restart timer when currentIndex changes (including from user interactions)
  // Add a small delay to prevent conflicts with rapid user clicks
  useEffect(() => {
    if (!imagesReady) return;
    
    // Use a small delay to prevent interference with rapid clicks
    const delayedRestart = setTimeout(() => {
      startAutoPlayTimer();
    }, 100);
    
    return () => clearTimeout(delayedRestart);
  }, [currentIndex, imagesReady, startAutoPlayTimer]);

  const handleNext = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev + 1) % venturesData.length);
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(
      prev => (prev - 1 + venturesData.length) % venturesData.length
    );
  }, []);

  const handleVentureClick = (index: number) => {
    if (index === currentIndex) {
      const venture = venturesData[index];
      if (venture.inactive && venture.popupContent) {
        // If clicking current venture and it's inactive, show popup
        setActivePopup(venture.id);
      } else {
        // If clicking current venture and it's active, navigate to website
        const link = document.createElement('a');
        link.href = venture.websiteUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }
    } else {
      // If clicking adjacent venture, make it current
      setCurrentIndex(index);
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
      {/* Fixed navigation button styles */}
      <style jsx>{`
        .fixed-nav-button {
          will-change: auto;
        }
        .fixed-nav-button:active {
          transform: translateY(-50%) !important;
        }
        .fixed-nav-button:focus {
          outline: 2px solid rgba(255, 255, 255, 0.3);
          outline-offset: 2px;
        }
        @media (hover: hover) {
          .fixed-nav-button:hover {
            transform: translateY(-50%) scale(1.05);
          }
        }
      `}</style>
      <div className='max-w-7xl mx-auto px-6 w-full'>
        {/* Section Title */}
        <motion.div
          className='text-center mb-8 sm:mb-12 md:mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className='text-ovsia-header-lg sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-3xl font-cormorant tracking-tight text-white mb-2 sm:mb-4'>
            Proof of{' '}
            <span className='relative inline-block'>
              <span className='relative inline-block'>
                O
                <span className='absolute top-1/2 left-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2'></span>
              </span>
              usia
            </span>
          </h2>
          <p className='text-ovsia-body-lg sm:text-ovsia-body-xl md:text-ovsia-body-2xl text-white font-light max-w-2xl mx-auto px-4'>
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
            {/* Navigation Arrows - Fixed positioning and touch handling */}
            <button
              onClick={handlePrev}
              onTouchEnd={handlePrev}
              className='fixed-nav-button left-2 sm:left-4 md:-left-12 top-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-3 md:p-2 bg-white/10 md:bg-transparent rounded-full md:rounded-none touch-manipulation'
              style={{
                position: 'absolute',
                transform: 'translateY(-50%)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              aria-label='Previous venture'
            >
              <svg
                width='20'
                height='20'
                className='md:w-6 md:h-6 pointer-events-none'
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
              onTouchEnd={handleNext}
              className='fixed-nav-button right-2 sm:right-4 md:-right-12 top-1/2 z-10 text-white/60 hover:text-white transition-colors duration-200 p-3 md:p-2 bg-white/10 md:bg-transparent rounded-full md:rounded-none touch-manipulation'
              style={{
                position: 'absolute',
                transform: 'translateY(-50%)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              aria-label='Next venture'
            >
              <svg
                width='20'
                height='20'
                className='md:w-6 md:h-6 pointer-events-none'
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
            <div className='flex items-center justify-center sm:justify-between max-w-6xl mx-auto py-8 sm:py-10 md:py-12 px-2 sm:px-4 md:px-0'>
              {/* Previous Venture - Left Side */}
              <motion.div
                key={`prev-${prevIndex}`}
                className='hidden sm:flex flex-shrink-0 cursor-pointer group'
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
                className='flex-shrink-0 text-center cursor-pointer group mx-2 sm:mx-8 max-w-full'
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
                    className='w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 aspect-square mx-auto mb-6 sm:mb-8 bg-white/85 flex items-center justify-center group-hover:bg-white/95 transition-all duration-300 p-4 sm:p-6 md:p-8 lg:p-10 relative shadow-lg transform group-hover:scale-105 overflow-hidden'
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
                          ? 'w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52'
                          : 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40'
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
                <AnimatePresence>
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className='space-y-4 w-full max-w-xs sm:max-w-md'
                  >
                    <h3 className='text-ovsia-header-lg sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-3xl font-cormorant text-white tracking-tight break-words px-2 sm:px-0'>
                      {current.name}
                    </h3>
                    <p className='text-gray-400 text-ovsia-body-base sm:text-ovsia-body-lg md:text-ovsia-body-xl font-light leading-relaxed px-4 sm:px-2 break-words'>
                      {current.tagline}
                    </p>

                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Next Venture - Right Side */}
              <motion.div
                key={`next-${nextIndex}`}
                className='hidden sm:flex flex-shrink-0 cursor-pointer group'
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 touch-manipulation ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
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
                      className='text-3xl sm:text-4xl md:text-5xl font-cormorant text-black mb-2 tracking-tight'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {venture.popupContent.title}
                    </motion.h3>

                    {/* Status Tag */}
                    {venture.status && (
                      <motion.div
                        className='flex justify-center mb-4'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.12 }}
                      >
                        <StatusTag status={venture.status} />
                      </motion.div>
                    )}

                    <motion.p
                      className='text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {venture.popupContent.description}
                    </motion.p>

                    {/* Further Details Section */}
                    <motion.div
                      className='w-full'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.18 }}
                    >
                      <h4 className='text-xl sm:text-2xl font-cormorant text-black mb-4 text-center tracking-tight'>
                        Further Details
                      </h4>
                      
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
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </div>
    </section>
  );
}
