"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Tile from './Tile';
import { VentureType } from '@/types/venture';

interface TileGridProps {
  ventures: VentureType[];
  randomOrder: number[];
  isInView: boolean;
  onTileHover: (index: number | null) => void;
}

export default function TileGrid({ ventures, randomOrder, isInView, onTileHover }: TileGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '30px', // Increased gap for better spacing
        width: '100%',
        position: 'relative',
        marginBottom: '40px',
        // For mobile, enable horizontal scrolling
        overflowX: 'auto',
        overflowY: 'visible', // Ensure animations aren't clipped vertically
        paddingBottom: '20px', // More padding for animation space
        // Ensure grid container has enough height for animations
        minHeight: '180px', // Increased height for animations
        perspective: '1000px', // Add perspective for more dramatic animations
      }}
    >
      {ventures.map((venture, index) => {
        // Find the random index for this venture
        const animationIndex = randomOrder.indexOf(index);
        
        return (
          <Tile
            key={venture.id}
            venture={venture}
            index={index}
            animationIndex={animationIndex}
            totalTiles={ventures.length}
            isInView={isInView}
            onHover={onTileHover}
          />
        );
      })}
    </div>
  );
}
