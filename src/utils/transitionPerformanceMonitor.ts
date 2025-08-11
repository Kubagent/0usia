/**
 * Performance Monitor for Section Transitions
 * 
 * Lightweight monitoring to ensure transitions maintain 60fps performance
 */

interface TransitionMetrics {
  frameRate: number;
  droppedFrames: number;
  averageFrameTime: number;
  transitionDuration: number;
  startTime: number;
}

class TransitionPerformanceMonitor {
  private metrics: TransitionMetrics = {
    frameRate: 60,
    droppedFrames: 0,
    averageFrameTime: 16.67, // 60fps = ~16.67ms per frame
    transitionDuration: 0,
    startTime: 0,
  };

  private frameTimestamps: number[] = [];
  private isMonitoring = false;
  private animationId: number | null = null;

  /**
   * Start monitoring transition performance
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.metrics.startTime = performance.now();
    this.frameTimestamps = [];
    
    const measureFrame = () => {
      if (!this.isMonitoring) return;
      
      const now = performance.now();
      this.frameTimestamps.push(now);
      
      // Keep only recent frame timestamps (last 60 frames)
      if (this.frameTimestamps.length > 60) {
        this.frameTimestamps.shift();
      }
      
      this.updateMetrics();
      this.animationId = requestAnimationFrame(measureFrame);
    };
    
    this.animationId = requestAnimationFrame(measureFrame);
  }

  /**
   * Stop monitoring and return final metrics
   */
  stopMonitoring(): TransitionMetrics {
    if (!this.isMonitoring) return this.metrics;
    
    this.isMonitoring = false;
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.metrics.transitionDuration = performance.now() - this.metrics.startTime;
    return { ...this.metrics };
  }

  /**
   * Update performance metrics based on frame timestamps
   */
  private updateMetrics(): void {
    if (this.frameTimestamps.length < 2) return;
    
    const frameTimes: number[] = [];
    let droppedFrames = 0;
    
    // Calculate frame times
    for (let i = 1; i < this.frameTimestamps.length; i++) {
      const frameTime = this.frameTimestamps[i] - this.frameTimestamps[i - 1];
      frameTimes.push(frameTime);
      
      // Consider frames over 20ms as "dropped" (below 50fps)
      if (frameTime > 20) {
        droppedFrames++;
      }
    }
    
    // Calculate average frame time and frame rate
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const frameRate = 1000 / avgFrameTime;
    
    this.metrics.averageFrameTime = avgFrameTime;
    this.metrics.frameRate = frameRate;
    this.metrics.droppedFrames = droppedFrames;
  }

  /**
   * Get current metrics without stopping monitoring
   */
  getCurrentMetrics(): TransitionMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if current performance is acceptable (>50fps, <10% dropped frames)
   */
  isPerformanceAcceptable(): boolean {
    return (
      this.metrics.frameRate > 50 &&
      this.metrics.droppedFrames / Math.max(this.frameTimestamps.length - 1, 1) < 0.1
    );
  }
}

/**
 * Global performance monitor instance
 */
const performanceMonitor = new TransitionPerformanceMonitor();

/**
 * Hook for monitoring transition performance in React components
 */
export const useTransitionPerformance = () => {
  const startMonitoring = () => {
    if (process.env.NODE_ENV === 'development') {
      performanceMonitor.startMonitoring();
    }
  };

  const stopMonitoring = () => {
    if (process.env.NODE_ENV === 'development') {
      const metrics = performanceMonitor.stopMonitoring();
      
      // Log performance results in development
      if (metrics.frameRate < 50) {
        console.warn('Section transition performance below 50fps:', metrics);
      } else {
        console.log('Section transition performance:', metrics);
      }
      
      return metrics;
    }
    
    return null;
  };

  const getCurrentMetrics = () => {
    if (process.env.NODE_ENV === 'development') {
      return performanceMonitor.getCurrentMetrics();
    }
    
    return null;
  };

  const isPerformanceAcceptable = () => {
    if (process.env.NODE_ENV === 'development') {
      return performanceMonitor.isPerformanceAcceptable();
    }
    
    return true; // Assume acceptable in production
  };

  return {
    startMonitoring,
    stopMonitoring,
    getCurrentMetrics,
    isPerformanceAcceptable,
  };
};

export default performanceMonitor;