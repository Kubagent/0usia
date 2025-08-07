"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VentureType } from '@/types/venture';

interface VentureInfoPanelProps {
  venture: VentureType | null;
  isInView: boolean;
}

export default function VentureInfoPanel({ venture, isInView }: VentureInfoPanelProps) {
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
        ease: [0.25, 0.1, 0.25, 1] 
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
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </motion.div>
  );
}
