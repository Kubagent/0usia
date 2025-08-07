"use client";

import { useEffect } from 'react';
import { initializePerformance, cleanupPerformance } from '@/utils/initializePerformance';

/**
 * Performance Initializer Component
 * 
 * Initializes all performance optimizations when the app loads.
 * This component should be rendered once at the root level.
 */
export default function PerformanceInitializer() {
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformance({
      enableWillChangeManagement: true,
      enableFrameScheduling: true,
      enablePerformanceReporting: process.env.NODE_ENV === 'development',
      enableDevelopmentMonitoring: process.env.NODE_ENV === 'development',
      logInitialization: process.env.NODE_ENV === 'development',
    });

    // Cleanup on unmount (useful for hot reload in development)
    return () => {
      if (process.env.NODE_ENV === 'development') {
        cleanupPerformance();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}