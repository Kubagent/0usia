"use client";

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { VentureType } from '@/types/venture';

interface TileProps {
  venture: VentureType;
  index: number;
  animationIndex: number;
  totalTiles: number;
  isInView: boolean;
  onHover: (index: number | null) => void;
}

export default function Tile({ 
  venture, 
  index, 
  animationIndex, 
  totalTiles, 
  isInView, 
  onHover 
}: TileProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Enhanced mouse tracking for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animations for smooth movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["7.5deg", "-7.5deg"]), {
    stiffness: 350,
    damping: 40,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-7.5deg", "7.5deg"]), {
    stiffness: 350,
    damping: 40,
  });

  // Enhanced animation variants with performance optimizations
  const variants = {
    hidden: { 
      y: "120vh", // Start even further below for more dramatic entrance
      opacity: 0,
      scale: 0.75,
      rotateX: 15,
    },
    visible: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: { 
        type: "spring", 
        stiffness: 60,
        damping: 18,
        delay: i * 0.12, // Slightly faster stagger for better flow
        duration: 1.4,
        ease: [0.6, -0.05, 0.01, 0.99],
      }
    }),
    exit: {
      y: "-80vh",
      opacity: 0,
      scale: 0.9,
      rotateX: -10,
      transition: { 
        duration: 1.0,
        ease: [0.6, -0.05, 0.01, 0.99],
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (event.clientX - rect.left - width / 2) / width;
    const y = (event.clientY - rect.top - height / 2) / height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(index);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(null);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      custom={animationIndex}
      initial="hidden"
      animate={isInView ? "visible" : "exit"}
      variants={variants}
      onClick={() => window.open(venture.url, "_blank")}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        cursor: 'pointer',
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.08 : 1,
          y: isHovered ? -12 : 0,
          boxShadow: isHovered 
            ? "0px 25px 50px rgba(0, 0, 0, 0.25), 0px 10px 25px rgba(0, 0, 0, 0.1)"
            : "0px 4px 15px rgba(0, 0, 0, 0.05)",
        }}
        style={{
          rotateX,
          rotateY,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          height: '100%',
          border: isHovered ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid transparent',
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          y: { type: "spring", stiffness: 400, damping: 25 },
          boxShadow: { duration: 0.3, ease: "easeOut" },
          border: { duration: 0.2, ease: "easeOut" },
        }}
      >
        {/* Enhanced logo with better positioning */}
        <motion.img 
          src={venture.logoSrc || '/venture-logos/placeholder.svg'} 
          alt={`${venture.name} logo`}
          animate={{
            scale: isHovered ? 1.05 : 1,
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
          }}
          transition={{
            scale: { type: "spring", stiffness: 400, damping: 30 },
            filter: { duration: 0.3, ease: "easeOut" },
          }}
          style={{
            maxWidth: '65%',
            maxHeight: '65%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
          }}
        />
        
        {/* Enhanced overlay with gradient and better opacity control */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.08 : 0,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{
            opacity: { duration: 0.4, ease: "easeOut" },
            scale: { type: "spring", stiffness: 300, damping: 30 },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${venture.color || '#000000'}40, ${venture.color || '#000000'}20)`,
            zIndex: 1,
          }}
        />

        {/* Subtle shine effect on hover */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.6 : 0,
            x: isHovered ? '100%' : '-100%',
          }}
          transition={{
            opacity: { duration: 0.6, ease: "easeOut" },
            x: { duration: 0.8, ease: "easeOut" },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            transform: 'skewX(-20deg)',
            zIndex: 3,
          }}
        />

        {/* Focus ring for accessibility */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.95,
          }}
          transition={{
            opacity: { duration: 0.2, ease: "easeOut" },
            scale: { type: "spring", stiffness: 400, damping: 30 },
          }}
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: '10px',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
