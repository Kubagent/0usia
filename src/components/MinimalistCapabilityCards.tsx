'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CapabilityCard } from '@/types/capability';

interface MinimalistCapabilityCardsProps {
  cards: CapabilityCard[];
  className?: string;
}

const MinimalistCapabilityCards: React.FC<MinimalistCapabilityCardsProps> = ({
  cards,
  className = ''
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    observer.observe(section);

    return () => {
      observer.unobserve(section);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`min-h-screen relative transition-colors duration-1000 ease-in-out ${
        isVisible ? 'bg-white' : 'bg-black'
      } ${className}`}
    >
      <div className="flex items-center justify-center min-h-screen py-20 px-4">
        <div className="w-full max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`text-5xl md:text-6xl lg:text-7xl font-cormorant mb-6 leading-tight transition-colors duration-1000 ${
              isVisible ? 'text-black' : 'text-white'
            }`}>
              Core Capabilities
            </h2>
            <p className={`text-xl md:text-2xl font-space max-w-3xl mx-auto leading-relaxed transition-colors duration-1000 ${
              isVisible ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Comprehensive expertise across the full spectrum of digital innovation
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cards.map((card) => (
              <div
                key={card.id}
                className="group relative overflow-hidden"
                onMouseEnter={() => setExpandedCard(card.id)}
                onMouseLeave={() => setExpandedCard(null)}
              >
                {/* Card Container */}
                <div className={`
                  relative p-8 rounded-lg transition-all duration-500 ease-out cursor-pointer
                  ${expandedCard === card.id ? 'transform scale-105 z-10' : 'transform scale-100'}
                  ${isVisible ? 'bg-white border-2 border-gray-200 hover:border-gray-400' : 'bg-gray-900 border-2 border-gray-700 hover:border-gray-500'}
                  hover:shadow-2xl
                `}>
                  
                  {/* Default Card Content */}
                  <div className={`transition-opacity duration-300 ${
                    expandedCard === card.id ? 'opacity-0' : 'opacity-100'
                  }`}>
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-4">{card.icon}</span>
                      <h3 className={`text-2xl font-cormorant font-semibold transition-colors duration-1000 ${
                        isVisible ? 'text-black' : 'text-white'
                      }`}>
                        {card.title}
                      </h3>
                    </div>
                    <p className={`text-lg font-space leading-relaxed transition-colors duration-1000 ${
                      isVisible ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {card.description}
                    </p>
                  </div>

                  {/* Expanded Card Content */}
                  <div className={`absolute inset-0 p-8 transition-opacity duration-300 ${
                    expandedCard === card.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
                    <div className="h-full flex flex-col justify-between">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-center mb-4">
                          <span className="text-3xl mr-3">{card.icon}</span>
                          <h3 className={`text-xl font-cormorant font-semibold transition-colors duration-1000 ${
                            isVisible ? 'text-black' : 'text-white'
                          }`}>
                            {card.modalContent.title}
                          </h3>
                        </div>
                        <p className={`text-sm font-space leading-relaxed mb-4 transition-colors duration-1000 ${
                          isVisible ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          {card.modalContent.description}
                        </p>
                      </div>

                      {/* Key Features */}
                      <div className="mb-4">
                        <h4 className={`text-sm font-space font-semibold mb-2 transition-colors duration-1000 ${
                          isVisible ? 'text-black' : 'text-white'
                        }`}>
                          Key Capabilities:
                        </h4>
                        <ul className="space-y-1">
                          {card.modalContent.features.slice(0, 4).map((feature, index) => (
                            <li 
                              key={index}
                              className={`text-xs font-space flex items-start transition-colors duration-1000 ${
                                isVisible ? 'text-gray-600' : 'text-gray-400'
                              }`}
                            >
                              <span className={`mr-2 mt-1 transition-colors duration-1000 ${
                                isVisible ? 'text-black' : 'text-white'
                              }`}>•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      {card.modalContent.technologies && (
                        <div>
                          <h4 className={`text-sm font-space font-semibold mb-2 transition-colors duration-1000 ${
                            isVisible ? 'text-black' : 'text-white'
                          }`}>
                            Technologies:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {card.modalContent.technologies.slice(0, 6).map((tech, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-xs font-space transition-colors duration-1000 ${
                                  isVisible 
                                    ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                                    : 'bg-gray-800 text-gray-300 border border-gray-600'
                                }`}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MinimalistCapabilityCards;