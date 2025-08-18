'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TouchGestureConfig {
  /** Minimum swipe distance in pixels */
  minSwipeDistance?: number;
  /** Maximum swipe time in milliseconds */
  maxSwipeTime?: number;
  /** Minimum velocity for swipe detection (px/ms) */
  minVelocity?: number;
  /** Enable momentum scrolling */
  enableMomentum?: boolean;
  /** Momentum decay factor (0-1) */
  momentumDecay?: number;
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  /** Performance tracking */
  trackPerformance?: boolean;
}

export interface TouchMetrics {
  touchStartTime: number;
  touchStartY: number;
  touchCurrentY: number;
  velocity: number;
  direction: 'up' | 'down' | 'none';
  distance: number;
  duration: number;
}

export interface MobilePerformanceMetrics {
  averageResponseTime: number;
  totalGestures: number;
  missedFrames: number;
  lastTouchLatency: number;
  devicePixelRatio: number;
  viewportHeight: number;
  batteryLevel?: number;
  connectionType?: string;
}

/**
 * Mobile-optimized scroll hook for 0usia V4 that provides:
 * - High-performance touch gesture recognition
 * - Momentum scrolling with physics-based decay
 * - Adaptive performance based on device capabilities
 * - Battery and network-aware optimizations
 * - Haptic feedback for better UX
 */
export function useMobileScrollOptimization(config: TouchGestureConfig = {}) {
  const {
    minSwipeDistance = 30,
    maxSwipeTime = 300,
    minVelocity = 0.1,
    enableMomentum = true,
    momentumDecay = 0.95,
    enableHaptics = true,
    trackPerformance = true,
  } = config;

  const [isActive, setIsActive] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<TouchMetrics>({
    touchStartTime: 0,
    touchStartY: 0,
    touchCurrentY: 0,
    velocity: 0,
    direction: 'none',
    distance: 0,
    duration: 0,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<MobilePerformanceMetrics>({
    averageResponseTime: 0,
    totalGestures: 0,
    missedFrames: 0,
    lastTouchLatency: 0,
    devicePixelRatio: window.devicePixelRatio || 1,
    viewportHeight: window.innerHeight,
  });

  const touchStateRef = useRef<{
    isTracking: boolean;
    startTime: number;
    startY: number;
    lastY: number;
    lastTime: number;
    velocityBuffer: { y: number; time: number }[];
    momentumAnimationId?: number;
  }>({
    isTracking: false,
    startTime: 0,
    startY: 0,
    lastY: 0,
    lastTime: 0,
    velocityBuffer: [],
  });

  const performanceBufferRef = useRef<number[]>([]);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  // Device capability detection
  const deviceCapabilities = useRef({
    supportsPassiveListeners: false,
    supportsTouch: false,
    supportsPointerEvents: false,
    supportsVisualViewport: false,
    battery: null as any,
    connection: null as any,
  });

  // Detect device capabilities on mount
  useEffect(() => {
    // Test for passive listener support
    let passive = false;
    try {
      const options = {
        get passive() {
          passive = true;
          return false;
        }
      };
      window.addEventListener('test' as keyof WindowEventMap, null as any, options as EventListenerOptions);
      window.removeEventListener('test' as keyof WindowEventMap, null as any, options as EventListenerOptions);
    } catch (err) {}
    deviceCapabilities.current.supportsPassiveListeners = passive;

    // Detect touch support
    deviceCapabilities.current.supportsTouch = 'ontouchstart' in window;
    deviceCapabilities.current.supportsPointerEvents = 'onpointerdown' in window;
    deviceCapabilities.current.supportsVisualViewport = 'visualViewport' in window;

    // Get battery and connection info if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        deviceCapabilities.current.battery = battery;
      });
    }

    if ('connection' in navigator) {
      deviceCapabilities.current.connection = (navigator as any).connection;
    }

    // Update performance metrics with device info
    setPerformanceMetrics(prev => ({
      ...prev,
      batteryLevel: deviceCapabilities.current.battery?.level,
      connectionType: deviceCapabilities.current.connection?.effectiveType,
    }));
  }, []);

  // Haptic feedback utility
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };

    navigator.vibrate(patterns[type]);
  }, [enableHaptics]);

  // High-precision velocity calculation
  const calculateVelocity = useCallback(() => {
    const buffer = touchStateRef.current.velocityBuffer;
    if (buffer.length < 2) return 0;

    // Use last few points for more accurate velocity
    const recentPoints = buffer.slice(-3);
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < recentPoints.length; i++) {
      totalDistance += Math.abs(recentPoints[i].y - recentPoints[i - 1].y);
      totalTime += recentPoints[i].time - recentPoints[i - 1].time;
    }

    return totalTime > 0 ? totalDistance / totalTime : 0;
  }, []);

  // Performance-optimized touch start handler
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const startTime = performance.now();
    const touch = event.touches[0];
    
    if (!touch) return;

    touchStateRef.current = {
      isTracking: true,
      startTime,
      startY: touch.clientY,
      lastY: touch.clientY,
      lastTime: startTime,
      velocityBuffer: [{ y: touch.clientY, time: startTime }],
    };

    setIsActive(true);
    setCurrentMetrics(prev => ({
      ...prev,
      touchStartTime: startTime,
      touchStartY: touch.clientY,
      touchCurrentY: touch.clientY,
    }));

    // Light haptic feedback on touch start
    triggerHapticFeedback('light');

    if (trackPerformance) {
      frameCountRef.current = 0;
      lastFrameTimeRef.current = startTime;
    }
  }, [triggerHapticFeedback, trackPerformance]);

  // Throttled touch move handler for performance
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchStateRef.current.isTracking) return;

    const now = performance.now();
    const touch = event.touches[0];
    
    if (!touch) return;

    const state = touchStateRef.current;
    const deltaY = touch.clientY - state.lastY;
    const deltaTime = now - state.lastTime;

    // Update velocity buffer (keep last 5 points for smooth calculation)
    state.velocityBuffer.push({ y: touch.clientY, time: now });
    if (state.velocityBuffer.length > 5) {
      state.velocityBuffer.shift();
    }

    state.lastY = touch.clientY;
    state.lastTime = now;

    const totalDistance = Math.abs(touch.clientY - state.startY);
    const totalDuration = now - state.startTime;
    const velocity = calculateVelocity();
    
    const direction = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';

    setCurrentMetrics(prev => ({
      ...prev,
      touchCurrentY: touch.clientY,
      velocity,
      direction,
      distance: totalDistance,
      duration: totalDuration,
    }));

    // Track performance
    if (trackPerformance) {
      frameCountRef.current++;
      const frameTime = now - lastFrameTimeRef.current;
      if (frameTime > 16.67) { // Missed 60fps frame
        setPerformanceMetrics(prev => ({
          ...prev,
          missedFrames: prev.missedFrames + 1,
        }));
      }
      lastFrameTimeRef.current = now;
    }
  }, [calculateVelocity, trackPerformance]);

  // Touch end with momentum calculation
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchStateRef.current.isTracking) return;

    const endTime = performance.now();
    const touch = event.changedTouches[0];
    
    if (!touch) return;

    const state = touchStateRef.current;
    const totalDistance = Math.abs(touch.clientY - state.startY);
    const totalDuration = endTime - state.startTime;
    const velocity = calculateVelocity();
    const direction = touch.clientY > state.startY ? 'down' : 'up';

    // Update final metrics
    setCurrentMetrics(prev => ({
      ...prev,
      velocity,
      direction,
      distance: totalDistance,
      duration: totalDuration,
    }));

    // Determine if this was a valid swipe
    const isValidSwipe = 
      totalDistance >= minSwipeDistance &&
      totalDuration <= maxSwipeTime &&
      velocity >= minVelocity;

    if (isValidSwipe) {
      // Stronger haptic feedback for successful swipe
      triggerHapticFeedback(velocity > 0.5 ? 'medium' : 'light');
    }

    // Performance tracking
    if (trackPerformance) {
      const responseTime = endTime - state.startTime;
      performanceBufferRef.current.push(responseTime);
      
      if (performanceBufferRef.current.length > 50) {
        performanceBufferRef.current.shift();
      }

      const averageTime = performanceBufferRef.current.reduce((a, b) => a + b, 0) / 
                         performanceBufferRef.current.length;

      setPerformanceMetrics(prev => ({
        ...prev,
        averageResponseTime: averageTime,
        totalGestures: prev.totalGestures + 1,
        lastTouchLatency: responseTime,
      }));
    }

    // Momentum scrolling
    if (enableMomentum && isValidSwipe && velocity > minVelocity) {
      startMomentumAnimation(velocity, direction);
    }

    // Reset tracking state
    touchStateRef.current.isTracking = false;
    setIsActive(false);
  }, [
    calculateVelocity,
    minSwipeDistance,
    maxSwipeTime,
    minVelocity,
    triggerHapticFeedback,
    trackPerformance,
    enableMomentum,
  ]);

  // Momentum animation with physics-based decay
  const startMomentumAnimation = useCallback((
    initialVelocity: number,
    direction: 'up' | 'down'
  ) => {
    let velocity = initialVelocity;
    let displacement = 0;

    const animate = () => {
      velocity *= momentumDecay;
      displacement += velocity * (direction === 'down' ? 1 : -1);

      // Continue animation while velocity is significant
      if (velocity > 0.01) {
        touchStateRef.current.momentumAnimationId = requestAnimationFrame(animate);
      } else {
        // Animation complete - trigger final haptic
        triggerHapticFeedback('light');
      }
    };

    animate();
  }, [momentumDecay, triggerHapticFeedback]);

  // Adaptive performance optimization based on device state
  const getOptimalSettings = useCallback(() => {
    const battery = deviceCapabilities.current.battery;
    const connection = deviceCapabilities.current.connection;
    
    let optimizationLevel = 'high'; // high, medium, low

    // Reduce performance if battery is low
    if (battery && battery.level < 0.2) {
      optimizationLevel = 'low';
    } else if (battery && battery.level < 0.5) {
      optimizationLevel = 'medium';
    }

    // Reduce performance on slow connections
    if (connection && ['slow-2g', '2g'].includes(connection.effectiveType)) {
      optimizationLevel = 'low';
    }

    // Adjust settings based on performance level
    const settings = {
      high: {
        throttleMs: 16, // 60fps
        enableHaptics: true,
        enableMomentum: true,
        velocityBufferSize: 5,
      },
      medium: {
        throttleMs: 32, // 30fps
        enableHaptics: true,
        enableMomentum: true,
        velocityBufferSize: 3,
      },
      low: {
        throttleMs: 64, // 15fps
        enableHaptics: false,
        enableMomentum: false,
        velocityBufferSize: 2,
      },
    };

    return settings[optimizationLevel as keyof typeof settings];
  }, []);

  // Set up event listeners with optimal settings
  useEffect(() => {
    const optimalSettings = getOptimalSettings();
    const passiveOption = deviceCapabilities.current.supportsPassiveListeners
      ? { passive: true }
      : false;

    let throttleTimer: NodeJS.Timeout | null = null;
    
    const throttledTouchMove = (event: TouchEvent) => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(
        () => {
          handleTouchMove(event);
          throttleTimer = null;
        },
        optimalSettings.throttleMs
      );
    };

    if (deviceCapabilities.current.supportsTouch) {
      document.addEventListener('touchstart', handleTouchStart, passiveOption);
      document.addEventListener('touchmove', throttledTouchMove, passiveOption);
      document.addEventListener('touchend', handleTouchEnd, passiveOption);
    }

    return () => {
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      
      if (touchStateRef.current.momentumAnimationId) {
        cancelAnimationFrame(touchStateRef.current.momentumAnimationId);
      }

      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', throttledTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, getOptimalSettings]);

  // Cleanup momentum animation on unmount
  useEffect(() => {
    return () => {
      if (touchStateRef.current.momentumAnimationId) {
        cancelAnimationFrame(touchStateRef.current.momentumAnimationId);
      }
    };
  }, []);

  return {
    // Current state
    isActive,
    currentMetrics,
    performanceMetrics,
    
    // Device info
    deviceCapabilities: deviceCapabilities.current,
    
    // Utilities
    triggerHapticFeedback,
    getOptimalSettings,
    
    // Manual controls
    resetMetrics: () => {
      setPerformanceMetrics({
        averageResponseTime: 0,
        totalGestures: 0,
        missedFrames: 0,
        lastTouchLatency: 0,
        devicePixelRatio: window.devicePixelRatio || 1,
        viewportHeight: window.innerHeight,
      });
      performanceBufferRef.current = [];
    },
  };
}