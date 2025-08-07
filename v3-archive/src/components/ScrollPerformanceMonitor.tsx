"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface ScrollPerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showFPS?: boolean;
  showScrollMetrics?: boolean;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  scrollVelocity: number;
  direction: string;
  isScrolling: boolean;
}

const ScrollPerformanceMonitor: React.FC<ScrollPerformanceMonitorProps> = ({
  enabled = false,
  position = 'top-right',
  showFPS = true,
  showScrollMetrics = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    scrollVelocity: 0,
    direction: 'idle',
    isScrolling: false,
  });
  
  const [isVisible, setIsVisible] = useState(true);
  const frameTimeRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>();

  const { direction, velocity, isScrolling } = useScrollDirection({
    threshold: 5,
    velocityThreshold: 0.1,
    idleDelay: 100,
  });

  // FPS calculation
  useEffect(() => {
    if (!enabled) return;

    const measureFPS = (currentTime: number) => {
      if (lastTimeRef.current) {
        const deltaTime = currentTime - lastTimeRef.current;
        frameTimeRef.current.push(deltaTime);
        
        // Keep only last 60 frame times for rolling average
        if (frameTimeRef.current.length > 60) {
          frameTimeRef.current.shift();
        }
        
        // Calculate average frame time and FPS
        const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        
        setMetrics(prev => ({
          ...prev,
          fps: Math.min(fps, 144), // Cap at 144fps for display
          frameTime: Math.round(avgFrameTime * 100) / 100,
          scrollVelocity: Math.round(velocity * 1000) / 1000,
          direction,
          isScrolling,
        }));
      }
      
      lastTimeRef.current = currentTime;
      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled, direction, velocity, isScrolling]);

  if (!enabled) return null;

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.4',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(8px)',
      minWidth: '200px',
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 20, left: 20 };
      case 'top-right':
        return { ...base, top: 20, right: 20 };
      case 'bottom-left':
        return { ...base, bottom: 20, left: 20 };
      case 'bottom-right':
        return { ...base, bottom: 20, right: 20 };
      default:
        return { ...base, top: 20, right: 20 };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#4ade80'; // Green
    if (fps >= 30) return '#fbbf24'; // Yellow
    return '#ef4444'; // Red
  };

  const getVelocityColor = (velocity: number) => {
    if (velocity < 1) return '#6b7280'; // Gray
    if (velocity < 5) return '#3b82f6'; // Blue
    if (velocity < 10) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={getPositionStyles()}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>
              Performance Monitor
            </span>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>

          {showFPS && (
            <div style={{ marginBottom: '6px' }}>
              <span style={{ color: '#d1d5db' }}>FPS: </span>
              <span style={{ color: getFPSColor(metrics.fps), fontWeight: 'bold' }}>
                {metrics.fps}
              </span>
              <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                ({metrics.frameTime}ms)
              </span>
            </div>
          )}

          {showScrollMetrics && (
            <>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#d1d5db' }}>Direction: </span>
                <span
                  style={{
                    color: metrics.direction === 'idle' ? '#6b7280' : '#60a5fa',
                    fontWeight: 'bold',
                  }}
                >
                  {metrics.direction}
                </span>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#d1d5db' }}>Velocity: </span>
                <span
                  style={{
                    color: getVelocityColor(metrics.scrollVelocity),
                    fontWeight: 'bold',
                  }}
                >
                  {metrics.scrollVelocity.toFixed(2)}
                </span>
              </div>

              <div>
                <span style={{ color: '#d1d5db' }}>Scrolling: </span>
                <span
                  style={{
                    color: metrics.isScrolling ? '#10b981' : '#6b7280',
                    fontWeight: 'bold',
                  }}
                >
                  {metrics.isScrolling ? 'Yes' : 'No'}
                </span>
              </div>
            </>
          )}

          {/* Performance status indicator */}
          <div
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor:
                metrics.fps >= 55
                  ? 'rgba(34, 197, 94, 0.2)'
                  : metrics.fps >= 30
                  ? 'rgba(251, 191, 36, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${
                metrics.fps >= 55
                  ? 'rgba(34, 197, 94, 0.4)'
                  : metrics.fps >= 30
                  ? 'rgba(251, 191, 36, 0.4)'
                  : 'rgba(239, 68, 68, 0.4)'
              }`,
              textAlign: 'center' as const,
              fontSize: '10px',
            }}
          >
            {metrics.fps >= 55
              ? 'Excellent Performance'
              : metrics.fps >= 30
              ? 'Good Performance'
              : 'Performance Issues'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollPerformanceMonitor;