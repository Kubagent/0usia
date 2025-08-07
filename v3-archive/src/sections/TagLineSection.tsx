"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import { Cormorant_Garamond } from 'next/font/google';

// Initialize Cormorant Garamond font
const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function TagLineSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  // Track scroll progress for this section with more aggressive offset values
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false
  });

  // Enhanced debug for scroll progress
  useEffect(() => {
    requestAnimationFrame(() => {
      console.log("TagLineSection mounted with ref:", sectionRef.current);
      const initialValue = scrollYProgress.get();
      console.log("Initial TagLine scroll progress:", initialValue);
      if (sectionRef.current) {
        const height = sectionRef.current.offsetHeight;
        const rect = sectionRef.current.getBoundingClientRect();
        console.log("TagLineSection height:", height);
        console.log("TagLineSection position:", {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          height: rect.height
        });
      }
    });
    const unsubscribe = scrollYProgress.on("change", (value) => {
      console.log("TagLine scroll progress:", value);
    });
    return () => {
      console.log("TagLineSection unmounting");
      unsubscribe();
    };
  }, [scrollYProgress]);

  // Enhanced debug for scroll progress
  useEffect(() => {
    // Wait for next frame to ensure component is mounted and measured
    requestAnimationFrame(() => {
      console.log("TagLineSection mounted with ref:", sectionRef.current);
      
      // Log initial scroll values
      const initialValue = scrollYProgress.get();
      console.log("Initial TagLine scroll progress:", initialValue);
      
      // Force a reflow to ensure the component is properly measured
      if (sectionRef.current) {
        const height = sectionRef.current.offsetHeight;
        const rect = sectionRef.current.getBoundingClientRect();
        console.log("TagLineSection height:", height);
        console.log("TagLineSection position:", {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          height: rect.height
        });
      }
    });
    
    const unsubscribe = scrollYProgress.on("change", (value) => {
      console.log("TagLine scroll progress:", value);
    });
    
    return () => {
      console.log("TagLineSection unmounting");
      unsubscribe();
    };
  }, [scrollYProgress]);

  // Animation settings with centered main heading - more pronounced animation
  // Using wider ranges to ensure animations trigger properly
  const mainHeadingY = useTransform(scrollYProgress, [0, 0.3], [-200, 0]);
  const mainHeadingOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  
  const firstLineY = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  const firstLineX = useTransform(scrollYProgress, [0.1, 0.4], [-300, -30]);
  const firstLineOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  
  const secondLineY = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);
  const secondLineX = useTransform(scrollYProgress, [0.2, 0.5], [300, 30]);
  const secondLineOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  // Track window size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Adjust animation values based on screen size
  const adjustedFirstLineX = useTransform(
    [firstLineX, useMotionValue(isMobile ? 0 : 1)],
    ([x, isMobileVal]) => isMobileVal ? 0 : x
  );
  
  const adjustedSecondLineX = useTransform(
    [secondLineX, useMotionValue(isMobile ? 0 : 1)],
    ([x, isMobileVal]) => isMobileVal ? 0 : x
  );

  // Update animation values when screen size changes
  useEffect(() => {
    adjustedFirstLineX.set(isMobile ? 0 : firstLineX.get());
    adjustedSecondLineX.set(isMobile ? 0 : secondLineX.get());
  }, [isMobile, firstLineX, secondLineX, adjustedFirstLineX, adjustedSecondLineX]);

  // Responsive font sizes
  const headingFontSize = isMobile ? '2.5rem' : isTablet ? '3.5rem' : '4.5rem';
  const textFontSize = isMobile ? '1.8rem' : isTablet ? '2.2rem' : '2.8rem';
  const subTextFontSize = isMobile ? '1.6rem' : isTablet ? '2rem' : '2.4rem';
  const lineHeight = isMobile ? '1.3' : '1.4';
  const headingMarginBottom = isMobile ? '2.5rem' : isTablet ? '4rem' : '6rem';
  const textMarginBottom = isMobile ? '2rem' : '3rem';
  const textPaddingLeft = isMobile ? '0' : isTablet ? 'calc(5% - 50px)' : 'calc(5% - 100px)';
  const textAlign = isMobile ? 'center' : 'left';
  const justifyContent = isMobile ? 'center' : 'flex-end';
  const maxWidth = isMobile ? '100%' : '800px';

  // Flash overlay animation variants
  const flashVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } }, // Abrupt flash with 0.1s duration
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  return (
    <motion.section 
      ref={sectionRef}
      id="tagline-section"
      className={cormorantGaramond.className}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        overflow: 'hidden',
        padding: isMobile ? '10% 5%' : '5%',
        boxSizing: 'border-box',
        textAlign: 'center',
        color: '#FFFFFF',
        zIndex: 10, // Ensure it's above other elements
        willChange: 'transform', // Optimize for animations
      }}
    >
      {/* Background overlay */}
      <motion.div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#000000',
          opacity: bgOpacity,
          zIndex: 1
        }}
      />
      
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1400px',
        width: '100%',
        padding: isMobile ? '0 8%' : '0 5%',
        margin: '0 auto',
      }}>
        {/* Main Heading - Centered */}
        <motion.h1 
          style={{
            fontSize: headingFontSize,
            fontWeight: 700,
            lineHeight: lineHeight,
            letterSpacing: '-0.02em',
            marginBottom: headingMarginBottom,
            textTransform: 'uppercase',
            textAlign: 'center',
            y: mainHeadingY,
            opacity: mainHeadingOpacity,
          }}
        >
          FROM VISION TO STRATEGY
        </motion.h1>

        {/* First Line - Left Aligned */}
        <motion.div 
          style={{
            fontSize: textFontSize,
            fontWeight: 400,
            lineHeight: lineHeight,
            marginBottom: textMarginBottom,
            paddingLeft: textPaddingLeft,
            textAlign: textAlign as any,
            y: firstLineY,
            x: adjustedFirstLineX,
            opacity: firstLineOpacity,
          }}
        >
          We bring clarity of <strong style={{fontWeight: 700}}>INTENT</strong><br />
          and realise the most fruitful <strong style={{fontWeight: 700}}>ACTION</strong>
        </motion.div>
        
        {/* Second Line - Right Aligned */}
        <motion.div 
          style={{
            fontSize: textFontSize,
            fontWeight: 400,
            lineHeight: lineHeight,
            width: '100%',
            display: 'flex',
            justifyContent: justifyContent as any,
            y: secondLineY,
            x: adjustedSecondLineX,
            opacity: secondLineOpacity,
          }}
        >
          <div style={{
            textAlign: isMobile ? 'center' : 'right',
            maxWidth: maxWidth,
            width: isMobile ? '100%' : 'auto',
            whiteSpace: 'pre-line',
          }}>
            {`Find convergence of purpose & ability\nand bring your venture `}<strong style={{fontWeight: 700}}>FROM 0 → 1</strong>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
