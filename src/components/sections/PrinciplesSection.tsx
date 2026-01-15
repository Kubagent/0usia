'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { principlesData, PrincipleQuadrant } from '@/data/principles';
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

// Helper function to create SVG path for a quadrant (90-degree slice)
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
    'M',
    centerX,
    centerY,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
};

// Helper function to get label position for each quadrant
const getLabelPosition = (angle: number, radius: number) => {
  // Position label at 60% of radius from center
  const labelRadius = radius * 0.6;
  // Add 45 degrees to center the label in the quadrant
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

  const handleMouseEnter = (quadrantId: string) => {
    if (canHover) {
      setHoveredQuadrant(quadrantId);
    }
  };

  const handleMouseLeave = () => {
    if (canHover) {
      setHoveredQuadrant(null);
    }
  };

  const handleClick = (quadrantId: string) => {
    if (!canHover || isMobile) {
      setClickedQuadrant(quadrantId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, quadrantId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(quadrantId);
    }
  };

  const closeModal = () => {
    setClickedQuadrant(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Auto-dismiss modal after 5 seconds
  useEffect(() => {
    if (clickedQuadrant) {
      const timer = setTimeout(() => {
        closeModal();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [clickedQuadrant]);

  const hoveredPrinciple = principlesData.find((q) => q.id === hoveredQuadrant);
  const clickedPrinciple = principlesData.find((q) => q.id === clickedQuadrant);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center py-20"
      aria-label="Our Principles - Interactive quadrant circle"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-ovsia-header-3xl font-cormorant tracking-tight text-black mb-4">
            Our Principles
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto">
            The foundation of how we create value
          </p>
        </div>

        {/* Quadrant Circle with Scroll Animation and Hover Overlay */}
        <div className="flex items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative"
          >
            <motion.svg
              viewBox="0 0 400 400"
              className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
              style={{ overflow: 'visible' }}
            >
              <g>
                {principlesData.map((quadrant) => {
                  const path = createQuadrantPath(
                    centerX,
                    centerY,
                    radius,
                    quadrant.angle,
                    quadrant.angle + 90
                  );
                  const labelPos = getLabelPosition(quadrant.angle, radius);
                  const isHovered = hoveredQuadrant === quadrant.id;

                  return (
                    <g key={quadrant.id}>
                      {/* Quadrant slice */}
                      <path
                        d={path}
                        fill={isHovered ? quadrant.color.hover : quadrant.color.base}
                        stroke="#000000"
                        strokeWidth="1.5"
                        className="transition-colors duration-300 cursor-pointer"
                        onMouseEnter={() => handleMouseEnter(quadrant.id)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(quadrant.id)}
                        onKeyDown={(e) => handleKeyDown(e, quadrant.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View ${quadrant.label} principle: ${quadrant.title}`}
                        aria-expanded={hoveredQuadrant === quadrant.id || clickedQuadrant === quadrant.id}
                        style={{ pointerEvents: 'auto' }}
                      />

                      {/* Label text */}
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

                {/* Center circle overlay for aesthetic */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="15"
                  fill="white"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
              </g>
            </motion.svg>
          </motion.div>

          {/* Hover Overlay - Covers full circle with content */}
          <AnimatePresence>
            {hoveredPrinciple && canHover && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Full Circle Overlay */}
                <motion.div
                  className="relative flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  {/* Circular background that matches the SVG size */}
                  <div
                    className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-white/95 backdrop-blur-md shadow-2xl border-2 border-gray-200"
                    style={{
                      clipPath: 'circle(50% at 50% 50%)'
                    }}
                  />

                  {/* Content overlay with scroll */}
                  <div className="relative z-10 w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] flex items-center justify-center">
                    <div className="max-h-[260px] md:max-h-[380px] lg:max-h-[480px] overflow-y-auto px-6 md:px-8 lg:px-10 py-4 text-center scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                      {/* Title */}
                      <motion.h3
                        className="text-base md:text-lg lg:text-xl font-cormorant font-bold text-black mb-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {hoveredPrinciple.title}
                      </motion.h3>

                      {/* Description */}
                      <motion.p
                        className="text-[10px] md:text-xs lg:text-sm text-gray-700 mb-2 md:mb-3 font-light leading-relaxed"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        {hoveredPrinciple.description}
                      </motion.p>

                      {/* Details */}
                      <motion.ul
                        className="space-y-1 md:space-y-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {hoveredPrinciple.details.map((detail, index) => (
                          <motion.li
                            key={index}
                            className="text-[9px] md:text-[10px] lg:text-xs text-gray-600 flex items-start justify-center"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + index * 0.05 }}
                          >
                            <span className="mr-1.5 text-black flex-shrink-0 text-[10px] md:text-xs">•</span>
                            <span className="text-left">{detail}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Modal - Shows content when tapping on a quadrant */}
        <AnimatePresence>
          {clickedPrinciple && (!canHover || isMobile) && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

              {/* Modal Content */}
              <motion.div
                className="relative bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] shadow-2xl overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="sticky top-0 float-right w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Quadrant Label */}
                <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  {clickedPrinciple.label}
                </div>

                {/* Title */}
                <h3 className="text-xl font-cormorant font-bold text-black mb-3">
                  {clickedPrinciple.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 font-light leading-relaxed">
                  {clickedPrinciple.description}
                </p>

                {/* Details */}
                <ul className="space-y-2">
                  {clickedPrinciple.details.map((detail, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-600 flex items-start"
                    >
                      <span className="mr-2 text-black flex-shrink-0">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
