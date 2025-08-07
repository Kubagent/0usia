/**
 * Performance Optimization Initialization
 * 
 * Centralized initialization for all animation performance optimizations.
 * Call this once at app startup to enable all optimizations.
 */

import { initializeAnimationOptimizations, WillChangeManager } from './animationOptimizations';
import { generateQuickReport, formatReportForConsole, performanceAnalyzer } from './performanceReport';

export interface PerformanceConfig {
  enableWillChangeManagement: boolean;
  enableFrameScheduling: boolean;
  enablePerformanceReporting: boolean;
  enableDevelopmentMonitoring: boolean;
  logInitialization: boolean;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableWillChangeManagement: true,
  enableFrameScheduling: true,
  enablePerformanceReporting: process.env.NODE_ENV === 'development',
  enableDevelopmentMonitoring: process.env.NODE_ENV === 'development',
  logInitialization: process.env.NODE_ENV === 'development',
};

/**
 * Initialize all performance optimizations
 */
export function initializePerformance(config: Partial<PerformanceConfig> = {}): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (typeof window === 'undefined') {
    console.warn('Performance optimizations can only be initialized in browser environment');
    return;
  }

  const startTime = performance.now();

  try {
    // Initialize animation optimizations
    if (finalConfig.enableWillChangeManagement || finalConfig.enableFrameScheduling) {
      initializeAnimationOptimizations();
      
      if (finalConfig.logInitialization) {
        console.log('✅ Animation optimizations initialized');
      }
    }

    // Initialize will-change management observer
    if (finalConfig.enableWillChangeManagement) {
      WillChangeManager.initializeObserver();
      
      if (finalConfig.logInitialization) {
        console.log('✅ Will-change management initialized');
      }
    }

    // Setup performance reporting
    if (finalConfig.enablePerformanceReporting) {
      setupPerformanceReporting();
      
      if (finalConfig.logInitialization) {
        console.log('✅ Performance reporting initialized');
      }
    }

    // Setup development monitoring
    if (finalConfig.enableDevelopmentMonitoring) {
      setupDevelopmentMonitoring();
      
      if (finalConfig.logInitialization) {
        console.log('✅ Development monitoring initialized');
      }
    }

    // Log overall initialization time
    const initTime = performance.now() - startTime;
    if (finalConfig.logInitialization) {
      console.log(`🚀 Performance optimizations initialized in ${initTime.toFixed(2)}ms`);
      console.log('📊 Available global commands:');
      console.log('   - window.__generatePerformanceReport()');
      console.log('   - window.__startPerformanceAnalysis()');
      console.log('   - window.__stopPerformanceAnalysis()');
    }

  } catch (error) {
    console.error('❌ Failed to initialize performance optimizations:', error);
  }
}

/**
 * Setup performance reporting utilities
 */
function setupPerformanceReporting(): void {
  // Global performance report generator
  (window as any).__generatePerformanceReport = async () => {
    console.log('📊 Generating performance report...');
    try {
      const report = await generateQuickReport();
      console.log(formatReportForConsole(report));
      return report;
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    }
  };

  // Global performance analysis controls
  (window as any).__startPerformanceAnalysis = () => {
    console.log('🎯 Starting performance analysis...');
    performanceAnalyzer.startCollection();
  };

  (window as any).__stopPerformanceAnalysis = () => {
    console.log('📈 Stopping performance analysis...');
    const report = performanceAnalyzer.stopCollection();
    console.log(formatReportForConsole(report));
    return report;
  };
}

/**
 * Setup development monitoring
 */
function setupDevelopmentMonitoring(): void {
  // Monitor for dropped frames
  let lastFrameTime = performance.now();
  let droppedFrameCount = 0;

  const checkFrameRate = () => {
    const currentTime = performance.now();
    const frameTime = currentTime - lastFrameTime;
    
    // If frame time > 20ms, consider it a dropped frame
    if (frameTime > 20) {
      droppedFrameCount++;
      if (droppedFrameCount % 10 === 0) {
        console.warn(`⚠️ ${droppedFrameCount} dropped frames detected. Frame time: ${frameTime.toFixed(2)}ms`);
      }
    }
    
    lastFrameTime = currentTime;
    requestAnimationFrame(checkFrameRate);
  };

  requestAnimationFrame(checkFrameRate);

  // Monitor memory usage
  if ('memory' in performance) {
    const checkMemoryUsage = () => {
      const memory = (performance as any).memory;
      const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
      const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
      const efficiency = ((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100).toFixed(1);
      
      if (parseFloat(efficiency) > 85) {
        console.warn(`⚠️ High memory usage: ${usedMB}MB/${totalMB}MB (${efficiency}%)`);
      }
    };

    setInterval(checkMemoryUsage, 10000); // Check every 10 seconds
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.log('Long task monitoring not available in this browser');
    }
  }
}

/**
 * Get current performance status
 */
export function getPerformanceStatus(): {
  isOptimized: boolean;
  activeOptimizations: string[];
  recommendations: string[];
} {
  const activeOptimizations: string[] = [];
  const recommendations: string[] = [];

  // Check if optimizations are active
  if (document.querySelector('.animate-gpu')) {
    activeOptimizations.push('GPU acceleration');
  } else {
    recommendations.push('Enable GPU acceleration classes');
  }

  if ((window as any).__generatePerformanceReport) {
    activeOptimizations.push('Performance reporting');
  }

  const isOptimized = activeOptimizations.length >= 2;

  return {
    isOptimized,
    activeOptimizations,
    recommendations,
  };
}

/**
 * Cleanup performance optimizations (for hot reload)
 */
export function cleanupPerformance(): void {
  // Remove global functions
  delete (window as any).__generatePerformanceReport;
  delete (window as any).__startPerformanceAnalysis;
  delete (window as any).__stopPerformanceAnalysis;
  
  console.log('🧹 Performance optimizations cleaned up');
}