"use client";

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionManagerProps {
  children: React.ReactNode;
}

const sectionColors = [
  '#ffffff', // Section 1 - white
  '#000000', // Section 2 - black
  '#ffffff', // Section 3 - white
  '#000000', // Section 4 - black
  '#ffffff', // Section 5 - white
  '#000000', // Section 6 - black
];

// NOTE: For truly slow, luxurious scroll speed and inertia, consider integrating a library like 'lenis' or 'locomotive-scroll'.
// Native CSS scroll-behavior: smooth does not allow fine-grained speed control across browsers.
const SectionManager: React.FC<SectionManagerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // Debug scroll progress
  useEffect(() => {
    console.log("SectionManager mounted");
    const unsubscribe = scrollYProgress.on("change", (value) => {
      console.log("SectionManager scroll progress:", value);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Create input/output arrays for color interpolation
  const sectionCount = React.Children.count(children);
  const inputRange = Array.from({ length: sectionCount }, (_, i) => i / (sectionCount - 1));
  const outputRange = sectionColors.slice(0, sectionCount);

  // Animate background color based on scroll progress
  const backgroundColor = useTransform(scrollYProgress, inputRange, outputRange);

  return (
    <motion.div
      className="snap-y snap-mandatory w-full min-h-screen"
      style={{
        backgroundColor,
        willChange: 'background-color',
      }}
      aria-label="Full-page scroll navigation"
    >
      {React.Children.map(children, (child, idx) => (
        <section
          key={idx}
          className="min-h-screen w-full flex items-center justify-center snap-start"
        >
          {child}
        </section>
      ))}
    </motion.div>
  );
};

export default SectionManager;
