/**
 * Performance monitoring utilities for animation optimization
 * 
 * Provides tools to measure and optimize animation performance,
 * particularly useful for scroll-based animations and complex transitions.
 */

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  totalFrames: number;
  startTime: number;
  duration: number;
}

/**
 * Frame performance tracker for monitoring animation smoothness
 */
class FramePerformanceTracker {
  private frames: number[] = [];
  private startTime: number = 0;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private isTracking: boolean = false;
  private onUpdate?: (metrics: PerformanceMetrics) => void;

  /**
   * Start tracking frame performance
   */
  start(onUpdate?: (metrics: PerformanceMetrics) => void): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.frames = [this.startTime];
    this.onUpdate = onUpdate;

    this.trackFrame();
  }

  /**
   * Stop tracking and return final metrics
   */
  stop(): PerformanceMetrics {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isTracking = false;
    return this.getMetrics();
  }

  /**
   * Track individual frame performance
   */
  private trackFrame = (): void => {
    if (!this.isTracking) return;

    const currentTime = performance.now();
    this.frames.push(currentTime);

    // Update metrics if callback provided
    if (this.onUpdate) {
      this.onUpdate(this.getMetrics());
    }

    this.lastFrameTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.trackFrame);
  };

  /**
   * Calculate current performance metrics
   */
  private getMetrics(): PerformanceMetrics {
    if (this.frames.length < 2) {
      return {
        fps: 0,
        frameTime: 0,
        droppedFrames: 0,
        totalFrames: 0,
        startTime: this.startTime,
        duration: 0,
      };
    }

    const duration = this.lastFrameTime - this.startTime;
    const totalFrames = this.frames.length - 1;
    
    // Calculate frame times
    const frameTimes = [];
    for (let i = 1; i < this.frames.length; i++) {
      frameTimes.push(this.frames[i] - this.frames[i - 1]);
    }

    const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const fps = 1000 / averageFrameTime;
    
    // Count dropped frames (frames taking longer than 16.67ms for 60fps)
    const droppedFrames = frameTimes.filter(time => time > 16.67).length;

    return {
      fps: Math.round(fps * 100) / 100,
      frameTime: Math.round(averageFrameTime * 100) / 100,
      droppedFrames,
      totalFrames,
      startTime: this.startTime,
      duration: Math.round(duration),
    };
  }
}

/**
 * Scroll performance monitor for tracking scroll-based animations
 */
export class ScrollPerformanceMonitor {
  private tracker = new FramePerformanceTracker();
  private scrollStartTime: number = 0;
  private scrollEndTimeout: number | null = null;
  private isMonitoring: boolean = false;

  /**
   * Start monitoring scroll performance
   */
  startMonitoring(onUpdate?: (metrics: PerformanceMetrics) => void): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.scrollStartTime = performance.now();

    // Start frame tracking
    this.tracker.start(onUpdate);

    // Add scroll listener to detect scroll end
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  /**
   * Stop monitoring and return metrics
   */
  stopMonitoring(): PerformanceMetrics {
    this.isMonitoring = false;
    
    window.removeEventListener('scroll', this.handleScroll);
    
    if (this.scrollEndTimeout) {
      clearTimeout(this.scrollEndTimeout);
      this.scrollEndTimeout = null;
    }

    return this.tracker.stop();
  }

  /**
   * Handle scroll events to detect scroll end
   */
  private handleScroll = (): void => {
    // Clear existing timeout
    if (this.scrollEndTimeout) {
      clearTimeout(this.scrollEndTimeout);
    }

    // Set new timeout to detect scroll end
    this.scrollEndTimeout = window.setTimeout(() => {
      if (this.isMonitoring) {
        const metrics = this.stopMonitoring();
        console.log('Scroll Performance Metrics:', metrics);
      }
    }, 150); // 150ms of no scroll = scroll ended
  };
}

/**
 * Animation performance monitor for specific animations
 */
export class AnimationPerformanceMonitor {
  private tracker = new FramePerformanceTracker();
  
  /**
   * Monitor a specific animation
   */
  async monitorAnimation<T>(
    animationPromise: Promise<T>,
    name: string = 'Animation'
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    console.log(`Starting performance monitoring for: ${name}`);
    
    this.tracker.start((metrics) => {
      // Optional: Log real-time metrics during development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${name} - FPS: ${metrics.fps}, Frame Time: ${metrics.frameTime}ms`);
      }
    });

    try {
      const result = await animationPromise;
      const metrics = this.tracker.stop();
      
      console.log(`${name} Performance Metrics:`, {
        ...metrics,
        quality: this.getPerformanceQuality(metrics),
      });

      return { result, metrics };
    } catch (error) {
      this.tracker.stop();
      throw error;
    }
  }

  /**
   * Determine performance quality based on metrics
   */
  private getPerformanceQuality(metrics: PerformanceMetrics): string {
    if (metrics.fps >= 55 && metrics.droppedFrames / metrics.totalFrames < 0.05) {
      return 'Excellent';
    } else if (metrics.fps >= 45 && metrics.droppedFrames / metrics.totalFrames < 0.1) {
      return 'Good';
    } else if (metrics.fps >= 30 && metrics.droppedFrames / metrics.totalFrames < 0.2) {
      return 'Fair';
    } else {
      return 'Poor';
    }
  }
}

/**
 * Global performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Monitor scroll performance for a duration
   */
  monitorScrollPerformance(durationMs: number = 5000): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      const monitor = new ScrollPerformanceMonitor();
      
      monitor.startMonitoring();
      
      setTimeout(() => {
        const metrics = monitor.stopMonitoring();
        resolve(metrics);
      }, durationMs);
    });
  },

  /**
   * Create a performance budget checker
   */
  createPerformanceBudget(targetFps: number = 60, maxDroppedFrameRatio: number = 0.05) {
    return {
      check(metrics: PerformanceMetrics): boolean {
        const droppedFrameRatio = metrics.droppedFrames / metrics.totalFrames;
        return metrics.fps >= targetFps && droppedFrameRatio <= maxDroppedFrameRatio;
      },
      
      getReport(metrics: PerformanceMetrics): string {
        const droppedFrameRatio = metrics.droppedFrames / metrics.totalFrames;
        const fpsStatus = metrics.fps >= targetFps ? '✅' : '❌';
        const droppedFrameStatus = droppedFrameRatio <= maxDroppedFrameRatio ? '✅' : '❌';
        
        return `
Performance Budget Report:
${fpsStatus} FPS: ${metrics.fps} (target: ${targetFps})
${droppedFrameStatus} Dropped Frame Ratio: ${(droppedFrameRatio * 100).toFixed(2)}% (target: <${maxDroppedFrameRatio * 100}%)
Total Frames: ${metrics.totalFrames}
Duration: ${metrics.duration}ms
        `.trim();
      }
    };
  },

  /**
   * Simple frame rate counter for development
   */
  createFpsCounter(): { start: () => void; stop: () => number } {
    let frameCount = 0;
    let startTime = 0;
    let animationId: number;

    const count = () => {
      frameCount++;
      animationId = requestAnimationFrame(count);
    };

    return {
      start() {
        frameCount = 0;
        startTime = performance.now();
        animationId = requestAnimationFrame(count);
      },
      
      stop(): number {
        cancelAnimationFrame(animationId);
        const duration = performance.now() - startTime;
        return Math.round((frameCount * 1000) / duration);
      }
    };
  }
};

export default {
  ScrollPerformanceMonitor,
  AnimationPerformanceMonitor,
  performanceUtils,
};