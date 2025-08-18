'use client';

import { useState, useEffect } from 'react';

export interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  platform: string;
  browser: string;
  canHover: boolean;
}

/**
 * Mobile Detection Hook for 0usia V4
 * 
 * Provides comprehensive device and capability detection for optimal UX
 */
export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: { width: 1920, height: 1080 },
    devicePixelRatio: 1,
    orientation: 'landscape',
    platform: 'unknown',
    browser: 'unknown',
    canHover: true,
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type based on screen size
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Touch detection
      const isTouchDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0;
      
      // Hover capability detection
      const canHover = window.matchMedia('(hover: hover)').matches;
      
      // Orientation detection
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Platform detection
      let platform = 'unknown';
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/android/.test(userAgent)) {
        platform = 'android';
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        platform = 'ios';
      } else if (/windows/.test(userAgent)) {
        platform = 'windows';
      } else if (/macintosh|mac os x/.test(userAgent)) {
        platform = 'macos';
      } else if (/linux/.test(userAgent)) {
        platform = 'linux';
      }
      
      // Browser detection
      let browser = 'unknown';
      if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
        browser = 'chrome';
      } else if (/firefox/.test(userAgent)) {
        browser = 'firefox';
      } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
        browser = 'safari';
      } else if (/edge/.test(userAgent)) {
        browser = 'edge';
      }
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenSize: { width, height },
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation,
        platform,
        browser,
        canHover,
      });
    };

    // Initial detection
    updateDetection();

    // Listen for resize and orientation changes
    const handleResize = () => updateDetection();
    const handleOrientationChange = () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateDetection, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return detection;
}