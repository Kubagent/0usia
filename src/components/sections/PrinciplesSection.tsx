'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { principlesData } from '@/data/principles';
import { useMobileDetection } from '@/hooks/useMobileDetection';

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
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-ovsia-header-3xl font-cormorant tracking-tight text-black">
            Principles
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto mt-4">
            The foundation of how we create value
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
                        onClick={() => (!canHover || isMobile) && setClickedQuadrant(quadrant.id)}
                        style={{ pointerEvents: 'auto' }}
                      />
                      <text
                        x={centerX + labelPos.x}
                        y={centerY + labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-2xl md:text-3xl font-cormorant font-semibold fill-black select-none"
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

          {/* Desktop Hover Overlay - Expanding Circle */}
          <AnimatePresence>
            {hoveredPrinciple && canHover && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Expanding circular content - pointer-events-none so it doesn't interfere with hover */}
                <motion.div
                  className="bg-white shadow-2xl"
                  initial={{
                    width: '280px',
                    height: '280px',
                    opacity: 0,
                  }}
                  animate={{
                    width: '900px',
                    height: '900px',
                    opacity: 1,
                  }}
                  exit={{
                    width: '280px',
                    height: '280px',
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{
                    clipPath: 'circle(50% at 50% 50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-16 overflow-y-auto">
                    <h3 className="text-3xl font-cormorant font-bold text-black mb-4 text-center">
                      {hoveredPrinciple.title}
                    </h3>
                    <p className="text-lg text-gray-700 mb-6 font-light leading-relaxed max-w-2xl text-center">
                      {hoveredPrinciple.description}
                    </p>
                    {hoveredPrinciple.image && (
                      <img
                        src={hoveredPrinciple.image}
                        alt="Jakub - 0usia"
                        className="w-40 h-40 rounded-full object-cover border-2 border-gray-200 shadow-lg mb-6"
                      />
                    )}
                    <div className="space-y-4 max-w-2xl">
                      {hoveredPrinciple.details.map((detail, index) => (
                        <p key={index} className="text-base text-gray-600 leading-relaxed text-center">
                          {detail}
                        </p>
                      ))}
                    </div>
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
                <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  {clickedPrinciple.label}
                </div>
                <h3 className="text-2xl font-cormorant font-bold text-black mb-3">
                  {clickedPrinciple.title}
                </h3>
                <p className="text-base text-gray-700 mb-4 font-light leading-relaxed">
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
                <div className="space-y-3">
                  {clickedPrinciple.details.map((detail, index) => (
                    <p key={index} className="text-sm text-gray-600 leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
