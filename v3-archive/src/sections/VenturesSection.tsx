"use client";

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ventureData } from '@/data/ventureData';
import { VentureType } from '@/types/venture';

// Props type for VentureTile
interface VentureTileProps {
  venture: VentureType;
  index: number;
  randomIndex: number;
  totalTiles: number;
  isInView: boolean;
  onHover: (index: number | null) => void;
}
// Create a new component for venture tiles
const VentureTile: React.FC<VentureTileProps> = ({ 
  venture, 
  index, 
  randomIndex, 
  totalTiles, 
  isInView, 
  onHover 
}) => {
  // Animation variants
  const variants = {
    hidden: { 
      y: "100vh", // Start from bottom of viewport
      opacity: 0,
      scale: 0.8
    },
    visible: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 50, 
        damping: 15,
        delay: i * 0.15, // Staggered delay based on random order
        duration: 1.2,
        ease: [0.6, -0.05, 0.01, 0.99] // Custom easing for fluid motion
      }
    }),
    hover: {
      scale: 1.1,
      y: -8,
      boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      custom={randomIndex}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      variants={variants}
      onClick={() => window.open(venture.url, "_blank")}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img 
        src={venture.logoSrc || `/venture-logos/placeholder.svg`} 
        alt={`${venture.name} logo`}
        style={{
          maxWidth: '70%',
          maxHeight: '70%',
          objectFit: 'contain',
        }}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.05 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: venture.color || '#000000',
        }}
      />
    </motion.div>
  );
};

// Props type for VentureInfoPanel
interface VentureInfoPanelProps {
  venture: VentureType | null;
  isInView: boolean;
}
// Create a new component for venture info panel
const VentureInfoPanel: React.FC<VentureInfoPanelProps> = ({ venture, isInView }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: 20 }}
      animate={{ 
        opacity: isInView ? 1 : 0, 
        height: isInView ? 'auto' : 0,
        y: isInView ? 0 : 20
      }}
      transition={{ 
        duration: 0.6, 
        delay: 0.3,
        ease: [0.6, -0.05, 0.01, 0.99]
      }}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
        marginTop: '30px',
        overflow: 'hidden',
        minHeight: '120px',
        transform: 'translateZ(0)', // Force GPU acceleration
      }}
    >
      {venture ? (
        <motion.div
          key={venture.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.4, 
            type: "spring", 
            stiffness: 100, 
            damping: 10 
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '5px',
            color: '#333',
          }}>
            {venture.name}
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            <div>
              <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Industry:</span> {venture.industry}
            </div>
            
            <div>
              <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Year:</span> {venture.year}
            </div>
            
            <div>
              <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Status:</span> {venture.status}
            </div>
          </div>
          
          {venture.description && (
            <p style={{ 
              marginTop: '10px',
              lineHeight: '1.5',
              color: '#555',
              maxWidth: '800px',
            }}>
              {venture.description}
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            fontStyle: 'italic',
          }}
        >
          Hover over a venture to see details
        </motion.div>
      )}
    </motion.div>
  );
};

// Main section component
export default function VenturesSection() {
  const [selectedVenture, setSelectedVenture] = useState<VentureType | null>(null);
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 }); // Changed to once: false for exit animations
  
  // Generate random order for tile animations using Fisher-Yates shuffle
  useEffect(() => {
    const indices = Array.from({ length: ventureData.length }, (_, i) => i);
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    setRandomOrder(indices);
  }, []);

  const handleTileHover = (index: number | null) => {
    setSelectedVenture(index !== null ? ventureData[index] : null);
  };

  return (
    <section 
      ref={sectionRef}
      className="venturesSection"
      style={{
        padding: '10vh 5vw',
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible', // Ensure animations aren't clipped
        perspective: '1000px', // Add perspective for more dramatic animations
        zIndex: 1, // Ensure proper stacking context
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '5vh',
          textAlign: 'center',
          fontFamily: 'Space Grotesk, sans-serif',
          color: '#ffffff',
        }}
      >
        Windsurf Ventures
      </motion.h2>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '30px',
          width: '100%',
          position: 'relative',
          marginBottom: '40px',
          overflowX: 'auto',
          overflowY: 'visible',
          paddingBottom: '20px',
          minHeight: '180px',
          perspective: '1000px',
        }}
      >
        {ventureData.map((venture, index) => {
          // Find the random index for this venture
          const animationIndex = randomOrder.indexOf(index);
          
          return (
            <VentureTile
              key={venture.id}
              venture={venture}
              index={index}
              randomIndex={animationIndex}
              totalTiles={ventureData.length}
              isInView={isInView}
              onHover={handleTileHover}
            />
          );
        })}
      </div>
      
      <VentureInfoPanel 
        venture={selectedVenture}
        isInView={isInView}
      />
    </section>
  );
}
