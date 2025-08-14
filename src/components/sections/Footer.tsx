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

  // Initialize time on mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setBerlinTime(getBerlinTime());
    
    const interval = setInterval(() => {
      setBerlinTime(getBerlinTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMailClick = () => {
    window.location.href = 'mailto:contact@ovsia.com';
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
          className="absolute top-12 right-12"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://linkedin.com/company/ovsia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-300 block"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Connect with us on LinkedIn"
          >
            <svg 
              width="48" 
              height="48" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </motion.a>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-screen px-6 lg:px-12">
          
          {/* Stay in Ousia - Top, increased size, Cormorant font */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-6xl md:text-7xl lg:text-8xl font-cormorant tracking-wide leading-tight text-center relative"
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
                <span className="relative inline-block">O<span className="absolute top-1/2 left-1/2 w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></span></span>usia
              </span>
            </motion.h2>
          </motion.div>

          {/* Main Content - Mail Button and Berlin Time Side by Side */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left - MAIL Button (reduced size) */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={handleMailClick}
                className="text-[14rem] md:text-[16rem] lg:text-[18rem] font-cormorant tracking-tight text-gray-300 hover:text-white transition-colors duration-300 bg-transparent cursor-pointer leading-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Send us an email"
              >
                MAIL
              </motion.button>
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
                    className="text-6xl md:text-7xl lg:text-8xl font-cormorant tracking-tight leading-none"
                    aria-label={`Current time in Berlin: ${berlinTime}`}
                  >
                    Berlin:
                  </p>
                  <p
                    className="text-6xl md:text-7xl lg:text-8xl font-cormorant tracking-tight leading-none mt-2 tabular-nums"
                    style={{ minWidth: '400px' }}
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
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <p className="text-gray-500 text-base font-light mb-2">
              © {currentYear} Ovsia
            </p>
            <div className="flex space-x-6 text-sm">
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