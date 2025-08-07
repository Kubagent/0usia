'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useOptimizedScrollLock, PerformanceMetric } from '@/hooks/useOptimizedScrollLock';

export interface OptimizedScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Show performance debug info */
  showDebug?: boolean;
  /** Show section navigation indicators */
  showIndicators?: boolean;
  /** Callback when section changes */
  onSectionChange?: (sectionIndex: number) => void;
  /** Custom indicator component */
  IndicatorComponent?: React.ComponentType<{
    isActive: boolean;
    sectionIndex: number;
    onClick: () => void;
  }>;
  /** Performance monitoring callback */
  onPerformanceMetric?: (metric: PerformanceMetric) => void;
}

/**
 * Optimized scroll container that provides "one flick = one section" navigation
 * while preserving Hero scroll animations and maintaining 60fps performance
 */
export default function OptimizedScrollContainer({
  children,
  className = '',
  showDebug = false,
  showIndicators = true,
  onSectionChange,
  IndicatorComponent,
  onPerformanceMetric,
}: OptimizedScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  // Count sections from children
  const sections = React.Children.toArray(children);
  const sectionCount = sections.length;

  // Handle performance metrics
  const handlePerformanceMetric = (metric: PerformanceMetric) => {
    if (onPerformanceMetric) {
      onPerformanceMetric(metric);
    }
    
    if (showDebug) {
      setPerformanceMetrics(prev => {
        const newMetrics = [metric, ...prev].slice(0, 10); // Keep last 10 metrics
        return newMetrics;
      });
    }
  };

  // Initialize optimized scroll lock
  const { state, goToSection, registerSection, setEnabled } = useOptimizedScrollLock({
    sectionCount,
    allowHeroScroll: true,
    throttleMs: 16, // 60fps
    enableTouch: true,
    scrollBehavior: 'smooth',
    onPerformanceMetric: handlePerformanceMetric,
  });

  // Register child sections with Intersection Observer
  useEffect(() => {
    if (containerRef.current) {
      const sectionElements = containerRef.current.children;
      for (let i = 0; i < sectionElements.length; i++) {
        const element = sectionElements[i] as HTMLElement;
        registerSection(i, element);
      }
    }
  }, [registerSection, children]);

  // Call onSectionChange when current section changes
  useEffect(() => {
    if (onSectionChange) {
      onSectionChange(state.currentSection);
    }
  }, [state.currentSection, onSectionChange]);

  // Add loaded class to prevent FOUC
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.classList.add('loaded');
    }
  }, []);

  // Performance monitoring for FPS
  const fpsRef = useRef<number>(0);
  const frameTimeRef = useRef<number>(performance.now());
  
  useEffect(() => {
    let animationId: number;
    
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - frameTimeRef.current;
      fpsRef.current = 1000 / delta;
      frameTimeRef.current = now;
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    if (showDebug) {
      measureFPS();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [showDebug]);

  // Default indicator component
  const DefaultIndicator = ({ 
    isActive, 
    onClick, 
    sectionIndex 
  }: { 
    isActive: boolean; 
    onClick: () => void;
    sectionIndex: number;
  }) => (
    <button
      onClick={onClick}
      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
        isActive
          ? 'bg-white border-white scale-125 shadow-lg'
          : 'bg-transparent border-white/50 hover:border-white/80 hover:scale-110'
      }`}
      aria-label={`Go to section ${sectionIndex + 1}`}
      style={{
        willChange: isActive ? 'transform' : 'auto',
      }}
    />
  );

  const Indicator = IndicatorComponent || DefaultIndicator;

  return (
    <div className="relative">
      {/* Main container with optimized CSS scroll-snap */}
      <div
        ref={containerRef}
        className={`optimized-scroll-container ${className}`}
        style={{
          // CSS scroll-snap for native performance (but Hero will override this)
          scrollSnapType: 'y proximity', // Changed from mandatory to proximity for Hero compatibility
          scrollBehavior: 'smooth',
          overflowY: 'auto',
          height: '100vh',
          // Performance optimizations
          willChange: 'scroll-position',
          transform: 'translateZ(0)', // Force GPU acceleration
          backfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      >
        {React.Children.map(children, (child, index) => {
          const isHeroSection = index === 0;
          
          return (
            <div
              key={index}
              className={`scroll-snap-section ${isHeroSection ? 'hero-section' : 'standard-section'}`}
              style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                minHeight: '100vh',
                height: isHeroSection ? 'auto' : '100vh', // Allow Hero to be taller
                // Performance optimizations
                contain: 'layout style paint',
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Section navigation indicators */}
      {showIndicators && sectionCount > 1 && (
        <nav
          className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-4"
          aria-label="Section navigation"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0) translateY(-50%)',
          }}
        >
          {Array.from({ length: sectionCount }, (_, index) => (
            <Indicator
              key={index}
              isActive={index === state.currentSection}
              sectionIndex={index}
              onClick={() => goToSection(index)}
            />
          ))}
        </nav>
      )}

      {/* Performance debug panel */}
      {showDebug && (process.env.NODE_ENV === 'development') && (
        <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg font-mono text-xs z-50 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Performance Monitor</h3>
            <div className="text-green-400">
              {Math.round(fpsRef.current)} FPS
            </div>
          </div>
          
          <div className="space-y-1 mb-3">
            <div>Section: {state.currentSection + 1}/{sectionCount}</div>
            <div>Progress: {(state.sectionProgress * 100).toFixed(1)}%</div>
            <div>Hero Active: {state.isHeroActive ? 'Yes' : 'No'}</div>
            <div>Transitioning: {state.isTransitioning ? 'Yes' : 'No'}</div>
            <div>Enabled: {state.isEnabled ? 'Yes' : 'No'}</div>
          </div>

          {performanceMetrics.length > 0 && (
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-400 mb-1">Recent Metrics:</div>
              {performanceMetrics.slice(0, 3).map((metric, index) => (
                <div key={index} className="text-xs">
                  {metric.type}: {metric.duration.toFixed(1)}ms
                  {metric.fps && ` (${Math.round(metric.fps)} fps)`}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Global CSS for Performance Optimizations */}
      <style jsx global>{`
        .optimized-scroll-container {
          /* Core scroll-snap behavior - proximity allows Hero natural scrolling */
          scroll-snap-type: y proximity;
          scroll-behavior: smooth;
          
          /* iOS Safari optimizations */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          
          /* Force GPU acceleration */
          transform: translateZ(0);
          will-change: scroll-position;
          
          /* Prevent paint layers from being recomposited */
          backface-visibility: hidden;
          perspective: 1000px;
          
          /* Optimize scrollbar rendering */
          scrollbar-width: thin;
          scrollbar-gutter: stable;
        }
        
        /* Modern browsers scrollbar styling */
        .optimized-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .optimized-scroll-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        .optimized-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .optimized-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
        
        .scroll-snap-section {
          /* Precise scroll-snap alignment */
          scroll-snap-align: start;
          scroll-snap-stop: always;
          
          /* Optimize paint performance */
          contain: layout style paint;
          content-visibility: auto;
          
          /* GPU acceleration for transitions */
          transform: translateZ(0);
          will-change: transform;
          
          /* Prevent layout thrashing */
          position: relative;
          isolation: isolate;
        }
        
        /* Hero section specific optimizations */
        .hero-section {
          /* CRITICAL: Disable scroll-snap for Hero to allow natural scrolling */
          scroll-snap-align: none;
          scroll-snap-stop: normal;
          min-height: 100vh;
          height: auto;
          
          /* Optimize for background color animations */
          contain: layout paint;
          transform: translateZ(0);
          
          /* Prepare for Framer Motion animations */
          will-change: background-color;
          
          /* Allow natural overflow for Hero animations */
          overflow: visible;
        }
        
        /* Standard sections (locked to viewport) */
        .standard-section {
          height: 100vh;
          min-height: 100vh;
          max-height: 100vh;
          
          /* Prevent content overflow */
          overflow: hidden;
          
          /* Optimize for fixed-height content */
          contain: size layout style paint;
        }
        
        /* Framer Motion optimization overrides */
        .hero-section [data-framer-motion] {
          /* Force GPU acceleration for animated elements */
          transform: translateZ(0);
          backface-visibility: hidden;
          
          /* Optimize for color and filter animations */
          will-change: background-color, filter;
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .optimized-scroll-container {
            scroll-behavior: auto;
          }
          
          .scroll-snap-section {
            transition: none;
            scroll-snap-type: none;
          }
          
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .optimized-scroll-container {
            /* Enhanced touch scrolling */
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
            
            /* Prevent zoom on double-tap */
            touch-action: pan-y;
            
            /* Optimize for mobile GPU */
            transform: translate3d(0, 0, 0);
          }
          
          .scroll-snap-section {
            /* Mobile viewport handling */
            min-height: 100vh;
            min-height: 100dvh; /* Dynamic viewport height */
          }
          
          .hero-section {
            /* Mobile Hero optimization */
            min-height: 100vh;
            min-height: 100dvh;
            
            /* Prevent iOS Safari bounce */
            overscroll-behavior-y: none;
          }
        }
        
        /* High-DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .scroll-snap-section {
            /* Optimize for retina displays */
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          
          /* Ensure crisp logo rendering on high-DPI */
          .hero-section img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
        
        /* Dark mode scrollbar optimizations */
        @media (prefers-color-scheme: dark) {
          .optimized-scroll-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .optimized-scroll-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
          }
          
          .optimized-scroll-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        }
        
        /* Prevent FOUC (Flash of Unstyled Content) */
        .optimized-scroll-container {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .optimized-scroll-container.loaded {
          opacity: 1;
        }
        
        /* Memory optimization - pause animations in non-visible sections */
        .scroll-snap-section:not(.active) * {
          animation-play-state: paused;
        }
        
        .scroll-snap-section.active * {
          animation-play-state: running;
        }
      `}</style>
    </div>
  );
}