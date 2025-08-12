"use client";
import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useScrollWillChange } from "@/hooks/useWillChange";
import { createOptimizedSpring, createOptimizedOpacityTransform } from "@/utils/animationOptimizations";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const willChange = useScrollWillChange(true);
  
  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false
  });
  
  // Optimized spring for smooth background transition
  const springProgress = createOptimizedSpring(scrollYProgress, 'cinematic');
  
  // Background fades from white to black with optimized transform
  const bgColor = useTransform(
    springProgress,
    [0, 0.4], // Complete transition in first 40% of scroll
    ["#ffffff", "#000000"]
  );

  // Optimized opacity for logo inversion
  const logoOpacity = createOptimizedOpacityTransform(
    springProgress,
    [0, 0.2, 0.4],
    [1, 0.8, 0]
  );

  const logoInvertOpacity = createOptimizedOpacityTransform(
    springProgress,
    [0, 0.2, 0.4],
    [0, 0.2, 1]
  );

  useEffect(() => {
    console.log('Hero mounted - V3 implementation restored');

    const unsubscribe = scrollYProgress.on('change', value => {
      console.log('Hero scroll progress:', value);
      console.log('Background color should be:', value <= 0.4 ? `transitioning (${(value/0.4*100).toFixed(1)}%)` : 'black');
      console.log('Spring progress:', springProgress.get());
      console.log('BgColor:', bgColor.get());
    });

    if (willChange.ref.current) {
      willChange.startAnimation();
    }
    
    return () => {
      willChange.endAnimation();
      unsubscribe();
    };
  }, [willChange, scrollYProgress]);

  return (
    <motion.section
      ref={(node) => {
        // @ts-ignore - Callback ref assignment
        sectionRef.current = node;
        // @ts-ignore - Callback ref assignment
        willChange.ref.current = node;
      }}
      className="relative min-h-screen flex items-center justify-center animate-gpu"
      style={{ 
        background: bgColor,
        willChange: 'background-color',
      }}
    >
      {/* Logo with optimized double-render technique for smooth inversion */}
      <div className="relative">
        {/* Black logo - fades out */}
        <motion.div
          style={{ opacity: logoOpacity }}
          className="select-none drop-shadow-xl animate-gpu"
        >
          <Image
            src="/0usia_black.png"
            alt="Ovsia Logo"
            width={600}
            height={600}
            priority
          />
        </motion.div>
        
        {/* White logo - fades in */}
        <motion.div
          style={{ 
            opacity: logoInvertOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          className="select-none drop-shadow-xl animate-gpu"
        >
          <Image
            src="/0usia_white.png"
            alt="Ovsia Logo White"
            width={600}
            height={600}
            priority
          />
        </motion.div>
      </div>
    </motion.section>
  );
}