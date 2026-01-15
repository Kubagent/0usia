'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  // Handle modal actions
  const openModal = (type: 'privacy' | 'terms') => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

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
      className={`min-h-screen w-full text-black relative px-6 ${className}`}
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
            className="text-gray-600 hover:text-black transition-colors duration-300 block"
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
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem] 3xl:text-[12rem] font-cormorant tracking-wide leading-tight text-center relative"
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
                <span className="relative inline-block">O<span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2"></span></span>usia
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
                className="text-ovsia-tagline-sm sm:text-ovsia-tagline-base md:text-ovsia-tagline-lg font-cormorant tracking-tight text-gray-700 hover:text-black transition-colors duration-300 bg-transparent cursor-pointer leading-none flex items-center justify-center h-20 sm:h-24 md:h-28"
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
                          className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"
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
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="black" className="sm:w-3 sm:h-3">
                            <path d="M12 0L14.09 8.26L22 6L14.09 15.74L12 24L9.91 15.74L2 18L9.91 8.26L12 0Z"/>
                          </svg>
                        </motion.div>
                      ))}
                    </>
                  )}
                  
                  {/* Copy Message */}
                  <motion.p
                    className="text-ovsia-body-lg sm:text-ovsia-body-xl md:text-ovsia-body-2xl font-cormorant tracking-tight text-black whitespace-nowrap"
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
                    className="text-ovsia-header-xl sm:text-ovsia-header-2xl md:text-ovsia-header-3xl font-cormorant tracking-tight leading-none uppercase"
                    aria-label={`Current time in Berlin: ${berlinTime}`}
                  >
                    BERLIN:
                  </p>
                  <p
                    className="text-ovsia-header-xl sm:text-ovsia-header-2xl md:text-ovsia-header-3xl font-cormorant tracking-tight leading-none mt-0.5 sm:mt-1 tabular-nums"
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
            <p className="text-gray-500 text-ovsia-body-xs sm:text-ovsia-body-sm font-light mb-2">
              © {currentYear} 0usia
            </p>
            <div className="flex space-x-4 sm:space-x-6 text-ovsia-body-xs">
              <motion.button
                onClick={() => openModal('privacy')}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300 cursor-pointer"
                whileHover={{ y: -1 }}
              >
                Privacy
              </motion.button>
              <motion.button
                onClick={() => openModal('terms')}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300 cursor-pointer"
                whileHover={{ y: -1 }}
              >
                Terms
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Privacy & Terms Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              className="
                relative
                bg-white
                rounded-2xl
                w-full max-w-md
                p-6
                border border-gray-200
                shadow-2xl
                mx-4
                max-h-[80vh]
                overflow-y-auto
              "
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Modal Content */}
              {activeModal === 'privacy' && (
                <>
                  <motion.h3 
                    className="text-ovsia-body-xl font-cormorant text-black mb-4 tracking-tight pr-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Privacy Policy
                  </motion.h3>
                  
                  <motion.div 
                    className="text-ovsia-body-xs text-gray-700 leading-relaxed space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p>
                      <strong>Data Collection:</strong> We collect minimal information necessary for business operations, including contact details when you reach out to us.
                    </p>
                    <p>
                      <strong>Data Use:</strong> Information is used solely to respond to inquiries and provide our services. We do not sell or share personal data with third parties.
                    </p>
                    <p>
                      <strong>Data Storage:</strong> Data is stored securely in the UK and EU, complying with GDPR requirements.
                    </p>
                    <p>
                      <strong>Your Rights:</strong> You may request access, correction, or deletion of your personal data at any time by contacting us.
                    </p>
                    <p>
                      <strong>Contact:</strong> For privacy inquiries, email contact@0usia.com
                    </p>
                    <p className="text-ovsia-body-xs text-gray-500 mt-4">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                  </motion.div>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <motion.h3 
                    className="text-ovsia-body-xl font-cormorant text-black mb-4 tracking-tight pr-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Terms of Service
                  </motion.h3>
                  
                  <motion.div 
                    className="text-ovsia-body-xs text-gray-700 leading-relaxed space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p>
                      <strong>Service Provision:</strong> 0usia provides venture studio and consulting services as described on this website.
                    </p>
                    <p>
                      <strong>Intellectual Property:</strong> All content on this website is owned by 0usia or used with permission. Unauthorized use is prohibited.
                    </p>
                    <p>
                      <strong>Limitation of Liability:</strong> Services are provided "as is." 0usia is not liable for indirect or consequential damages.
                    </p>
                    <p>
                      <strong>Governing Law:</strong> These terms are governed by UK law. Disputes will be resolved in UK courts.
                    </p>
                    <p>
                      <strong>Contact:</strong> For terms inquiries, email contact@0usia.com
                    </p>
                    <p className="text-ovsia-body-xs text-gray-500 mt-4">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.footer>
  );
};

export default Footer;