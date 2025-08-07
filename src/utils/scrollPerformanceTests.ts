/**
 * Scroll Performance Test Suite
 * Measures Core Web Vitals and scroll-specific performance metrics
 */

interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  value: number;
  threshold: number;
  unit: string;
  timestamp: number;
}

interface ScrollPerformanceBenchmarks {
  // Core Web Vitals
  FCP: number; // First Contentful Paint < 1.8s
  LCP: number; // Largest Contentful Paint < 2.5s
  FID: number; // First Input Delay < 100ms
  CLS: number; // Cumulative Layout Shift < 0.1
  
  // Scroll-specific metrics
  scrollLatency: number; // < 100ms
  frameRate: number; // > 55fps
  memoryUsage: number; // < 50MB
  scrollEventFrequency: number; // < 60/s
  velocityCalculationTime: number; // < 1ms
}

class ScrollPerformanceTester {
  private results: PerformanceTestResult[] = [];
  private observer: PerformanceObserver | null = null;
  private startTime: number = 0;
  
  // Performance thresholds (Google recommendations + custom scroll metrics)
  private readonly THRESHOLDS: ScrollPerformanceBenchmarks = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    FID: 100,  // 100ms
    CLS: 0.1,  // 0.1
    scrollLatency: 100, // 100ms
    frameRate: 55, // 55fps
    memoryUsage: 50 * 1024 * 1024, // 50MB in bytes
    scrollEventFrequency: 60, // 60 events/second
    velocityCalculationTime: 1 // 1ms
  };

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Test Core Web Vitals using Performance Observer API
   */
  async testCoreWebVitals(): Promise<PerformanceTestResult[]> {
    return new Promise((resolve) => {
      const results: PerformanceTestResult[] = [];
      let completedTests = 0;
      const totalTests = 4; // FCP, LCP, FID, CLS

      if (!('PerformanceObserver' in window)) {
        console.warn('PerformanceObserver not supported');
        resolve([]);
        return;
      }

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          results.push({
            testName: 'First Contentful Paint (FCP)',
            passed: fcpEntry.startTime < this.THRESHOLDS.FCP,
            value: fcpEntry.startTime,
            threshold: this.THRESHOLDS.FCP,
            unit: 'ms',
            timestamp: performance.now()
          });
          fcpObserver.disconnect();
          completedTests++;
          if (completedTests === totalTests) resolve(results);
        }
      });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          results.push({
            testName: 'Largest Contentful Paint (LCP)',
            passed: lastEntry.startTime < this.THRESHOLDS.LCP,
            value: lastEntry.startTime,
            threshold: this.THRESHOLDS.LCP,
            unit: 'ms',
            timestamp: performance.now()
          });
          lcpObserver.disconnect();
          completedTests++;
          if (completedTests === totalTests) resolve(results);
        }
      });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0];
        if (fidEntry) {
          const fid = (fidEntry as any).processingStart - fidEntry.startTime;
          results.push({
            testName: 'First Input Delay (FID)',
            passed: fid < this.THRESHOLDS.FID,
            value: fid,
            threshold: this.THRESHOLDS.FID,
            unit: 'ms',
            timestamp: performance.now()
          });
          fidObserver.disconnect();
          completedTests++;
          if (completedTests === totalTests) resolve(results);
        }
      });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });

      try {
        fcpObserver.observe({ type: 'paint', buffered: true });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        fidObserver.observe({ type: 'first-input', buffered: true });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('Some performance observers not supported', e);
      }

      // CLS measurement after 5 seconds
      setTimeout(() => {
        results.push({
          testName: 'Cumulative Layout Shift (CLS)',
          passed: clsValue < this.THRESHOLDS.CLS,
          value: clsValue,
          threshold: this.THRESHOLDS.CLS,
          unit: 'score',
          timestamp: performance.now()
        });
        clsObserver.disconnect();
        completedTests++;
        if (completedTests === totalTests) resolve(results);
      }, 5000);
    });
  }

  /**
   * Test scroll-specific performance metrics
   */
  testScrollPerformance(): PerformanceTestResult[] {
    const results: PerformanceTestResult[] = [];

    // Test FPS
    const fps = this.measureFPS();
    results.push({
      testName: 'Scroll Frame Rate',
      passed: fps >= this.THRESHOLDS.frameRate,
      value: fps,
      threshold: this.THRESHOLDS.frameRate,
      unit: 'fps',
      timestamp: performance.now()
    });

    // Test scroll latency
    const latency = this.measureScrollLatency();
    results.push({
      testName: 'Scroll Input Latency',
      passed: latency <= this.THRESHOLDS.scrollLatency,
      value: latency,
      threshold: this.THRESHOLDS.scrollLatency,
      unit: 'ms',
      timestamp: performance.now()
    });

    // Test memory usage
    const memoryUsage = this.measureMemoryUsage();
    results.push({
      testName: 'Scroll System Memory Usage',
      passed: memoryUsage <= this.THRESHOLDS.memoryUsage,
      value: memoryUsage / (1024 * 1024), // Convert to MB for display
      threshold: this.THRESHOLDS.memoryUsage / (1024 * 1024),
      unit: 'MB',
      timestamp: performance.now()
    });

    // Test velocity calculation performance
    const velocityTime = this.benchmarkVelocityCalculation();
    results.push({
      testName: 'Velocity Calculation Time',
      passed: velocityTime <= this.THRESHOLDS.velocityCalculationTime,
      value: velocityTime,
      threshold: this.THRESHOLDS.velocityCalculationTime,
      unit: 'ms',
      timestamp: performance.now()
    });

    return results;
  }

  /**
   * Measure current FPS using RAF
   */
  private measureFPS(): number {
    let frameCount = 0;
    let startTime = performance.now();
    let fps = 0;

    const frame = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        return;
      }
      
      if (elapsed < 2000) { // Measure for 2 seconds max
        requestAnimationFrame(frame);
      }
    };

    frame();
    return fps;
  }

  /**
   * Measure scroll input latency
   */
  private measureScrollLatency(): number {
    // Simulate scroll event and measure processing time
    const startTime = performance.now();
    
    // Simulate typical scroll processing
    const sections = document.querySelectorAll('.snap-section');
    const scrollY = window.scrollY;
    
    // Simulate section detection logic
    let currentSection = 0;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      if (Math.abs(section.offsetTop - scrollY) < 50) {
        currentSection = i;
        break;
      }
    }
    
    return performance.now() - startTime;
  }

  /**
   * Measure memory usage of performance monitoring
   */
  private measureMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    
    // Fallback: estimate based on DOM elements and event listeners
    const sections = document.querySelectorAll('.snap-section').length;
    const estimatedUsage = sections * 1024 * 100; // Rough estimate: 100KB per section
    return estimatedUsage;
  }

  /**
   * Benchmark velocity calculation performance
   */
  private benchmarkVelocityCalculation(): number {
    const iterations = 1000;
    const deltaYValues = Array.from({ length: iterations }, () => Math.random() * 100);
    const timestamps = Array.from({ length: iterations }, (_, i) => performance.now() + i);
    
    const startTime = performance.now();
    
    // Simulate velocity calculations
    const velocityBuffer: number[] = [];
    const SMOOTHING_FACTOR = 0.3;
    let lastTime = timestamps[0];
    
    for (let i = 1; i < iterations; i++) {
      const deltaY = deltaYValues[i];
      const timestamp = timestamps[i];
      
      // Velocity calculation (same as in usePerformantSectionSnap)
      const velocity = deltaY / Math.max(timestamp - lastTime, 1);
      velocityBuffer.push(velocity);
      
      if (velocityBuffer.length > 5) {
        velocityBuffer.shift();
      }
      
      // Exponentially smoothed average
      const smoothedVelocity = velocityBuffer.reduce((acc, v, idx) => {
        const weight = Math.pow(SMOOTHING_FACTOR, velocityBuffer.length - 1 - idx);
        return acc + v * weight;
      }, 0) / velocityBuffer.reduce((acc, _, idx) => {
        return acc + Math.pow(SMOOTHING_FACTOR, velocityBuffer.length - 1 - idx);
      }, 0);
      
      lastTime = timestamp;
    }
    
    const totalTime = performance.now() - startTime;
    return totalTime / iterations; // Average time per calculation
  }

  /**
   * Run comprehensive performance test suite
   */
  async runFullTestSuite(): Promise<{
    passed: number;
    failed: number;
    results: PerformanceTestResult[];
    overallScore: number;
  }> {
    const results: PerformanceTestResult[] = [];
    
    // Run Core Web Vitals tests
    const coreWebVitalsResults = await this.testCoreWebVitals();
    results.push(...coreWebVitalsResults);
    
    // Run scroll performance tests
    const scrollResults = this.testScrollPerformance();
    results.push(...scrollResults);
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const overallScore = Math.round((passed / results.length) * 100);
    
    // Store results
    this.results = results;
    
    return {
      passed,
      failed,
      results,
      overallScore
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No test results available. Run tests first.';
    }

    let report = '🚀 SCROLL PERFORMANCE TEST REPORT\n';
    report += '═══════════════════════════════════\n\n';
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const score = Math.round((passed / this.results.length) * 100);
    
    report += `Overall Score: ${score}% (${passed}/${this.results.length} tests passed)\n\n`;
    
    // Group results by category
    const coreWebVitals = this.results.filter(r => 
      r.testName.includes('FCP') || r.testName.includes('LCP') || 
      r.testName.includes('FID') || r.testName.includes('CLS')
    );
    
    const scrollMetrics = this.results.filter(r => 
      !coreWebVitals.includes(r)
    );
    
    // Core Web Vitals section
    report += '📊 CORE WEB VITALS\n';
    report += '──────────────────\n';
    coreWebVitals.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      report += `${status} ${result.testName}: ${result.value.toFixed(2)}${result.unit} (threshold: ${result.threshold}${result.unit})\n`;
    });
    
    // Scroll Performance section
    report += '\n🎯 SCROLL PERFORMANCE\n';
    report += '────────────────────\n';
    scrollMetrics.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      report += `${status} ${result.testName}: ${result.value.toFixed(2)}${result.unit} (threshold: ${result.threshold}${result.unit})\n`;
    });
    
    // Recommendations
    report += '\n💡 RECOMMENDATIONS\n';
    report += '─────────────────\n';
    
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length === 0) {
      report += '🎉 All tests passed! Your scroll performance is excellent.\n';
    } else {
      failedTests.forEach(test => {
        report += `• ${test.testName}: `;
        if (test.testName.includes('FCP')) {
          report += 'Optimize critical rendering path, reduce JavaScript execution time.\n';
        } else if (test.testName.includes('LCP')) {
          report += 'Optimize largest content element, preload critical resources.\n';
        } else if (test.testName.includes('FID')) {
          report += 'Reduce JavaScript execution time, optimize event handlers.\n';
        } else if (test.testName.includes('CLS')) {
          report += 'Add explicit dimensions to images, avoid DOM insertions.\n';
        } else if (test.testName.includes('Frame Rate')) {
          report += 'Optimize scroll animations, reduce DOM manipulation.\n';
        } else if (test.testName.includes('Latency')) {
          report += 'Optimize scroll event handlers, use passive listeners.\n';
        } else if (test.testName.includes('Memory')) {
          report += 'Optimize event listener cleanup, reduce memory allocations.\n';
        } else if (test.testName.includes('Velocity')) {
          report += 'Optimize velocity calculation algorithm, use web workers.\n';
        }
      });
    }
    
    return report;
  }
}

// Export singleton instance
export const scrollPerformanceTester = new ScrollPerformanceTester();

// Utility function to run tests and log results
export async function runScrollPerformanceTests(): Promise<void> {
  console.log('🚀 Starting scroll performance tests...');
  
  try {
    const results = await scrollPerformanceTester.runFullTestSuite();
    console.log(scrollPerformanceTester.generateReport());
    
    // Also expose results globally for debugging
    (window as any).__scrollTestResults = results;
  } catch (error) {
    console.error('Performance testing failed:', error);
  }
}