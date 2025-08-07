'use client';
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Optimized Hero Section Component
 * 
 * Enhanced version of the original Hero that works optimally with the new scroll-lock system
 * while preserving all critical animations and performance characteristics.
 * 
 * Key optimizations:
 * - Uses transform3d for GPU acceleration
 * - Throttled scroll event handling
 * - Will-change property management
 * - Reduced paint operations
 * - Compatible with OptimizedScrollContainer
 */
export default function OptimizedHero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track scroll progress for this section with performance optimizations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
    layoutEffect: false,
  });

  // Performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('OptimizedHero mounted');

      const unsubscribe = scrollYProgress.on('change', value => {
        // Throttle logging to reduce console spam
        if (Math.round(value * 100) % 5 === 0) {
          console.log('Hero scroll progress:', value.toFixed(2));
        }
      });

      return () => unsubscribe();
    }
  }, [scrollYProgress]);

  // Background transformation: white → black
  // Exact timing preserved from original: completes in first 40% of scroll
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.4], // Critical timing preserved
    ['#ffffff', '#000000']
  );

  // Logo inversion: black logo → white logo
  // Synchronized with background transition
  const logoFilter = useTransform(
    scrollYProgress,
    [0, 0.4], // Same timing as background
    ['invert(0)', 'invert(1)']
  );

  // Additional performance optimization: scale slightly for better GPU handling
  const logoScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4],
    [1, 1.02, 1] // Subtle scale for smoother transitions
  );

  return (
    <motion.section
      ref={sectionRef}
      className='relative min-h-screen flex items-center justify-center'
      style={{ 
        background: bgColor,
        // Performance optimizations
        willChange: 'background-color',
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Logo container with enhanced performance */}
      <div className='relative'>
        <motion.div
          style={{
            filter: logoFilter,
            scale: logoScale,
            // Performance optimizations
            willChange: 'filter, transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className='select-none drop-shadow-xl'
        >
          <Image
            src='/ousia_logo.png'
            alt='Ovsia Logo'
            width={600}
            height={600}
            priority
            quality={100}
            placeholder='blur'
            blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwuIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
            // Additional performance optimizations for the image
            style={{
              willChange: 'auto', // Let motion handle will-change
              transform: 'translateZ(0)',
            }}
          />
        </motion.div>
      </div>

      {/* Performance hint for smooth scrolling transition */}
      <style jsx>{`
        section {
          /* Optimize for scroll performance */
          contain: layout style paint;
          transform: translateZ(0);
        }
      `}</style>
    </motion.section>
  );
}