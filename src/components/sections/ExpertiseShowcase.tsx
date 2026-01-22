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
    id: 'innovative-strategy',
    title: 'Innovative\nStrategy',
    overlayTitle: 'Turn vision into a product people need.',
    description: "We translate first principles into an executable thesis: what you're building, for whom, why it wins, and what must be true for it to work.",
    details: [
      'Strategic positioning & differentiation',
      'Phased roadmap: scope, team, timeline, milestones, risks',
      'User journeys, UX flows, prototyping',
      'KPI model, and validation plan – what to measure and why'
    ]
  },
  {
    id: 'brand-narrative',
    title: 'Brand &\nNarrative',
    overlayTitle: 'Make your business legible—internally and externally.',
    description: 'We build the conceptual scaffolding that makes your product inevitable to the right audience: what you stand for, and how you speak with consistency at each contact.',
    details: [
      'Brand philosophy, virtues, and narrative',
      'Messaging system, content architecture, voice & tone guide',
      'Landing page, pitch copy (web, deck, outreach)',
      'Film and photography direction & production'
    ]
  },
  {
    id: 'user-experiences',
    title: 'Unique User\nExperiences',
    overlayTitle: 'Convey your truth convincingly.',
    description: 'We design interfaces that feel inevitable: minimal where it should be, expressive where it must be. The result is clarity engineered into experience.',
    details: [
      'UX architecture (full system wire-framing)',
      'UI kit, design system foundations',
      'Complete visual implementations (web and mobile)'
    ]
  },
  {
    id: 'go-to-market',
    title: 'Go-to-\nMarket',
    overlayTitle: 'Distribution is part of the product.',
    description: 'We help you earn traction through disciplined learning cycles: sharpen the offer, test channels, and build repeatable growth loops.',
    details: [
      'Customer profiling, buyer/user segmentation, offer design',
      'Channel experiments, growth hack & testing framework',
      'Campaign plan & creative direction',
      'Measurement and feedback system to guide iteration'
    ]
  },
  {
    id: 'team-dynamics',
    title: 'Team\nDynamics',
    overlayTitle: 'Upgrade collaboration, not just output.',
    description: "Your team is the most valuable asset. We help you shape it, diagnose what's blocking momentum, then implement structures that increase velocity.",
    details: [
      'Founder matchmaking, character analysis & coaching',
      'Team diagnostic — friction, roles, incentives, decision latency',
      'Decision framework — who decides what, how, and when',
      'Feedback practices and escalation pathways'
    ]
  },
  {
    id: 'process-architecture',
    title: 'Process\nArchitecture',
    overlayTitle: 'Make operations calm, scalable, and visible.',
    description: 'We map the full operational flow, then eliminate, automate, or standardize—so quality scales without headcount scaling linearly.',
    details: [
      'Process maps & standard operating procedures (SOPs)',
      'System integration plan (tools, APIs, automation)',
      'eCommerce & marketplace workflow management',
      'Customer support structure and strategy'
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
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-ovsia-header-lg-plus sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-4xl font-cormorant tracking-tight text-white mb-4">
            Expertise
          </h2>
          <p className="text-ovsia-body-xl text-white font-light max-w-2xl mx-auto">
            How we support flourishment
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
                    bg-gradient-to-br from-white/90 to-gray-100/80
                    border-2 border-white/40
                    flex items-center justify-center text-center p-8
                    backdrop-blur-sm
                    shadow-lg shadow-white/10
                  "
                  style={{clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'}}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-ovsia-body-2xl md:text-ovsia-header-base font-cormorant font-bold tracking-tight text-black leading-snug whitespace-pre-line">
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
                    bg-white/95
                    backdrop-blur-md
                    rounded-2xl
                    w-[96%] max-w-5xl
                    h-[88%] max-h-[38rem] sm:max-h-[40rem] lg:max-h-[38rem]
                    flex flex-col items-center justify-center text-center
                    p-6 sm:p-7 md:p-8 lg:p-10
                    border-2 border-gray-200
                    shadow-2xl shadow-black/20
                    ring-1 ring-gray-300
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
                          className="text-ovsia-header-sm lg:text-ovsia-header-base font-cormorant font-bold tracking-tight text-black mb-3 lg:mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {card.overlayTitle}
                        </motion.h3>

                        <motion.p
                          className="text-ovsia-body-xl text-gray-700 font-light mb-4 lg:mb-5 leading-relaxed max-w-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {card.description}
                        </motion.p>

                        <motion.div
                          className="grid grid-cols-1 gap-2 lg:gap-3 text-ovsia-body-xl text-gray-600 font-light"
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
                              <span className="w-1 h-1 bg-black rounded-full mr-2 flex-shrink-0"></span>
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
                    w-full max-w-lg
                    p-6
                    border-2 border-gray-200
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
                          className="text-ovsia-body-lg font-cormorant font-bold tracking-tight text-black mb-2 pr-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          {card.overlayTitle}
                        </motion.h3>

                        <motion.p
                          className="text-sm text-gray-700 font-light mb-3 leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          {card.description}
                        </motion.p>

                        <motion.div
                          className="space-y-1.5"
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
                              <span className="w-1 h-1 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              <span className="text-sm text-gray-600 font-light leading-relaxed">{detail}</span>
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