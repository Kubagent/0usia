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
          <h2 className="text-ovsia-header-3xl font-cormorant tracking-tight text-black">
            Principles
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto mt-4">
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

          {/* Hover Overlay - Expanding circle with content */}
          <AnimatePresence>
            {hoveredPrinciple && canHover && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Full screen backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                {/* The EXPANDING CIRCLE - starts from original size, grows large */}
                <motion.div
                  className="relative bg-white shadow-2xl border-2 border-gray-200"
                  initial={{
                    width: 280,
                    height: 280,
                    opacity: 0,
                    scale: 0.8
                  }}
                  animate={{
                    width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 900 :
                           typeof window !== 'undefined' && window.innerWidth >= 768 ? 700 : 550,
                    height: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 900 :
                            typeof window !== 'undefined' && window.innerWidth >= 768 ? 700 : 550,
                    opacity: 1,
                    scale: 1
                  }}
                  exit={{
                    width: 280,
                    height: 280,
                    opacity: 0,
                    scale: 0.8
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    duration: 0.5
                  }}
                  style={{
                    clipPath: 'circle(50% at 50% 50%)'
                  }}
                >
                  {/* Content inside the circular area */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-10 lg:p-12 overflow-y-auto">
                    {/* Title */}
                    <motion.h3
                      className="text-xl md:text-3xl lg:text-4xl font-cormorant font-bold text-black mb-3 md:mb-5 lg:mb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      {hoveredPrinciple.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      className="text-sm md:text-base lg:text-lg text-gray-700 mb-4 md:mb-6 lg:mb-7 font-light leading-relaxed max-w-[85%]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {hoveredPrinciple.description}
                    </motion.p>

                    {/* Image (for WHO principle) */}
                    {hoveredPrinciple.image && (
                      <motion.div
                        className="mb-4 md:mb-6 lg:mb-7"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        <img
                          src={hoveredPrinciple.image}
                          alt="Jakub - 0usia"
                          className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                        />
                      </motion.div>
                    )}

                    {/* Details - as paragraphs, no bullets */}
                    <motion.div
                      className="space-y-2 md:space-y-3 lg:space-y-4 max-w-[85%]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {hoveredPrinciple.details.map((detail, index) => (
                        <motion.p
                          key={index}
                          className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + index * 0.05 }}
                        >
                          {detail}
                        </motion.p>
                      ))}
                    </motion.div>
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

                {/* Image (for WHO principle) */}
                {clickedPrinciple.image && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={clickedPrinciple.image}
                      alt="Jakub - 0usia"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                    />
                  </div>
                )}

                {/* Details - as paragraphs, no bullets */}
                <div className="space-y-3">
                  {clickedPrinciple.details.map((detail, index) => (
                    <p
                      key={index}
                      className="text-xs text-gray-600 leading-relaxed"
                    >
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
