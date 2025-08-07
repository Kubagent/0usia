'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Use framer-motion scroll progress
  const { scrollYProgress } = useScroll();

  // Client-side mount guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manual scroll tracking as fallback
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollTop / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Framer Motion transforms with precise timing
  const motionBackgroundColor = useTransform(
    scrollYProgress,
    [0, 0.4], // Background transition from 0-40% scroll
    ['#ffffff', '#000000']
  );

  const motionLogoFilter = useTransform(
    scrollYProgress,
    [0.1, 0.5], // Logo inversion from 10-50% scroll
    ['invert(0)', 'invert(1)']
  );

  // CSS fallback calculations with precise timing
  const fallbackBgProgress = Math.min(scrollProgress * 2.5, 1); // Background over first 40%
  const fallbackBgColor = scrollProgress < 0.4 ? 
    `rgb(${Math.floor(255 * (1 - fallbackBgProgress))}, ${Math.floor(255 * (1 - fallbackBgProgress))}, ${Math.floor(255 * (1 - fallbackBgProgress))})` : 
    '#000000';
  
  const logoProgress = Math.max(0, Math.min((scrollProgress - 0.1) / 0.4, 1)); // Logo from 10% to 50%
  const fallbackLogoFilter = `invert(${logoProgress})`;

  if (!mounted) {
    // SSR fallback
    return (
      <section className="relative h-screen flex items-center justify-center bg-white">
        <div className="relative z-10">
          <Image
            src="/ousia_logo.png"
            alt="Ovsia Logo"
            width={600}
            height={600}
            priority
            className="max-w-full h-auto"
          />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Framer Motion version with CSS fallback */}
      <motion.section
        className="relative h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: motionBackgroundColor,
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {/* CSS Fallback layer for browsers that don't support framer-motion */}
        <div 
          className="absolute inset-0 transition-colors duration-500 ease-out"
          style={{ 
            backgroundColor: fallbackBgColor,
            zIndex: 1
          }}
        />
        
        <div className="relative z-10 flex items-center justify-center">
          {/* Framer Motion logo with CSS fallback */}
          <motion.div
            style={{ 
              filter: motionLogoFilter,
              WebkitFilter: motionLogoFilter
            }}
            className="select-none transform-gpu transition-all duration-500 ease-out"
          >
            <Image
              src="/ousia_logo.png"
              alt="Ovsia Logo"
              width={600}
              height={600}
              priority
              className="max-w-full h-auto"
              style={{
                // CSS fallback for older browsers or framer-motion issues
                filter: fallbackLogoFilter,
                WebkitFilter: fallbackLogoFilter,
                transition: 'filter 0.5s ease-out, -webkit-filter 0.5s ease-out'
              }}
            />
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}