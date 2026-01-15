'use client';

import { useState } from 'react';
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
  const { canHover } = useMobileDetection();

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

  const hoveredPrinciple = principlesData.find((q) => q.id === hoveredQuadrant);

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-ovsia-header-3xl font-cormorant tracking-tight text-black mb-4">
            Our Principles
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto">
            The foundation of how we create value
          </p>
        </div>

        {/* Quadrant Circle with Animation and Hover Overlay */}
        <div className="flex items-center justify-center relative">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 60,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
            className="relative"
          >
            <motion.svg
              viewBox="0 0 400 400"
              className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
              style={{ overflow: 'visible' }}
              animate={{
                opacity: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 4,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
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

          {/* Hover Overlay - Shows content when hovering over a quadrant */}
          <AnimatePresence>
            {hoveredPrinciple && canHover && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md shadow-2xl border border-gray-200"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  {/* Title */}
                  <motion.h3
                    className="text-3xl font-cormorant font-bold text-black mb-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {hoveredPrinciple.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    className="text-base text-gray-700 mb-4 font-light leading-relaxed"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {hoveredPrinciple.description}
                  </motion.p>

                  {/* Details */}
                  <motion.ul
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {hoveredPrinciple.details.map((detail, index) => (
                      <motion.li
                        key={index}
                        className="text-sm text-gray-600 flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                      >
                        <span className="mr-2 text-black">•</span>
                        <span>{detail}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
