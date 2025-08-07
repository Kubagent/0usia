"use client";

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import VentureInfoPanel from '@/components/VentureInfoPanel';
import TileGrid from '@/components/TileGrid';
import { ventureData } from '@/data/ventureData';

export default function WindsurfSection() {
  const [selectedVenture, setSelectedVenture] = useState<number | null>(null);
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
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
    setSelectedVenture(index);
  };

  return (
    <section 
      ref={sectionRef}
      className="windsurfSection"
      style={{
        padding: '10vh 5vw',
        backgroundColor: '#f5f5f5',
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
        }}
      >
        Windsurf Ventures
      </motion.h2>
      
      <TileGrid 
        ventures={ventureData}
        randomOrder={randomOrder}
        isInView={isInView}
        onTileHover={handleTileHover}
      />
      
      <VentureInfoPanel 
        venture={selectedVenture !== null ? ventureData[selectedVenture] : null}
        isInView={isInView}
      />
    </section>
  );
}
