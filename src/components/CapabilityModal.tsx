'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CapabilityModalProps } from '@/types/capability';

/**
 * CapabilityModal Component
 * 
 * Features:
 * - Smooth slide-in animation from bottom
 * - Backdrop blur and overlay
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 * - Accessibility features (focus management, ARIA labels)
 * - Responsive design
 * - Scroll lock when open
 * - Performance optimized
 * 
 * Usage:
 * <CapabilityModal 
 *   card={selectedCard} 
 *   isOpen={isModalOpen} 
 *   onClose={handleClose} 
 * />
 */
const CapabilityModal: React.FC<CapabilityModalProps> = ({ 
  card, 
  isOpen, 
  onClose 
}) => {
  // Safety check - don't render if card is null/undefined or missing modalContent
  if (!card || !card.modalContent) {
    return null;
  }
  
  // Manage scroll lock and keyboard events
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Add escape key listener
      document.addEventListener('keydown', handleEscape);
      
      // Focus management - focus the modal
      const modal = document.getElementById('capability-modal');
      if (modal) {
        modal.focus();
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Animation variants
  const backdropVariants = {
    hidden: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      backdropFilter: 'blur(8px)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  const modalVariants = {
    hidden: { 
      y: '100%',
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      y: '0%',
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.5
      }
    },
    exit: {
      y: '100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  };

  if (!card) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Modal Content */}
          <motion.div
            id="capability-modal"
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden focus:outline-none"
            variants={modalVariants}
            tabIndex={-1}
          >
            {/* Header */}
            <div className={`${card.color} px-6 py-8 sm:px-8`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl" role="img" aria-label={card.title}>
                    {card.icon}
                  </div>
                  <div>
                    <h2 
                      id="modal-title"
                      className="text-2xl sm:text-3xl font-bold text-gray-800 font-space"
                    >
                      {card.modalContent.title}
                    </h2>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200 group"
                  aria-label="Close modal"
                >
                  <svg 
                    className="w-6 h-6 text-gray-600 group-hover:text-gray-800" 
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
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto max-h-[60vh]">
              {/* Description */}
              <div className="mb-8">
                <p 
                  id="modal-description"
                  className="text-gray-700 text-lg leading-relaxed font-cormorant"
                >
                  {card.modalContent.description}
                </p>
              </div>

              {/* Features */}
              {card.modalContent.features && card.modalContent.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 font-space">
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {card.modalContent.features.map((feature, index) => (
                      <li 
                        key={index}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2" />
                        <span className="text-gray-600 font-cormorant">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {card.modalContent.examples && card.modalContent.examples.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 font-space">
                    Examples
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {card.modalContent.examples.map((example, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border"
                      >
                        <span className="text-gray-600 text-sm font-cormorant">
                          {example}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {card.modalContent.technologies && card.modalContent.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 font-space">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {card.modalContent.technologies.map((tech, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-space"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 bg-gray-50 border-t">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-space"
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-space"
                  onClick={() => {
                    // Optional: Add action for "Learn More" or "Contact Us"
                    // Track interest without console logging
                    onClose();
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MemoizedCapabilityModal = React.memo(CapabilityModal);
MemoizedCapabilityModal.displayName = 'CapabilityModal';

export default MemoizedCapabilityModal;