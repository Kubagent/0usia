#!/usr/bin/env node

/**
 * Scroll Performance Monitor
 * 
 * This script monitors the Ovsia website's scroll performance in real-time
 * and provides recommendations for optimization.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ScrollPerformanceMonitor {
  constructor(url = 'http://localhost:3001') {
    this.url = url;
    this.browser = null;
    this.page = null;
    this.metrics = {
      transitions: [],
      fps: [],
      memoryUsage: [],
      errors: [],
    };
  }

  async init() {
    console.log('🚀 Initializing Scroll Performance Monitor...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for visual debugging
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    });

    this.page = await this.browser.newPage();
    
    // Enable performance monitoring
    await this.page.setCacheEnabled(false);
    await this.setupPerformanceMonitoring();
    
    console.log('✅ Browser initialized');
  }

  async setupPerformanceMonitoring() {
    // Monitor console logs for performance metrics
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Scroll Performance]')) {
        console.log('📊', text);
      }
      if (text.includes('[Navigation]')) {
        console.log('🧭', text);
      }
    });

    // Monitor errors
    this.page.on('pageerror', (error) => {
      console.error('❌ Page Error:', error.message);
      this.metrics.errors.push({
        message: error.message,
        timestamp: Date.now(),
      });
    });

    // Inject performance monitoring script
    await this.page.evaluateOnNewDocument(() => {
      window.scrollPerformanceData = {
        transitions: [],
        fps: [],
        frameCount: 0,
        lastFrameTime: performance.now(),
      };

      // Monitor frame rate
      function measureFPS() {
        const now = performance.now();
        const delta = now - window.scrollPerformanceData.lastFrameTime;
        const fps = 1000 / delta;
        
        window.scrollPerformanceData.fps.push(fps);
        window.scrollPerformanceData.frameCount++;
        window.scrollPerformanceData.lastFrameTime = now;
        
        // Keep only last 60 FPS measurements (1 second at 60fps)
        if (window.scrollPerformanceData.fps.length > 60) {
          window.scrollPerformanceData.fps.shift();
        }
        
        requestAnimationFrame(measureFPS);
      }
      
      requestAnimationFrame(measureFPS);
    });
  }

  async loadPage() {
    console.log(`📖 Loading page: ${this.url}`);
    
    const navigationStart = Date.now();
    await this.page.goto(this.url, { 
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    const navigationEnd = Date.now();
    
    console.log(`⚡ Page loaded in ${navigationEnd - navigationStart}ms`);
    
    // Wait for scroll container to initialize
    await this.page.waitForSelector('.optimized-scroll-container', {
      timeout: 10000,
    });
    
    console.log('✅ Scroll container detected');
  }

  async testScrollPerformance() {
    console.log('🧪 Starting scroll performance tests...');
    
    const sections = [
      { name: 'Hero', expected: 'natural-scroll' },
      { name: 'Manifesto', expected: 'snap' },
      { name: 'Expertise', expected: 'snap' },
      { name: 'Ventures', expected: 'snap' },
      { name: 'CTA', expected: 'snap' },
      { name: 'Footer', expected: 'snap' },
    ];

    // Test 1: Hero Natural Scrolling
    await this.testHeroNaturalScrolling();
    
    // Test 2: Section-by-Section Navigation
    await this.testSectionNavigation();
    
    // Test 3: Performance Under Load
    await this.testPerformanceUnderLoad();
    
    // Test 4: Mobile Touch Simulation
    await this.testMobileTouch();
    
    // Test 5: Keyboard Navigation
    await this.testKeyboardNavigation();

    return this.generateReport();
  }

  async testHeroNaturalScrolling() {
    console.log('🏠 Testing Hero natural scrolling...');
    
    // Scroll down gradually within Hero section
    const scrollSteps = 10;
    const maxScroll = 800; // Assuming Hero is taller than viewport
    
    for (let i = 1; i <= scrollSteps; i++) {
      const scrollAmount = (maxScroll / scrollSteps) * i;
      
      const transitionStart = Date.now();
      await this.page.evaluate((scroll) => {
        window.scrollTo({ top: scroll, behavior: 'smooth' });
      }, scrollAmount);
      
      // Wait for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const transitionEnd = Date.now();
      const currentSection = await this.getCurrentSection();
      
      // Hero section should allow gradual scrolling
      if (i < scrollSteps && currentSection !== 0) {
        this.metrics.errors.push({
          test: 'hero-natural-scroll',
          message: `Premature section change at scroll ${scrollAmount}px`,
          timestamp: Date.now(),
        });
      }
      
      console.log(`   📍 Scroll ${scrollAmount}px -> Section ${currentSection + 1}`);
    }
  }

  async testSectionNavigation() {
    console.log('🎯 Testing section-by-section navigation...');
    
    // Reset to top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const sectionCount = await this.getSectionCount();
    
    for (let targetSection = 1; targetSection < sectionCount; targetSection++) {
      const transitionStart = Date.now();
      
      // Simulate mouse wheel scroll
      await this.page.evaluate(() => {
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: 100,
          bubbles: true,
          cancelable: true,
        }));
      });
      
      // Wait for transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const transitionEnd = Date.now();
      const currentSection = await this.getCurrentSection();
      const transitionTime = transitionEnd - transitionStart;
      
      this.metrics.transitions.push({
        from: targetSection - 1,
        to: targetSection,
        expected: targetSection,
        actual: currentSection,
        duration: transitionTime,
        success: currentSection === targetSection,
      });
      
      console.log(`   ⚡ Section ${targetSection - 1} -> ${currentSection} (${transitionTime}ms)`);
      
      if (transitionTime > 800) {
        console.warn(`   ⚠️  Slow transition: ${transitionTime}ms`);
      }
    }
  }

  async testPerformanceUnderLoad() {
    console.log('💪 Testing performance under load...');
    
    const testDuration = 10000; // 10 seconds
    const startTime = Date.now();
    
    let scrollCount = 0;
    while (Date.now() - startTime < testDuration) {
      // Rapid scroll events
      await this.page.evaluate(() => {
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: Math.random() > 0.5 ? 100 : -100,
          bubbles: true,
          cancelable: true,
        }));
      });
      
      scrollCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const avgFPS = await this.getAverageFPS();
    const memoryUsage = await this.getMemoryUsage();
    
    this.metrics.fps.push(avgFPS);
    this.metrics.memoryUsage.push(memoryUsage);
    
    console.log(`   📈 ${scrollCount} scroll events in ${testDuration}ms`);
    console.log(`   🎯 Average FPS: ${avgFPS?.toFixed(1) || 'N/A'}`);
    console.log(`   💾 Memory usage: ${memoryUsage?.toFixed(2) || 'N/A'} MB`);
  }

  async testMobileTouch() {
    console.log('📱 Testing mobile touch simulation...');
    
    // Set mobile viewport
    await this.page.setViewport({ width: 375, height: 812 });
    await this.page.reload({ waitUntil: 'networkidle0' });
    
    // Simulate touch swipe
    const startY = 400;
    const endY = 200;
    
    await this.page.touchscreen.tap(200, startY);
    await this.page.touchscreen.tap(200, endY);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentSection = await this.getCurrentSection();
    console.log(`   📱 Touch swipe result: Section ${currentSection + 1}`);
    
    // Reset to desktop viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testKeyboardNavigation() {
    console.log('⌨️  Testing keyboard navigation...');
    
    // Reset to top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const keys = ['ArrowDown', 'PageDown', 'Space'];
    
    for (const key of keys) {
      const beforeSection = await this.getCurrentSection();
      
      await this.page.keyboard.press(key);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const afterSection = await this.getCurrentSection();
      
      console.log(`   ⌨️  ${key}: Section ${beforeSection + 1} -> ${afterSection + 1}`);
      
      if (afterSection <= beforeSection) {
        this.metrics.errors.push({
          test: 'keyboard-navigation',
          message: `${key} did not advance section`,
          timestamp: Date.now(),
        });
      }
    }
  }

  async getCurrentSection() {
    return await this.page.evaluate(() => {
      const debugEl = document.querySelector('[class*="debug"]');
      if (debugEl) {
        const text = debugEl.textContent;
        const match = text.match(/Section: (\d+)/);
        return match ? parseInt(match[1], 10) - 1 : 0;
      }
      
      // Fallback: calculate based on scroll position
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      return Math.floor(scrollY / windowHeight);
    });
  }

  async getSectionCount() {
    return await this.page.evaluate(() => {
      return document.querySelectorAll('.scroll-snap-section').length;
    });
  }

  async getAverageFPS() {
    return await this.page.evaluate(() => {
      const data = window.scrollPerformanceData;
      if (!data || !data.fps.length) return null;
      
      const sum = data.fps.reduce((a, b) => a + b, 0);
      return sum / data.fps.length;
    });
  }

  async getMemoryUsage() {
    const metrics = await this.page.metrics();
    return metrics.JSHeapUsedSize / 1024 / 1024; // Convert to MB
  }

  generateReport() {
    console.log('\n📋 SCROLL PERFORMANCE REPORT');
    console.log('=====================================');
    
    // Transition Performance
    const transitions = this.metrics.transitions;
    const successful = transitions.filter(t => t.success).length;
    const avgTransitionTime = transitions.reduce((sum, t) => sum + t.duration, 0) / transitions.length;
    
    console.log(`✅ Successful transitions: ${successful}/${transitions.length}`);
    console.log(`⚡ Average transition time: ${avgTransitionTime?.toFixed(1) || 'N/A'}ms`);
    
    // FPS Performance
    const avgFPS = this.metrics.fps.reduce((sum, fps) => sum + fps, 0) / this.metrics.fps.length;
    console.log(`🎯 Average FPS: ${avgFPS?.toFixed(1) || 'N/A'}`);
    
    // Memory Usage
    if (this.metrics.memoryUsage.length > 0) {
      const avgMemory = this.metrics.memoryUsage.reduce((sum, mem) => sum + mem, 0) / this.metrics.memoryUsage.length;
      console.log(`💾 Average memory usage: ${avgMemory.toFixed(2)} MB`);
    }
    
    // Errors
    console.log(`❌ Errors: ${this.metrics.errors.length}`);
    this.metrics.errors.forEach(error => {
      console.log(`   • ${error.test || 'Unknown'}: ${error.message}`);
    });
    
    // Performance Grade
    const grade = this.calculateGrade(avgTransitionTime, avgFPS, this.metrics.errors.length);
    console.log(`\n🏆 Overall Grade: ${grade}`);
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'scroll-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);
    
    return {
      grade,
      avgTransitionTime,
      avgFPS,
      errorCount: this.metrics.errors.length,
      successRate: successful / transitions.length,
    };
  }

  calculateGrade(avgTransitionTime, avgFPS, errorCount) {
    let score = 100;
    
    // Deduct for slow transitions
    if (avgTransitionTime > 600) score -= 20;
    else if (avgTransitionTime > 500) score -= 10;
    
    // Deduct for low FPS
    if (avgFPS < 50) score -= 30;
    else if (avgFPS < 55) score -= 15;
    
    // Deduct for errors
    score -= errorCount * 10;
    
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    return 'F';
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const url = process.argv[2] || 'http://localhost:3001';
  const monitor = new ScrollPerformanceMonitor(url);
  
  try {
    await monitor.init();
    await monitor.loadPage();
    const report = await monitor.testScrollPerformance();
    
    console.log('\n🎉 Testing completed!');
    process.exit(report.grade === 'F' ? 1 : 0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await monitor.cleanup();
  }
}

// Check if running directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ScrollPerformanceMonitor;