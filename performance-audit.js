/**
 * Performance Audit Script for Ovsia V4 Scroll System
 * 
 * Run this in Chrome DevTools Console to analyze scroll performance
 * Measures FPS, scroll responsiveness, and section transition smoothness
 */

class ScrollPerformanceAuditor {
  constructor() {
    this.metrics = {
      fps: [],
      scrollLatency: [],
      sectionTransitions: [],
      memoryUsage: [],
      cpuUsage: []
    };
    
    this.isRecording = false;
    this.startTime = 0;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  startAudit() {
    console.log('🚀 Starting Ovsia V4 Scroll Performance Audit...');
    this.isRecording = true;
    this.startTime = performance.now();
    
    this.setupFPSMonitoring();
    this.setupScrollLatencyMonitoring();
    this.setupMemoryMonitoring();
    this.setupSectionTransitionMonitoring();
    
    console.log('📊 Recording for 30 seconds. Please scroll through all sections...');
    
    // Auto-stop after 30 seconds
    setTimeout(() => {
      this.stopAudit();
    }, 30000);
  }

  setupFPSMonitoring() {
    const measureFPS = () => {
      if (!this.isRecording) return;
      
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      const fps = 1000 / delta;
      
      this.metrics.fps.push({
        timestamp: now - this.startTime,
        fps: fps,
        delta: delta
      });
      
      this.frameCount++;
      this.lastFrameTime = now;
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }

  setupScrollLatencyMonitoring() {
    let scrollStartTime = 0;
    
    const handleScrollStart = () => {
      scrollStartTime = performance.now();
    };
    
    const handleScroll = () => {
      if (scrollStartTime > 0) {
        const latency = performance.now() - scrollStartTime;
        this.metrics.scrollLatency.push({
          timestamp: performance.now() - this.startTime,
          latency: latency
        });
        scrollStartTime = 0;
      }
    };
    
    // Use pointer events to detect scroll initiation
    document.addEventListener('wheel', handleScrollStart, { passive: true });
    document.addEventListener('touchstart', handleScrollStart, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
  }

  setupMemoryMonitoring() {
    const measureMemory = () => {
      if (!this.isRecording) return;
      
      if (performance.memory) {
        this.metrics.memoryUsage.push({
          timestamp: performance.now() - this.startTime,
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        });
      }
      
      setTimeout(measureMemory, 1000); // Check every second
    };
    
    measureMemory();
  }

  setupSectionTransitionMonitoring() {
    // Monitor section changes via scroll container
    const scrollContainer = document.querySelector('.optimized-scroll-container');
    if (!scrollContainer) {
      console.warn('⚠️ Scroll container not found');
      return;
    }

    let lastSection = 0;
    let transitionStartTime = 0;

    const checkSectionChange = () => {
      if (!this.isRecording) return;

      const scrollTop = scrollContainer.scrollTop;
      const windowHeight = window.innerHeight;
      const currentSection = Math.round(scrollTop / windowHeight);

      if (currentSection !== lastSection) {
        if (transitionStartTime > 0) {
          // Transition completed
          const duration = performance.now() - transitionStartTime;
          this.metrics.sectionTransitions.push({
            timestamp: performance.now() - this.startTime,
            fromSection: lastSection,
            toSection: currentSection,
            duration: duration
          });
        }
        
        lastSection = currentSection;
        transitionStartTime = performance.now();
      }

      setTimeout(checkSectionChange, 16); // Check at 60fps
    };

    checkSectionChange();
  }

  stopAudit() {
    this.isRecording = false;
    console.log('⏹️ Stopping performance audit...');
    
    setTimeout(() => {
      this.generateReport();
    }, 500);
  }

  generateReport() {
    const report = {
      duration: performance.now() - this.startTime,
      frameCount: this.frameCount,
      metrics: this.processMetrics()
    };

    console.log('📋 OVSIA V4 SCROLL PERFORMANCE REPORT');
    console.log('=====================================');
    
    this.logFPSAnalysis(report.metrics.fps);
    this.logScrollLatencyAnalysis(report.metrics.scrollLatency);
    this.logSectionTransitionAnalysis(report.metrics.sectionTransitions);
    this.logMemoryAnalysis(report.metrics.memory);
    this.logRecommendations(report.metrics);
    
    // Store report for download
    window.ovsiaPerformanceReport = report;
    console.log('💾 Full report saved to window.ovsiaPerformanceReport');
    console.log('📥 To download: copy(JSON.stringify(window.ovsiaPerformanceReport, null, 2))');
  }

  processMetrics() {
    return {
      fps: this.analyzeFPS(),
      scrollLatency: this.analyzeScrollLatency(),
      sectionTransitions: this.analyzeSectionTransitions(),
      memory: this.analyzeMemory()
    };
  }

  analyzeFPS() {
    const fpsValues = this.metrics.fps.map(m => m.fps).filter(fps => fps < 200); // Filter outliers
    
    return {
      average: fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length,
      min: Math.min(...fpsValues),
      max: Math.max(...fpsValues),
      below60: fpsValues.filter(fps => fps < 60).length,
      below30: fpsValues.filter(fps => fps < 30).length,
      samples: fpsValues.length
    };
  }

  analyzeScrollLatency() {
    const latencies = this.metrics.scrollLatency.map(m => m.latency);
    
    if (latencies.length === 0) return { average: 0, max: 0, samples: 0 };
    
    return {
      average: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      max: Math.max(...latencies),
      above100ms: latencies.filter(l => l > 100).length,
      samples: latencies.length
    };
  }

  analyzeSectionTransitions() {
    const durations = this.metrics.sectionTransitions.map(m => m.duration);
    
    if (durations.length === 0) return { average: 0, max: 0, samples: 0 };
    
    return {
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      max: Math.max(...durations),
      min: Math.min(...durations),
      above1000ms: durations.filter(d => d > 1000).length,
      samples: durations.length
    };
  }

  analyzeMemory() {
    if (this.metrics.memoryUsage.length === 0) return null;
    
    const usedMemory = this.metrics.memoryUsage.map(m => m.used);
    const initial = usedMemory[0];
    const final = usedMemory[usedMemory.length - 1];
    
    return {
      initial: initial,
      final: final,
      growth: final - initial,
      growthPercent: ((final - initial) / initial) * 100,
      peak: Math.max(...usedMemory)
    };
  }

  logFPSAnalysis(fps) {
    console.log(`🎯 FPS ANALYSIS (Target: 60 FPS)`);
    console.log(`   Average: ${fps.average.toFixed(1)} FPS`);
    console.log(`   Range: ${fps.min.toFixed(1)} - ${fps.max.toFixed(1)} FPS`);
    console.log(`   Below 60 FPS: ${fps.below60}/${fps.samples} frames (${((fps.below60/fps.samples)*100).toFixed(1)}%)`);
    console.log(`   Below 30 FPS: ${fps.below30}/${fps.samples} frames (${((fps.below30/fps.samples)*100).toFixed(1)}%)`);
    
    if (fps.average >= 60) {
      console.log(`   ✅ EXCELLENT: Meeting 60 FPS target`);
    } else if (fps.average >= 45) {
      console.log(`   ⚠️  GOOD: Close to 60 FPS target`);
    } else {
      console.log(`   ❌ POOR: Below acceptable performance`);
    }
    console.log('');
  }

  logScrollLatencyAnalysis(latency) {
    console.log(`⚡ SCROLL LATENCY ANALYSIS (Target: <100ms)`);
    console.log(`   Average: ${latency.average.toFixed(1)}ms`);
    console.log(`   Max: ${latency.max.toFixed(1)}ms`);
    console.log(`   Above 100ms: ${latency.above100ms}/${latency.samples} events`);
    
    if (latency.average < 50) {
      console.log(`   ✅ EXCELLENT: Very responsive scrolling`);
    } else if (latency.average < 100) {
      console.log(`   ⚠️  GOOD: Acceptable responsiveness`);
    } else {
      console.log(`   ❌ POOR: Laggy scroll response`);
    }
    console.log('');
  }

  logSectionTransitionAnalysis(transitions) {
    console.log(`🔄 SECTION TRANSITIONS (Target: <800ms)`);
    console.log(`   Average: ${transitions.average.toFixed(1)}ms`);
    console.log(`   Range: ${transitions.min.toFixed(1)} - ${transitions.max.toFixed(1)}ms`);
    console.log(`   Above 1000ms: ${transitions.above1000ms}/${transitions.samples} transitions`);
    
    if (transitions.average < 600) {
      console.log(`   ✅ EXCELLENT: Smooth section transitions`);
    } else if (transitions.average < 1000) {
      console.log(`   ⚠️  GOOD: Acceptable transition speed`);
    } else {
      console.log(`   ❌ POOR: Slow section transitions`);
    }
    console.log('');
  }

  logMemoryAnalysis(memory) {
    if (!memory) {
      console.log(`💾 MEMORY ANALYSIS: Not available in this browser`);
      console.log('');
      return;
    }

    console.log(`💾 MEMORY ANALYSIS`);
    console.log(`   Initial: ${(memory.initial / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Final: ${(memory.final / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Growth: ${(memory.growth / 1024 / 1024).toFixed(1)}MB (${memory.growthPercent.toFixed(1)}%)`);
    console.log(`   Peak: ${(memory.peak / 1024 / 1024).toFixed(1)}MB`);
    
    if (memory.growthPercent < 10) {
      console.log(`   ✅ EXCELLENT: Minimal memory growth`);
    } else if (memory.growthPercent < 25) {
      console.log(`   ⚠️  GOOD: Moderate memory usage`);
    } else {
      console.log(`   ❌ POOR: High memory consumption`);
    }
    console.log('');
  }

  logRecommendations(metrics) {
    console.log(`🔧 PERFORMANCE RECOMMENDATIONS`);
    console.log(`================================`);
    
    const recommendations = [];
    
    if (metrics.fps.average < 60) {
      recommendations.push(`• Optimize scroll handlers - current FPS: ${metrics.fps.average.toFixed(1)}`);
      recommendations.push(`• Consider reducing animation complexity during scroll`);
      recommendations.push(`• Use will-change CSS property more strategically`);
    }
    
    if (metrics.scrollLatency.average > 100) {
      recommendations.push(`• Reduce scroll event processing time`);
      recommendations.push(`• Consider increasing throttle delay`);
      recommendations.push(`• Move heavy computations off main thread`);
    }
    
    if (metrics.sectionTransitions.average > 800) {
      recommendations.push(`• Optimize section transition animations`);
      recommendations.push(`• Consider using transform instead of layout properties`);
      recommendations.push(`• Review CSS scroll-snap behavior`);
    }
    
    if (metrics.memory && metrics.memory.growthPercent > 20) {
      recommendations.push(`• Memory leak detected - review event listeners`);
      recommendations.push(`• Check for uncleaned intervals/timeouts`);
      recommendations.push(`• Review component unmounting behavior`);
    }
    
    if (recommendations.length === 0) {
      console.log(`   ✅ EXCELLENT: No immediate performance issues detected!`);
      console.log(`   💡 Consider micro-optimizations:`);
      console.log(`      • Implement requestIdleCallback for non-critical tasks`);
      console.log(`      • Add preload hints for next sections`);
      console.log(`      • Consider service worker for caching strategies`);
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log('');
    console.log(`🎯 NEXT STEPS:`);
    console.log(`   1. Run this audit on different devices/browsers`);
    console.log(`   2. Test under network throttling conditions`);
    console.log(`   3. Profile with Chrome DevTools Performance tab`);
    console.log(`   4. Set up continuous performance monitoring`);
  }
}

// Initialize and provide easy access
window.scrollAuditor = new ScrollPerformanceAuditor();

console.log('🔍 Ovsia V4 Performance Auditor loaded!');
console.log('📋 Run: scrollAuditor.startAudit() to begin 30-second performance test');
console.log('⏹️  Run: scrollAuditor.stopAudit() to stop early');