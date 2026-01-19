
'use client';

import { principlesData } from '@/data/principles';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Helper function to convert polar coordinates to cartesian
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Helper function to create SVG path for a quadrant
const createQuadrantPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', centerX, centerY,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
};

// Helper function to get label position
const getLabelPosition = (angle: number, radius: number) => {
  const labelRadius = radius * 0.6;
  const labelAngle = angle + 45;
  return polarToCartesian(0, 0, labelRadius, labelAngle);
};

export default function PrinciplesSection() {
  const centerX = 200;
  const centerY = 200;
  const radius = 180;

  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);
  const [clickedQuadrant, setClickedQuadrant] = useState<string | null>(null);
  const { canHover, isMobile } = useMobileDetection();

  const hoveredPrinciple = principlesData.find((q) => q.id === hoveredQuadrant);
  const clickedPrinciple = principlesData.find((q) => q.id === clickedQuadrant);

  const closeModal = () => {
    setClickedQuadrant(null);
  };

  // Auto-dismiss modal after 5 seconds
  useEffect(() => {
    if (clickedQuadrant) {
      const timer = setTimeout(() => closeModal(), 5000);
      return () => clearTimeout(timer);
    }
  }, [clickedQuadrant]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center py-20"
      aria-label="Principles - Interactive quadrant circle"
    >
      {/* Main content container - positioned relative for overlay */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-ovsia-header-4xl font-cormorant tracking-tight text-black">
            Principles
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto mt-4">
            The foundation of value
          </p>
        </div>

        {/* Quadrant Circle Container */}
        <div
          className="flex items-center justify-center relative"
          onMouseLeave={() => canHover && setHoveredQuadrant(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg
              viewBox="0 0 400 400"
              className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
            >
              <g>
                {principlesData.map((quadrant) => {
                  const path = createQuadrantPath(centerX, centerY, radius, quadrant.angle, quadrant.angle + 90);
                  const labelPos = getLabelPosition(quadrant.angle, radius);
                  const isHovered = hoveredQuadrant === quadrant.id;

                  return (
                    <g key={quadrant.id}>
                      <path
                        d={path}
                        fill={isHovered ? quadrant.color.hover : quadrant.color.base}
                        stroke="#000000"
                        strokeWidth="1.5"
                        className="transition-colors duration-300 cursor-pointer"
                        onMouseEnter={() => canHover && setHoveredQuadrant(quadrant.id)}
                        onClick={() => {
                          if (quadrant.id === 'who') {
                            window.open('https://www.linkedin.com/in/jm-wojcik/', '_blank');
                          } else if (!canHover || isMobile) {
                            setClickedQuadrant(quadrant.id);
                          }
                        }}
                        style={{ pointerEvents: 'auto' }}
                      />
                      <text
                        x={centerX + labelPos.x}
                        y={centerY + labelPos.y + (quadrant.id === 'why' || quadrant.id === 'what' ? 5 : -5)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-4xl md:text-5xl font-cormorant font-semibold fill-black select-none"
                        style={{ pointerEvents: 'none' }}
                      >
                        {quadrant.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx={centerX} cy={centerY} r="15" fill="white" stroke="#000000" strokeWidth="1.5" />
              </g>
            </svg>
          </motion.div>
        </div>

        {/* Desktop Hover Overlay - Static Expanding Circle (positioned relative to section content) */}
        <AnimatePresence>
          {hoveredPrinciple && canHover && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 rounded-full"
                initial={{
                  scale: 0.3,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.3,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  width: '880px',
                  height: '880px',
                  maxWidth: '90vw',
                  maxHeight: '90vw',
                  aspectRatio: '1 / 1',
                }}
              >
                <div className="max-w-3xl text-center overflow-y-auto max-h-full px-8">
                  <h3 className="text-ovsia-header-lg font-cormorant tracking-tight text-white mb-4">
                    {hoveredPrinciple.title}
                  </h3>
                  <p className="text-ovsia-body-xl text-white font-light mb-4 leading-relaxed">
                    {hoveredPrinciple.description}
                  </p>
                  {hoveredPrinciple.image && (
                    <img
                      src={hoveredPrinciple.image}
                      alt="Jakub - 0usia"
                      className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-2 border-white/20 shadow-lg mb-6 mx-auto"
                    />
                  )}
                  {hoveredPrinciple.id === 'how' ? (
                    <>
                      <ul className="text-left space-y-1 pl-8">
                        {hoveredPrinciple.details.slice(0, -1).map((detail, index) => (
                          <li key={index} className="text-ovsia-body-xl text-white font-light leading-snug flex">
                            <span className="mr-2">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-ovsia-body-xl text-white font-light leading-relaxed mt-4 text-center">
                        {hoveredPrinciple.details[hoveredPrinciple.details.length - 1]}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {hoveredPrinciple.details.map((detail, index) => (
                        <p key={index} className="text-ovsia-body-xl text-white font-light leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {clickedPrinciple && (!canHover || isMobile) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="relative bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] shadow-2xl overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-ovsia-body-xl font-cormorant font-light text-gray-500 mb-2 uppercase tracking-wide">
                {clickedPrinciple.label}
              </div>
              <h3 className="text-ovsia-header-lg font-cormorant tracking-tight text-black mb-3">
                {clickedPrinciple.title}
              </h3>
              <p className="text-ovsia-body-xl text-black font-light mb-4 leading-relaxed">
                {clickedPrinciple.description}
              </p>
              {clickedPrinciple.image && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={clickedPrinciple.image}
                    alt="Jakub - 0usia"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                  />
                </div>
              )}
              {clickedPrinciple.id === 'how' ? (
                <>
                  <ul className="text-left space-y-1 pl-6">
                    {clickedPrinciple.details.slice(0, -1).map((detail, index) => (
                      <li key={index} className="text-ovsia-body-xl text-black font-light leading-snug flex">
                        <span className="mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-ovsia-body-xl text-black font-light leading-relaxed mt-4 text-center">
                    {clickedPrinciple.details[clickedPrinciple.details.length - 1]}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  {clickedPrinciple.details.map((detail, index) => (
                    <p key={index} className="text-ovsia-body-xl text-black font-light leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
