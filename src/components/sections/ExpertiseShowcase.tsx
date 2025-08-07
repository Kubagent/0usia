'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpertiseCard {
  id: string;
  title: string;
  description: string;
  details: string[];
}

const expertiseData: ExpertiseCard[] = [
  {
    id: 'strategic-vision',
    title: 'Strategic Vision',
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
    title: 'AI Operations',
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
    title: 'Capital Optimization',
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
    title: 'Technology Leadership',
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
    title: 'Partnership Dynamics',
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
    title: 'Market Intelligence',
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

  const handleCardHover = (cardId: string | null) => {
    setHoveredCard(cardId);
  };

  const hoveredCardData = hoveredCard ? expertiseData.find(card => card.id === hoveredCard) : null;

  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title - Minimal */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-black">
            Expertise
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16 max-w-6xl mx-auto">
            {expertiseData.map((card, index) => (
              <motion.div
                key={card.id}
                className="aspect-square relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1
                }}
                viewport={{ once: true }}
                onHoverStart={() => handleCardHover(card.id)}
                onHoverEnd={() => handleCardHover(null)}
              >
                <div
                  className={`
                    w-full h-full rounded-full 
                    bg-gradient-to-br from-gray-50/30 to-gray-100/20
                    border border-gray-200/60
                    flex items-center justify-center text-center p-8
                    cursor-pointer transition-all duration-300 ease-out
                    backdrop-blur-sm
                    ${hoveredCard === card.id 
                      ? 'shadow-xl shadow-gray-200/40 scale-110 border-gray-300/80 bg-gradient-to-br from-gray-100/40 to-gray-200/30' 
                      : 'hover:shadow-lg hover:shadow-gray-200/30 hover:scale-105 hover:border-gray-300/70'
                    }
                    ${hoveredCard && hoveredCard !== card.id 
                      ? 'opacity-30 scale-95' 
                      : 'opacity-100'
                    }
                  `}
                >
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-black leading-tight">
                    {card.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Clean Details Overlay */}
          <AnimatePresence>
            {hoveredCardData && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
                
                {/* Content Panel */}
                <motion.div
                  className="relative bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-2xl shadow-gray-200/20 rounded-2xl max-w-2xl mx-auto p-10 z-10"
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Title */}
                  <h3 className="text-2xl font-light tracking-tight text-black mb-6 text-center">
                    {hoveredCardData.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-center">
                    {hoveredCardData.description}
                  </p>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    {hoveredCardData.details.map((detail, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="text-sm text-gray-600 py-1 border-l-2 border-gray-200 pl-3"
                      >
                        {detail}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}