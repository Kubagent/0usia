
'use client';

import { principlesData } from '@/data/principles';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef, useLayoutEffect } from 'react';

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

  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [at, setAt] = useState('50% 50%');

  useLayoutEffect(() => {
    const update = () => {
      if (!svgRef.current || !sectionRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const secRect = sectionRef.current.getBoundingClientRect();
      const x = Math.round(svgRect.left + svgRect.width / 2 - secRect.left);
      const y = Math.round(svgRect.top + svgRect.height / 2 - secRect.top);
      setAt(`${x}px ${y}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const hoveredPrinciple = principlesData.find((q) => q.id === hoveredQuadrant);
  const clickedPrinciple = principlesData.find((q) => q.id === clickedQuadrant);
  const closeModal = () => setClickedQuadrant(null);

  const circleClosed = `circle(0px at ${at})`;
  const circleOpen = `circle(2000px at ${at})`;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center py-20"
      aria-label="Purpose - Interactive quadrant circle"
    >
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-ovsia-header-lg-plus sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-4xl font-cormorant tracking-tight text-black">
            Purpose
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto mt-4">
            The foundation of value
          </p>
        </div>

        {/* Desktop: circle flanked by side labels; Mobile: circle above 2×2 grid */}
        <div className="flex flex-col items-center gap-10">
        <div className="flex flex-row items-center gap-10 lg:gap-20">

          {/* Left column: Why (top) + Who (bottom) — desktop only */}
          <div className="hidden md:flex flex-col justify-between py-[110px] text-right w-48 lg:w-64 h-[400px] lg:h-[500px]">
            {(['why', 'who'] as const).map((id) => {
              const p = principlesData.find((d) => d.id === id)!;
              return (
                <div key={id} className="transition-opacity duration-300" style={{ opacity: hoveredQuadrant && hoveredQuadrant !== id ? 0.12 : 1 }}>
                  <p className="text-lg lg:text-xl font-cormorant italic text-black/70 leading-snug whitespace-nowrap">{p.title}</p>
                </div>
              );
            })}
          </div>

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
              ref={svgRef}
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
                          if (quadrant.id === 'who' && !isMobile) {
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

          {/* Right column: What (top) + How (bottom) — desktop only */}
          <div className="hidden md:flex flex-col justify-between py-[110px] text-left w-48 lg:w-64 h-[400px] lg:h-[500px]">
            {(['what', 'how'] as const).map((id) => {
              const p = principlesData.find((d) => d.id === id)!;
              return (
                <div key={id} className="transition-opacity duration-300" style={{ opacity: hoveredQuadrant && hoveredQuadrant !== id ? 0.12 : 1 }}>
                  <p className="text-lg lg:text-xl font-cormorant italic text-black/70 leading-snug whitespace-nowrap">{p.title}</p>
                </div>
              );
            })}
          </div>

        </div>{/* end desktop three-column row */}


        </div>{/* end flex-col */}
      </div>

      {/* Desktop iris — on section, expands from measured SVG center */}
      <AnimatePresence>
        {hoveredPrinciple && canHover && (
          <motion.div
            key={hoveredPrinciple.id}
            className="absolute inset-0 z-50 bg-black pointer-events-none flex items-center justify-center"
            initial={{ clipPath: circleClosed }}
            animate={{ clipPath: circleOpen }}
            exit={{ clipPath: circleClosed }}
            transition={{ type: 'spring', stiffness: 200, damping: 28, mass: 0.85 }}
          >
            <div className="max-w-[920px] text-center px-8">
              <motion.h3
                className="text-ovsia-header-lg font-cormorant tracking-tight text-white mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.22 }}
              >
                {hoveredPrinciple.title}
              </motion.h3>
              <motion.p
                className="text-ovsia-body-xl text-white font-light mb-4 leading-relaxed whitespace-pre-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {hoveredPrinciple.description}
              </motion.p>
              {hoveredPrinciple.image && (
                <img
                  src={hoveredPrinciple.image}
                  alt="Jakub - 0usia"
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-2 border-white/20 shadow-lg mb-6 mx-auto"
                />
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.38 }}
              >
                <div className="space-y-2">
                  {hoveredPrinciple.details.map((detail, index) => (
                    <p key={index} className="text-ovsia-body-xl text-white font-light leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile modal */}
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
              <div className="text-sm font-cormorant font-light text-gray-500 mb-1.5 uppercase tracking-wide">
                {clickedPrinciple.label}
              </div>
              <h3 className="text-ovsia-body-lg font-cormorant font-bold tracking-tight text-black mb-2">
                {clickedPrinciple.title}
              </h3>
              <p className="text-sm text-black font-light mb-3 leading-relaxed whitespace-pre-line">
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
              <div className="space-y-1.5">
                {clickedPrinciple.details.map((detail, index) => (
                  <p key={index} className="text-sm text-black font-light leading-relaxed">
                    {detail}
                  </p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
