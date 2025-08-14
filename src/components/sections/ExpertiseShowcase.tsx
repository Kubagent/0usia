'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title - Minimal */}
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-7xl font-cormorant tracking-tight text-black">
            Expertise
          </h2>
        </div>

        {/* Cards Grid - With Rectangle Overlay */}
        <div className="relative">
          {/* Background Grid - All Cards */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-20 max-w-7xl mx-auto"
            animate={{ 
              opacity: hoveredCard ? 0.2 : 1,
              scale: hoveredCard ? 0.95 : 1 
            }}
            transition={{ duration: 0.4 }}
          >
            {expertiseData.map((card, index) => (
              <motion.div
                key={card.id}
                className="aspect-square relative cursor-pointer"
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="
                    w-full h-full 
                    bg-gradient-to-br from-gray-50/60 to-gray-100/40
                    border border-gray-200/80
                    flex items-center justify-center text-center p-8
                    backdrop-blur-sm
                  "
                  style={{clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'}}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-cormorant tracking-tight text-black leading-tight whitespace-pre-line">
                    {card.title}
                  </h3>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Large Rectangle Overlay */}
          <AnimatePresence>
            {hoveredCard && (
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
                    w-[94%] max-w-4xl
                    h-[84%] max-h-[30rem]
                    flex flex-col items-center justify-center text-center
                    p-5 md:p-6
                    border border-gray-300/50
                    shadow-lg shadow-black/10
                    ring-1 ring-gray-200/20
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
                          className="text-3xl md:text-4xl lg:text-5xl font-cormorant text-black mb-3 tracking-tight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {card.overlayTitle}
                        </motion.h3>
                        
                        <motion.p 
                          className="text-lg md:text-xl text-gray-700 mb-5 leading-relaxed max-w-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {card.description}
                        </motion.p>

                        <motion.div 
                          className="grid grid-cols-1 gap-2 text-base md:text-lg text-gray-600"
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
                              <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 flex-shrink-0"></span>
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
        </div>
      </div>
    </section>
  );
}