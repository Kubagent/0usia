'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

/**
 * ExpertiseShowcase - Interactive Hover Animation Component
 * 
 * Features seamless hover overlay animations with detailed information
 */

interface ExpertiseCard {
  id: string;
  title: string;
  overlayTitle: string;
  description: string;
  details: string[];
}

const expertiseData: ExpertiseCard[] = [
  {
    id: 'strategic-vision',
    title: 'Strategic\nVision',
    overlayTitle: 'Strategic Vision',
    description: 'We see patterns others miss and craft the narratives that define them. Strategic visioning, brand identity, organizational values, and the foundational belief systems that drive long-term success.',
    details: [
      'Market pattern recognition',
      'Brand identity & narrative development', 
      'Organizational values framework',
      'Long-term strategic planning'
    ]
  },
  {
    id: 'ai-operations',
    title: 'AI\nOperations',
    overlayTitle: 'AI Operations',
    description: 'Advanced AI integration. Machine learning systems, automation workflows, intelligent decision support.',
    details: [
      'Machine learning implementation',
      'Automation workflow design',
      'Intelligent decision systems',
      'AI-human collaboration frameworks'
    ]
  },
  {
    id: 'capital-optimization',
    title: 'Capital\nOptimization',
    overlayTitle: 'Capital Optimization',
    description: 'Smart capital deployment. Investment strategies, resource allocation, financial engineering.',
    details: [
      'Investment strategy development',
      'Resource allocation optimization',
      'Financial engineering solutions',
      'ROI maximization frameworks'
    ]
  },
  {
    id: 'technology-leadership',
    title: 'Technology\nLeadership',
    overlayTitle: 'Technology Leadership',
    description: 'Cutting-edge technical implementation. Architecture design, scalable systems, innovation execution.',
    details: [
      'System architecture design',
      'Scalable infrastructure',
      'Innovation execution',
      'Technical team leadership'
    ]
  },
  {
    id: 'partnership-dynamics',
    title: 'Partnership\nDynamics',
    overlayTitle: 'Partnership Dynamics',
    description: 'Strategic relationship building. Ecosystem development, collaborative frameworks, mutual growth.',
    details: [
      'Ecosystem development',
      'Strategic alliances',
      'Collaborative frameworks',
      'Mutual value creation'
    ]
  },
  {
    id: 'market-intelligence',
    title: 'Market\nIntelligence',
    overlayTitle: 'Market Intelligence',
    description: 'Deep market understanding. Trend analysis, opportunity identification, competitive intelligence.',
    details: [
      'Market trend analysis',
      'Opportunity identification',
      'Competitive intelligence',
      'Strategic positioning'
    ]
  }
];

export default function ExpertiseShowcase() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const { isMobile, canHover } = useMobileDetection();

  // Auto-hide overlay on mobile after 3 seconds (only for hover, not click)
  useEffect(() => {
    if (isMobile && hoveredCard && !clickedCard) {
      const timer = setTimeout(() => {
        setHoveredCard(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, hoveredCard, clickedCard]);

  // Handle card click with position tracking
  const handleCardClick = (cardId: string, event: React.MouseEvent) => {
    if (isMobile) {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      setModalPosition({ x, y });
      setClickedCard(cardId);
      setHoveredCard(null); // Clear hover state when clicking
    }
  };

  // Handle click outside to close modal
  const handleBackdropClick = () => {
    setClickedCard(null);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title - Minimal */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-ovsia-header-lg sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-3xl font-cormorant tracking-tight text-white mb-2 sm:mb-4">
            Expertise
          </h2>
          <p className="text-ovsia-body-lg sm:text-ovsia-body-xl md:text-ovsia-body-2xl text-white font-light max-w-2xl mx-auto px-4">
            How we support your flourishing
          </p>
        </div>

        {/* Cards Grid - With Rectangle Overlay */}
        <div className="relative">
          {/* Background Grid - All Cards - 2x3 on mobile, responsive on larger screens */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto"
            animate={{ 
              opacity: (hoveredCard || clickedCard) ? 0.2 : 1,
              scale: (hoveredCard || clickedCard) ? 0.95 : 1 
            }}
            transition={{ duration: 0.4 }}
          >
            {expertiseData.map((card, index) => (
              <motion.div
                key={card.id}
                className="aspect-square relative cursor-pointer"
                onHoverStart={() => canHover && !clickedCard && setHoveredCard(card.id)}
                onHoverEnd={() => canHover && !clickedCard && setHoveredCard(null)}
                onClick={(e) => handleCardClick(card.id, e)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="
                    w-full h-full 
                    bg-gradient-to-br from-gray-50/80 to-gray-100/60
                    border border-gray-200/80
                    flex items-center justify-center text-center p-8
                    backdrop-blur-sm
                  "
                  style={{clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'}}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-ovsia-body-lg sm:text-ovsia-body-xl md:text-ovsia-body-2xl font-cormorant font-bold tracking-tight text-white leading-snug whitespace-pre-line">
                    {card.title}
                  </h3>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Hover Overlay for Desktop */}
          <AnimatePresence>
            {hoveredCard && !isMobile && (
              <motion.div
                className="
                  absolute inset-0 
                  flex items-center justify-center
                  pointer-events-none
                  z-10
                "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onHoverStart={() => setHoveredCard(hoveredCard)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <motion.div
                  className="
                    bg-white/70
                    backdrop-blur-md
                    rounded-lg
                    w-[96%] max-w-5xl
                    h-[88%] max-h-[38rem] sm:max-h-[40rem] lg:max-h-[38rem]
                    flex flex-col items-center justify-center text-center
                    p-6 sm:p-7 md:p-8 lg:p-10
                    border border-gray-300/50
                    shadow-lg shadow-black/10
                    ring-1 ring-gray-200/20
                    mx-2 sm:mx-0
                  "
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {(() => {
                    const card = expertiseData.find(c => c.id === hoveredCard);
                    if (!card) return null;
                    
                    return (
                      <>
                        <motion.h3
                          className="text-ovsia-body-xl lg:text-ovsia-body-2xl font-cormorant font-bold text-white mb-3 lg:mb-4 tracking-tight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {card.overlayTitle}
                        </motion.h3>

                        <motion.p
                          className="text-ovsia-body-base lg:text-ovsia-body-lg text-gray-300 mb-4 lg:mb-5 leading-relaxed max-w-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {card.description}
                        </motion.p>

                        <motion.div
                          className="grid grid-cols-1 gap-2 lg:gap-3 text-ovsia-body-sm lg:text-ovsia-body-base text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {card.details.slice(0, 4).map((detail, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.25 + idx * 0.05 }}
                            >
                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
                              <span>{detail}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </>
                    );
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Click Modal */}
          <AnimatePresence>
            {clickedCard && isMobile && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleBackdropClick}
              >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                
                {/* Modal Content */}
                <motion.div
                  className="
                    relative
                    bg-white
                    rounded-2xl
                    w-full max-w-sm
                    p-6
                    border border-gray-200
                    shadow-2xl
                    mx-4
                  "
                  initial={{ 
                    scale: 0.8, 
                    opacity: 0,
                    x: modalPosition.x - window.innerWidth / 2,
                    y: modalPosition.y - window.innerHeight / 2
                  }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: 0,
                    y: 0
                  }}
                  exit={{ 
                    scale: 0.8, 
                    opacity: 0,
                    x: modalPosition.x - window.innerWidth / 2,
                    y: modalPosition.y - window.innerHeight / 2
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={handleBackdropClick}
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

                  {(() => {
                    const card = expertiseData.find(c => c.id === clickedCard);
                    if (!card) return null;
                    
                    return (
                      <>
                        <motion.h3
                          className="text-ovsia-body-lg font-cormorant font-bold text-white mb-3 tracking-tight pr-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          {card.overlayTitle}
                        </motion.h3>

                        <motion.p
                          className="text-ovsia-body-base text-gray-300 mb-4 leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          {card.description}
                        </motion.p>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {card.details.map((detail, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 + idx * 0.05 }}
                            >
                              <span className="w-1.5 h-1.5 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-ovsia-body-sm text-gray-400 leading-relaxed">{detail}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </>
                    );
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}