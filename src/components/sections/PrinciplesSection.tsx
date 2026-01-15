'use client';

import { motion } from 'framer-motion';
import { principlesData, PrincipleQuadrant } from '@/data/principles';

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

        {/* Quadrant Circle */}
        <div className="flex items-center justify-center">
          <svg
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

                return (
                  <g key={quadrant.id}>
                    {/* Quadrant slice */}
                    <path
                      d={path}
                      fill={quadrant.color.base}
                      stroke="#000000"
                      strokeWidth="1.5"
                      className="transition-colors duration-300"
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
          </svg>
        </div>
      </div>
    </section>
  );
}
