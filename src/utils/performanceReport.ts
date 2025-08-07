/**
 * Performance Report Generator
 * 
 * Generates comprehensive performance reports with benchmarks,
 * recommendations, and optimization tracking.
 */

import { frameScheduler } from './frameThrottling';
import { performanceMonitor } from './animationOptimizations';

export interface PerformanceMetrics {
  fps: {
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    below60Count: number;
    below30Count: number;
  };
  frameTime: {
    average: number;
    max: number;
    p95: number;
    p99: number;
  };
  scheduler: {
    queueLength: number;
    adaptiveThreshold: number;
    averageFrameTime: number;
    estimatedFPS: number;
  };
  memory?: {
    usedJSSize: number;
    totalJSSize: number;
    limit: number;
    efficiency: number;
  };
  paint?: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
  interactions?: {
    firstInputDelay: number;
    interactionToNextPaint: number;
  };
}

export interface PerformanceRecommendation {
  category: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

export interface PerformanceReport {
  timestamp: string;
  testDuration: number;
  metrics: PerformanceMetrics;
  recommendations: PerformanceRecommendation[];
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  score: number;
  summary: string;
}

export class PerformanceAnalyzer {
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private startTime: number = 0;
  private isCollecting: boolean = false;

  startCollection(): void {
    this.isCollecting = true;
    this.startTime = performance.now();
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    
    // Start frame monitoring
    performanceMonitor.startMonitoring();
    
    // Collect data every 100ms
    this.collectData();
  }

  stopCollection(): PerformanceReport {
    this.isCollecting = false;
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    // Stop frame monitoring and get final metrics
    const monitorMetrics = performanceMonitor.stopMonitoring();
    
    // Calculate comprehensive metrics
    const metrics = this.calculateMetrics(monitorMetrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics);
    
    // Calculate grade and score
    const { grade, score } = this.calculateGrade(metrics);
    
    // Generate summary
    const summary = this.generateSummary(metrics, grade);

    return {
      timestamp: new Date().toISOString(),
      testDuration: duration,
      metrics,
      recommendations,
      grade,
      score,
      summary,
    };
  }

  private collectData = (): void => {
    if (!this.isCollecting) return;

    const schedulerStats = frameScheduler.getStats();
    this.fpsHistory.push(schedulerStats.estimatedFPS);
    this.frameTimeHistory.push(schedulerStats.averageFrameTime);

    setTimeout(this.collectData, 100);
  };

  private calculateMetrics(monitorMetrics: any): PerformanceMetrics {
    const sortedFPS = [...this.fpsHistory].sort((a, b) => a - b);
    const sortedFrameTime = [...this.frameTimeHistory].sort((a, b) => a - b);

    const fpsMetrics = {
      average: this.average(this.fpsHistory),
      min: Math.min(...this.fpsHistory),
      max: Math.max(...this.fpsHistory),
      p95: this.percentile(sortedFPS, 95),
      p99: this.percentile(sortedFPS, 99),
      below60Count: this.fpsHistory.filter(fps => fps < 60).length,
      below30Count: this.fpsHistory.filter(fps => fps < 30).length,
    };

    const frameTimeMetrics = {
      average: this.average(this.frameTimeHistory),
      max: Math.max(...this.frameTimeHistory),
      p95: this.percentile(sortedFrameTime, 95),
      p99: this.percentile(sortedFrameTime, 99),
    };

    const schedulerStats = frameScheduler.getStats();

    let memoryMetrics;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryMetrics = {
        usedJSSize: memory.usedJSHeapSize,
        totalJSSize: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        efficiency: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }

    // Get Web Vitals if available
    let paintMetrics;
    let interactionMetrics;
    
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      if (paintEntries.length > 0) {
        paintMetrics = {
          firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0, // Would need LCP observer
          cumulativeLayoutShift: 0, // Would need CLS observer
        };
      }
    }

    return {
      fps: fpsMetrics,
      frameTime: frameTimeMetrics,
      scheduler: schedulerStats,
      memory: memoryMetrics,
      paint: paintMetrics,
      interactions: interactionMetrics,
    };
  }

  private generateRecommendations(metrics: PerformanceMetrics): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // FPS-based recommendations
    if (metrics.fps.average < 55) {
      recommendations.push({
        category: 'critical',
        title: 'Low Average FPS',
        description: `Average FPS is ${metrics.fps.average.toFixed(1)}, below the 60fps target`,
        impact: 'high',
        effort: 'medium',
        implementation: 'Optimize animations, reduce paint operations, enable hardware acceleration',
      });
    }

    if (metrics.fps.below30Count > 0) {
      recommendations.push({
        category: 'critical',
        title: 'Frame Drops Below 30 FPS',
        description: `${metrics.fps.below30Count} frames dropped below 30 FPS`,
        impact: 'high',
        effort: 'high',
        implementation: 'Identify and optimize expensive operations, implement frame budgeting',
      });
    }

    // Frame time recommendations
    if (metrics.frameTime.p95 > 16.67) {
      recommendations.push({
        category: 'warning',
        title: 'High 95th Percentile Frame Time',
        description: `95% of frames take longer than ${metrics.frameTime.p95.toFixed(1)}ms`,
        impact: 'medium',
        effort: 'medium',
        implementation: 'Optimize slow operations, implement throttling for non-critical tasks',
      });
    }

    // Memory recommendations
    if (metrics.memory && metrics.memory.efficiency > 80) {
      recommendations.push({
        category: 'warning',
        title: 'High Memory Usage',
        description: `Memory efficiency is ${metrics.memory.efficiency.toFixed(1)}%`,
        impact: 'medium',
        effort: 'medium',
        implementation: 'Implement memory cleanup, optimize data structures, reduce memory leaks',
      });
    }

    // Scheduler recommendations
    if (metrics.scheduler.queueLength > 10) {
      recommendations.push({
        category: 'warning',
        title: 'High Scheduler Queue Length',
        description: `Scheduler queue has ${metrics.scheduler.queueLength} pending tasks`,
        impact: 'medium',
        effort: 'low',
        implementation: 'Increase frame budget, prioritize critical tasks, reduce scheduled work',
      });
    }

    // Paint recommendations
    if (metrics.paint && metrics.paint.firstContentfulPaint > 1500) {
      recommendations.push({
        category: 'warning',
        title: 'Slow First Contentful Paint',
        description: `FCP is ${metrics.paint.firstContentfulPaint}ms, should be under 1500ms`,
        impact: 'high',
        effort: 'medium',
        implementation: 'Optimize critical rendering path, reduce blocking resources',
      });
    }

    // Positive recommendations
    if (metrics.fps.average >= 58 && metrics.frameTime.average <= 12) {
      recommendations.push({
        category: 'info',
        title: 'Excellent Performance',
        description: 'Animations are running smoothly at near-60fps',
        impact: 'low',
        effort: 'low',
        implementation: 'Continue current optimization practices',
      });
    }

    return recommendations;
  }

  private calculateGrade(metrics: PerformanceMetrics): { grade: PerformanceReport['grade']; score: number } {
    let score = 100;

    // FPS penalties
    if (metrics.fps.average < 58) score -= 15;
    if (metrics.fps.average < 50) score -= 20;
    if (metrics.fps.average < 40) score -= 30;
    if (metrics.fps.below30Count > 0) score -= 25;

    // Frame time penalties
    if (metrics.frameTime.p95 > 16.67) score -= 10;
    if (metrics.frameTime.p99 > 33.33) score -= 15;

    // Memory penalties
    if (metrics.memory && metrics.memory.efficiency > 80) score -= 5;
    if (metrics.memory && metrics.memory.efficiency > 90) score -= 10;

    // Scheduler penalties
    if (metrics.scheduler.queueLength > 5) score -= 5;
    if (metrics.scheduler.queueLength > 15) score -= 10;

    // Determine grade
    let grade: PerformanceReport['grade'];
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 85) grade = 'B+';
    else if (score >= 80) grade = 'B';
    else if (score >= 75) grade = 'C+';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { grade, score: Math.max(0, score) };
  }

  private generateSummary(metrics: PerformanceMetrics, grade: PerformanceReport['grade']): string {
    const avgFPS = metrics.fps.average.toFixed(1);
    const avgFrameTime = metrics.frameTime.average.toFixed(1);
    
    if (grade === 'A+' || grade === 'A') {
      return `Excellent performance! Animations are running at ${avgFPS} FPS with smooth ${avgFrameTime}ms frame times. No significant optimizations needed.`;
    } else if (grade === 'B+' || grade === 'B') {
      return `Good performance with ${avgFPS} FPS average. Some minor optimizations could improve consistency and reduce frame time variance.`;
    } else if (grade === 'C+' || grade === 'C') {
      return `Moderate performance at ${avgFPS} FPS. Noticeable improvements needed to reach 60fps target. Focus on reducing frame times and optimizing animations.`;
    } else {
      return `Poor performance at ${avgFPS} FPS with ${avgFrameTime}ms frame times. Significant optimizations required to achieve smooth animations.`;
    }
  }

  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private percentile(sortedNumbers: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.max(0, Math.min(index, sortedNumbers.length - 1))];
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();

/**
 * Generate a quick performance snapshot
 */
export function generateQuickReport(): Promise<PerformanceReport> {
  return new Promise((resolve) => {
    performanceAnalyzer.startCollection();
    
    // Collect data for 5 seconds
    setTimeout(() => {
      const report = performanceAnalyzer.stopCollection();
      resolve(report);
    }, 5000);
  });
}

/**
 * Format performance report for console output
 */
export function formatReportForConsole(report: PerformanceReport): string {
  const lines = [
    '🚀 ANIMATION PERFORMANCE REPORT',
    '═'.repeat(50),
    `📊 Overall Grade: ${report.grade} (${report.score}/100)`,
    `⏱️  Test Duration: ${(report.testDuration / 1000).toFixed(1)}s`,
    '',
    '📈 METRICS:',
    `   FPS: ${report.metrics.fps.average.toFixed(1)} avg (${report.metrics.fps.min}-${report.metrics.fps.max})`,
    `   Frame Time: ${report.metrics.frameTime.average.toFixed(1)}ms avg`,
    `   Dropped Frames: ${report.metrics.fps.below60Count} (<60fps), ${report.metrics.fps.below30Count} (<30fps)`,
    `   Queue Length: ${report.metrics.scheduler.queueLength}`,
  ];

  if (report.metrics.memory) {
    lines.push(`   Memory: ${(report.metrics.memory.usedJSSize / 1024 / 1024).toFixed(1)}MB used`);
  }

  lines.push('');
  lines.push('🔧 RECOMMENDATIONS:');
  
  report.recommendations.forEach((rec, index) => {
    const icon = rec.category === 'critical' ? '🚨' : rec.category === 'warning' ? '⚠️' : '💡';
    lines.push(`   ${icon} ${rec.title} (${rec.impact} impact)`);
    lines.push(`      ${rec.description}`);
  });

  lines.push('');
  lines.push(`📝 SUMMARY: ${report.summary}`);
  lines.push('═'.repeat(50));

  return lines.join('\n');
}

/**
 * Export report data for analysis
 */
export function exportReportData(report: PerformanceReport): string {
  return JSON.stringify(report, null, 2);
}