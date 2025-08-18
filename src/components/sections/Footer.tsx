'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Hyper Minimalist Full Screen Footer
 * 
 * Features:
 * - Full screen black background
 * - Centered minimalist content
 * - Beautiful MAIL button with header font
 * - Berlin time display
 * - LinkedIn only
 * - Sexy typography
 * 
 * Usage:
 * <Footer />
 */

interface FooterProps {
  className?: string;
}

// Utility function to get Berlin time
const getBerlinTime = (): string => {
  try {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Berlin'
    });
  } catch (error) {
    // Fallback to simple time format if Berlin timezone fails
    const now = new Date();
    return now.toTimeString().slice(0, 8);
  }
};

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [currentYear] = useState(new Date().getFullYear());
  const [berlinTime, setBerlinTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Initialize time on mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setBerlinTime(getBerlinTime());
    
    const interval = setInterval(() => {
      setBerlinTime(getBerlinTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMailClick = async () => {
    try {
      await navigator.clipboard.writeText('contact@0usia.com');
      // Show magical animation
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2500);
      console.log('Email copied to clipboard: contact@0usia.com');
    } catch (error) {
      // Fallback to mailto if clipboard API fails
      window.location.href = 'mailto:contact@0usia.com';
    }
  };

  return (
    <motion.footer
      className={`min-h-screen w-full text-white relative px-6 ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Split Universe Layout */}
      <div className="min-h-screen flex flex-col">
        
        {/* Top Section - LinkedIn Icon */}
        <motion.div
          className="absolute top-6 right-6 sm:top-8 sm:right-8 md:top-12 md:right-12"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://www.linkedin.com/company/0usia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-300 block"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Connect with us on LinkedIn"
          >
            <svg 
              width="32" 
              height="32" 
              className="sm:w-10 sm:h-10 md:w-12 md:h-12"
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </motion.a>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-12">
          
          {/* Stay in Ousia - Top, increased size, Cormorant font */}
          <motion.div
            className="mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-cormorant tracking-wide leading-tight text-center relative"
              animate={{ 
                opacity: [1, 0.7, 1] 
              }}
              transition={{ 
                duration: 4, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
            >
              Stay in <span className="relative inline-block">
                <span className="relative inline-block">O<span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></span></span>usia
              </span>
            </motion.h2>
          </motion.div>

          {/* Main Content - Mail Button and Berlin Time Side by Side */}
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 md:gap-16 lg:gap-24">
            
            {/* Left - MAIL Button (reduced size) */}
            <motion.div
              className="flex flex-col items-center relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={handleMailClick}
                className="text-5xl sm:text-7xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[16rem] 3xl:text-[18rem] font-cormorant tracking-tight text-gray-300 hover:text-white transition-colors duration-300 bg-transparent cursor-pointer leading-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Send us an email"
              >
                MAIL
              </motion.button>
              
              {/* Magical Copy Message */}
              <motion.div
                className="absolute top-full mt-4 sm:mt-6 md:mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={showCopyMessage ? {
                  opacity: [0, 1, 1, 0],
                  scale: [0.8, 1.1, 1, 0.9],
                  y: [10, 0, 0, -5]
                } : { opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 2.5,
                  times: [0, 0.2, 0.8, 1],
                  ease: "easeOut"
                }}
              >
                <div className="relative">
                  {/* Sparkles */}
                  {showCopyMessage && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"
                          style={{
                            left: `${-20 + i * 8}px`,
                            top: `${-10 + (i % 2) * 20}px`
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                            repeat: 1,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={`sparkle-${i}`}
                          className="absolute"
                          style={{
                            left: `${-15 + i * 10}px`,
                            top: `${-5 + (i % 2) * 15}px`
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1.2,
                            delay: 0.3 + i * 0.15,
                            ease: "easeInOut"
                          }}
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white" className="sm:w-3 sm:h-3">
                            <path d="M12 0L14.09 8.26L22 6L14.09 15.74L12 24L9.91 15.74L2 18L9.91 8.26L12 0Z"/>
                          </svg>
                        </motion.div>
                      ))}
                    </>
                  )}
                  
                  {/* Copy Message */}
                  <motion.p 
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-cormorant tracking-tight text-white whitespace-nowrap"
                    animate={showCopyMessage ? {
                      opacity: [0.7, 1, 0.8, 1],
                    } : {}}
                    transition={{
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    address copied
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Berlin Time (reduced size, no flickering) */}
            {mounted && (
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center lg:text-left">
                  <p
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-cormorant tracking-tight leading-none"
                    aria-label={`Current time in Berlin: ${berlinTime}`}
                  >
                    Berlin:
                  </p>
                  <p
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-cormorant tracking-tight leading-none mt-1 sm:mt-2 tabular-nums"
                    style={{ minWidth: 'auto' }}
                  >
                    {berlinTime}
                  </p>
                </div>
              </motion.div>
            )}

          </div>

        </div>

        {/* Legal Footer - Bottom Edge */}
        <motion.div
          className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <p className="text-gray-500 text-sm sm:text-base font-light mb-2">
              © {currentYear} Ovsia
            </p>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <motion.a
                href="/privacy"
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
                whileHover={{ y: -1 }}
              >
                Privacy
              </motion.a>
              <motion.a
                href="/terms"
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
                whileHover={{ y: -1 }}
              >
                Terms
              </motion.a>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.footer>
  );
};

export default Footer;