/**
 * Comprehensive Load Testing Script for Ovsia V4 Scroll Performance
 * 
 * This script simulates various real-world scenarios to verify the 60fps
 * performance target under different conditions including:
 * - High-frequency scroll events
 * - Rapid section transitions
 * - Memory pressure conditions
 * - Network throttling simulation
 * - Multi-tab scenarios
 * - Device capability simulation
 * 
 * Run in Chrome DevTools console after loading the page.
 */

class ScrollPerformanceLoadTester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
    this.abortController = new AbortController();
    this.startTime = 0;
    
    // Test configuration
    this.config = {
      targetFPS: 60,
      testDuration: 30000, // 30 seconds per test
      scrollFrequency: 16, // ms between scroll events (60fps)
      memoryPressureSize: 50 * 1024 * 1024, // 50MB
      maxConcurrentTests: 5,
    };

    // Performance monitoring
    this.metrics = {
      fps: [],
      frameDrops: 0,
      memoryLeaks: 0,
      scrollLatency: [],
      transitionTimes: [],
    };

    console.log('🚀 Ovsia V4 Scroll Performance Load Tester initialized');
    this.displayMenu();
  }

  displayMenu() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    SCROLL PERFORMANCE LOAD TESTS               ║
╠════════════════════════════════════════════════════════════════╣
║  1. runBasicScrollTest()     - Basic 60fps scroll validation   ║
║  2. runHighFrequencyTest()   - Extreme scroll event stress     ║
║  3. runMemoryPressureTest()  - Memory leak detection          ║
║  4. runRapidTransitionTest() - Fast section switching         ║
║  5. runNetworkThrottleTest() - Slow connection simulation     ║
║  6. runMultiTabTest()        - Background tab performance     ║
║  7. runDeviceSimulation()    - Low-end device simulation      ║
║  8. runFullTestSuite()       - Run all tests sequentially     ║
║  9. getTestResults()         - View all test results          ║
║ 10. exportResults()          - Download results as JSON       ║
╚════════════════════════════════════════════════════════════════╝

📋 Quick Start: loadTester.runFullTestSuite()
⚡ Target: Maintain 60fps under all conditions
    `);
  }

  // Test 1: Basic 60fps scroll validation
  async runBasicScrollTest() {
    console.log('🧪 Running Basic Scroll Test (60fps validation)...');
    
    const testResult = {
      testName: 'Basic Scroll Test',
      startTime: Date.now(),
      targetFPS: 60,
      duration: this.config.testDuration,
      metrics: {
        averageFPS: 0,
        minFPS: Infinity,
        maxFPS: 0,
        frameDrops: 0,
        consistencyScore: 0,
      },
      passed: false,
    };

    const scrollContainer = document.querySelector('.optimized-scroll-container');
    if (!scrollContainer) {
      console.error('❌ Scroll container not found');
      return;
    }

    const fpsData = [];
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let animationId;

    // FPS monitoring
    const measureFPS = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTime;
      const fps = 1000 / deltaTime;
      
      fpsData.push(fps);
      frameCount++;
      
      if (fps < 55) testResult.metrics.frameDrops++;
      
      testResult.metrics.minFPS = Math.min(testResult.metrics.minFPS, fps);
      testResult.metrics.maxFPS = Math.max(testResult.metrics.maxFPS, fps);
      
      lastFrameTime = now;
      animationId = requestAnimationFrame(measureFPS);
    };

    // Start monitoring
    measureFPS();

    // Simulate smooth scrolling through all sections
    const sections = document.querySelectorAll('.scroll-snap-section');
    const sectionHeight = window.innerHeight;
    
    for (let i = 0; i < sections.length * 3; i++) { // 3 cycles through all sections
      const targetScroll = (i % sections.length) * sectionHeight;
      
      scrollContainer.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      
      await this.wait(2000); // Wait for transition
      
      if (this.abortController.signal.aborted) break;
    }

    // Stop monitoring
    cancelAnimationFrame(animationId);

    // Calculate results
    testResult.metrics.averageFPS = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
    
    // Consistency score: percentage of frames above 55fps
    const consistentFrames = fpsData.filter(fps => fps >= 55).length;
    testResult.metrics.consistencyScore = (consistentFrames / fpsData.length) * 100;
    
    testResult.passed = testResult.metrics.averageFPS >= 55 && 
                       testResult.metrics.consistencyScore >= 90;
    
    testResult.endTime = Date.now();
    this.testResults.push(testResult);
    
    console.log(`✅ Basic Scroll Test Complete:
      Average FPS: ${testResult.metrics.averageFPS.toFixed(1)}
      Min FPS: ${testResult.metrics.minFPS.toFixed(1)}
      Max FPS: ${testResult.metrics.maxFPS.toFixed(1)}
      Frame Drops: ${testResult.metrics.frameDrops}
      Consistency: ${testResult.metrics.consistencyScore.toFixed(1)}%
      Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
    `);

    return testResult;
  }

  // Test 2: High-frequency scroll event stress test
  async runHighFrequencyTest() {
    console.log('⚡ Running High Frequency Scroll Test...');
    
    const testResult = {
      testName: 'High Frequency Scroll Test',
      startTime: Date.now(),
      eventsPerSecond: 120, // 2x normal rate
      duration: 15000, // 15 seconds
      metrics: {
        totalEvents: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        missedEvents: 0,
        memoryGrowth: 0,
      },
      passed: false,
    };

    const scrollContainer = document.querySelector('.optimized-scroll-container');
    const responseTimes = [];
    let eventCount = 0;
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

    // High-frequency scroll simulation
    const scrollInterval = setInterval(() => {
      const startTime = performance.now();
      
      // Simulate rapid wheel events
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: Math.random() > 0.5 ? 100 : -100,
        bubbles: true,
        cancelable: true,
      });
      
      scrollContainer.dispatchEvent(wheelEvent);
      
      // Measure response time
      requestAnimationFrame(() => {
        const responseTime = performance.now() - startTime;
        responseTimes.push(responseTime);
        
        if (responseTime > 16.67) { // Missed 60fps frame
          testResult.metrics.missedEvents++;
        }
      });
      
      eventCount++;
      testResult.metrics.totalEvents = eventCount;
      
      if (eventCount >= (testResult.eventsPerSecond * testResult.duration / 1000)) {
        clearInterval(scrollInterval);
        this.finishHighFrequencyTest(testResult, responseTimes, initialMemory);
      }
    }, 1000 / testResult.eventsPerSecond);

    return new Promise(resolve => {
      setTimeout(() => {
        clearInterval(scrollInterval);
        resolve(this.finishHighFrequencyTest(testResult, responseTimes, initialMemory));
      }, testResult.duration);
    });
  }

  finishHighFrequencyTest(testResult, responseTimes, initialMemory) {
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    testResult.metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    testResult.metrics.maxResponseTime = Math.max(...responseTimes);
    testResult.metrics.memoryGrowth = finalMemory - initialMemory;
    
    testResult.passed = testResult.metrics.averageResponseTime < 16.67 && 
                       testResult.metrics.missedEvents < (testResult.metrics.totalEvents * 0.05); // Less than 5% missed
    
    testResult.endTime = Date.now();
    this.testResults.push(testResult);
    
    console.log(`⚡ High Frequency Test Complete:
      Total Events: ${testResult.metrics.totalEvents}
      Avg Response: ${testResult.metrics.averageResponseTime.toFixed(2)}ms
      Max Response: ${testResult.metrics.maxResponseTime.toFixed(2)}ms
      Missed Events: ${testResult.metrics.missedEvents}
      Memory Growth: ${(testResult.metrics.memoryGrowth / 1024 / 1024).toFixed(2)}MB
      Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
    `);

    return testResult;
  }

  // Test 3: Memory pressure test to detect leaks
  async runMemoryPressureTest() {
    console.log('💾 Running Memory Pressure Test...');
    
    const testResult = {
      testName: 'Memory Pressure Test',
      startTime: Date.now(),
      duration: 20000,
      memoryPressureSize: this.config.memoryPressureSize,
      metrics: {
        initialMemory: 0,
        peakMemory: 0,
        finalMemory: 0,
        memoryLeak: 0,
        gcCollections: 0,
      },
      passed: false,
    };

    // Create memory pressure
    const memoryHogs = [];
    
    if (performance.memory) {
      testResult.metrics.initialMemory = performance.memory.usedJSHeapSize;
    }

    // Allocate large arrays to simulate memory pressure
    for (let i = 0; i < 10; i++) {
      memoryHogs.push(new Array(this.config.memoryPressureSize / 40).fill(Math.random()));
    }

    console.log('💾 Memory pressure applied, testing scroll performance...');

    // Test scrolling under memory pressure
    const scrollContainer = document.querySelector('.optimized-scroll-container');
    const sections = document.querySelectorAll('.scroll-snap-section');
    
    let peakMemory = 0;
    const memoryCheckInterval = setInterval(() => {
      if (performance.memory) {
        const currentMemory = performance.memory.usedJSHeapSize;
        peakMemory = Math.max(peakMemory, currentMemory);
      }
    }, 1000);

    // Perform intensive scrolling
    for (let cycle = 0; cycle < 5; cycle++) {
      for (let i = 0; i < sections.length; i++) {
        scrollContainer.scrollTo({
          top: i * window.innerHeight,
          behavior: 'smooth'
        });
        await this.wait(1000);
      }
    }

    clearInterval(memoryCheckInterval);

    // Force garbage collection if possible
    if (window.gc) {
      testResult.metrics.gcCollections++;
      window.gc();
    }

    // Clean up memory hogs
    memoryHogs.length = 0;

    await this.wait(2000); // Wait for cleanup

    if (performance.memory) {
      testResult.metrics.peakMemory = peakMemory;
      testResult.metrics.finalMemory = performance.memory.usedJSHeapSize;
      testResult.metrics.memoryLeak = testResult.metrics.finalMemory - testResult.metrics.initialMemory;
    }

    // Memory leak is acceptable if less than 10MB
    testResult.passed = Math.abs(testResult.metrics.memoryLeak) < (10 * 1024 * 1024);
    
    testResult.endTime = Date.now();
    this.testResults.push(testResult);

    console.log(`💾 Memory Pressure Test Complete:
      Initial: ${(testResult.metrics.initialMemory / 1024 / 1024).toFixed(2)}MB
      Peak: ${(testResult.metrics.peakMemory / 1024 / 1024).toFixed(2)}MB
      Final: ${(testResult.metrics.finalMemory / 1024 / 1024).toFixed(2)}MB
      Leak: ${(testResult.metrics.memoryLeak / 1024 / 1024).toFixed(2)}MB
      Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
    `);

    return testResult;
  }

  // Test 4: Rapid section transition test
  async runRapidTransitionTest() {
    console.log('🔄 Running Rapid Transition Test...');
    
    const testResult = {
      testName: 'Rapid Transition Test',
      startTime: Date.now(),
      transitions: 50,
      metrics: {
        averageTransitionTime: 0,
        maxTransitionTime: 0,
        minTransitionTime: Infinity,
        failedTransitions: 0,
        smoothnessScore: 0,
      },
      passed: false,
    };

    const scrollContainer = document.querySelector('.optimized-scroll-container');
    const sections = document.querySelectorAll('.scroll-snap-section');
    const transitionTimes = [];

    for (let i = 0; i < testResult.transitions; i++) {
      const targetSection = Math.floor(Math.random() * sections.length);
      const startTime = performance.now();

      // Navigate to random section
      scrollContainer.scrollTo({
        top: targetSection * window.innerHeight,
        behavior: 'smooth'
      });

      // Wait for transition and measure time
      await new Promise(resolve => {
        const checkTransition = () => {
          const currentScroll = scrollContainer.scrollTop;
          const targetScroll = targetSection * window.innerHeight;
          
          if (Math.abs(currentScroll - targetScroll) < 10) {
            const transitionTime = performance.now() - startTime;
            transitionTimes.push(transitionTime);
            
            if (transitionTime > 1000) { // Failed if takes more than 1 second
              testResult.metrics.failedTransitions++;
            }
            
            resolve();
          } else {
            setTimeout(checkTransition, 16);
          }
        };
        
        checkTransition();
      });

      // Small delay between transitions
      await this.wait(50);
    }

    // Calculate metrics
    testResult.metrics.averageTransitionTime = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
    testResult.metrics.maxTransitionTime = Math.max(...transitionTimes);
    testResult.metrics.minTransitionTime = Math.min(...transitionTimes);
    
    // Smoothness score: percentage of transitions under 800ms
    const smoothTransitions = transitionTimes.filter(time => time < 800).length;
    testResult.metrics.smoothnessScore = (smoothTransitions / transitionTimes.length) * 100;
    
    testResult.passed = testResult.metrics.averageTransitionTime < 600 && 
                       testResult.metrics.failedTransitions === 0 &&
                       testResult.metrics.smoothnessScore >= 90;

    testResult.endTime = Date.now();
    this.testResults.push(testResult);

    console.log(`🔄 Rapid Transition Test Complete:
      Transitions: ${testResult.transitions}
      Avg Time: ${testResult.metrics.averageTransitionTime.toFixed(0)}ms
      Max Time: ${testResult.metrics.maxTransitionTime.toFixed(0)}ms
      Failed: ${testResult.metrics.failedTransitions}
      Smoothness: ${testResult.metrics.smoothnessScore.toFixed(1)}%
      Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
    `);

    return testResult;
  }

  // Test 5: Network throttling simulation
  async runNetworkThrottleTest() {
    console.log('🌐 Running Network Throttle Test...');
    
    const testResult = {
      testName: 'Network Throttle Test',
      startTime: Date.now(),
      duration: 15000,
      metrics: {
        baselineLatency: 0,
        throttledLatency: 0,
        performanceDegradation: 0,
        scrollResponseTime: 0,
      },
      passed: false,
    };

    // Measure baseline network performance
    const baselineStart = performance.now();
    try {
      await fetch('/favicon.ico', { cache: 'no-cache' });
      testResult.metrics.baselineLatency = performance.now() - baselineStart;
    } catch (error) {
      testResult.metrics.baselineLatency = -1;
    }

    // Simulate network throttling by adding artificial delays
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await this.wait(Math.random() * 500 + 200); // 200-700ms delay
      return originalFetch(...args);
    };

    console.log('🌐 Network throttling applied, testing scroll performance...');

    // Test scroll performance under network pressure
    const scrollContainer = document.querySelector('.optimized-scroll-container');
    const startScrollTime = performance.now();
    
    // Perform scrolling while network is throttled
    for (let i = 0; i < 6; i++) {
      scrollContainer.scrollTo({
        top: i * window.innerHeight,
        behavior: 'smooth'
      });
      await this.wait(1000);
    }

    testResult.metrics.scrollResponseTime = performance.now() - startScrollTime;

    // Measure throttled network performance
    const throttledStart = performance.now();
    try {
      await fetch('/favicon.ico', { cache: 'no-cache' });
      testResult.metrics.throttledLatency = performance.now() - throttledStart;
    } catch (error) {
      testResult.metrics.throttledLatency = -1;
    }

    // Restore original fetch
    window.fetch = originalFetch;

    // Calculate performance degradation
    if (testResult.metrics.baselineLatency > 0 && testResult.metrics.throttledLatency > 0) {
      testResult.metrics.performanceDegradation = 
        ((testResult.metrics.throttledLatency - testResult.metrics.baselineLatency) / testResult.metrics.baselineLatency) * 100;
    }

    // Test passes if scroll performance remains good despite network issues
    testResult.passed = testResult.metrics.scrollResponseTime < 8000; // Should complete in under 8 seconds

    testResult.endTime = Date.now();
    this.testResults.push(testResult);

    console.log(`🌐 Network Throttle Test Complete:
      Baseline Latency: ${testResult.metrics.baselineLatency.toFixed(0)}ms
      Throttled Latency: ${testResult.metrics.throttledLatency.toFixed(0)}ms
      Degradation: ${testResult.metrics.performanceDegradation.toFixed(1)}%
      Scroll Time: ${testResult.metrics.scrollResponseTime.toFixed(0)}ms
      Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
    `);

    return testResult;
  }

  // Test 6: Multi-tab performance test
  async runMultiTabTest() {
    console.log('🗂️ Running Multi-Tab Test...');
    
    const testResult = {
      testName: 'Multi-Tab Test',
      startTime: Date.now(),
      tabCount: 3,
      metrics: {
        activeTabFPS: 0,
        backgroundTabsCreated: 0,
        performanceImpact: 0,
        memoryIncrease: 0,
      },
      passed: false,
    };

    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

    // Open multiple tabs (simulated by creating hidden iframes)
    const backgroundTabs = [];
    
    for (let i = 0; i < testResult.tabCount; i++) {
      const iframe = document.createElement('iframe');
      iframe.src = window.location.href;
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      document.body.appendChild(iframe);
      backgroundTabs.push(iframe);
      testResult.metrics.backgroundTabsCreated++;
    }

    console.log(`🗂️ Created ${testResult.tabCount} background tabs, measuring performance...`);

    await this.wait(3000); // Wait for tabs to load

    // Measure FPS in active tab
    const fpsData = [];
    let frameCount = 0;
    let lastFrameTime = performance.now();
    
    const measureFPS = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTime;
      const fps = 1000 / deltaTime;
      
      fpsData.push(fps);
      frameCount++;
      lastFrameTime = now;
      
      if (frameCount < 300) { // Measure for ~5 seconds at 60fps
        requestAnimationFrame(measureFPS);
      } else {
        testResult.metrics.activeTabFPS = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
        finishMultiTabTest();
      }
    };

    const finishMultiTabTest = () => {
      // Clean up background tabs
      backgroundTabs.forEach(iframe => {
        document.body.removeChild(iframe);
      });

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      testResult.metrics.memoryIncrease = finalMemory - initialMemory;

      // Test passes if FPS remains above 50 with multiple tabs
      testResult.passed = testResult.metrics.activeTabFPS >= 50;

      testResult.endTime = Date.now();
      this.testResults.push(testResult);

      console.log(`🗂️ Multi-Tab Test Complete:
        Background Tabs: ${testResult.metrics.backgroundTabsCreated}
        Active Tab FPS: ${testResult.metrics.activeTabFPS.toFixed(1)}
        Memory Increase: ${(testResult.metrics.memoryIncrease / 1024 / 1024).toFixed(2)}MB
        Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
      `);
    };

    // Start FPS measurement while scrolling
    measureFPS();
    
    // Perform scrolling during measurement
    const scrollInterval = setInterval(() => {
      const scrollContainer = document.querySelector('.optimized-scroll-container');
      const randomSection = Math.floor(Math.random() * 6);
      scrollContainer.scrollTo({
        top: randomSection * window.innerHeight,
        behavior: 'smooth'
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(scrollInterval);
    }, 5000);

    return testResult;
  }

  // Test 7: Low-end device simulation
  async runDeviceSimulation() {
    console.log('📱 Running Low-End Device Simulation...');
    
    const testResult = {
      testName: 'Device Simulation Test',
      startTime: Date.now(),
      deviceProfile: 'Low-end mobile (2GB RAM, 4 cores)',
      metrics: {
        simulatedFPS: 0,
        adaptationScore: 0,
        resourceUsage: 0,
        optimizationApplied: false,
      },
      passed: false,
    };

    // Simulate low-end device by artificially limiting resources
    const simulateSlowDevice = () => {
      // Reduce animation frame rate
      const originalRAF = window.requestAnimationFrame;
      let frameSkipCounter = 0;
      
      window.requestAnimationFrame = (callback) => {
        frameSkipCounter++;
        if (frameSkipCounter % 2 === 0) { // Skip every other frame (30fps)
          return originalRAF(callback);
        } else {
          return setTimeout(callback, 16);
        }
      };

      return () => {
        window.requestAnimationFrame = originalRAF;
      };
    };

    const restoreDevice = simulateSlowDevice();

    console.log('📱 Device limitations applied, testing adaptation...');

    // Test scroll performance under simulated constraints
    const scrollContainer = document.querySelector('.optimized-scroll-container');
    const fpsData = [];
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const measureFPS = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTime;
      const fps = 1000 / deltaTime;
      
      fpsData.push(fps);
      frameCount++;
      lastFrameTime = now;
      
      if (frameCount < 180) { // Measure for 3 seconds
        requestAnimationFrame(measureFPS);
      } else {
        testResult.metrics.simulatedFPS = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
        
        // Check if system adapts to lower performance
        const consistentFrames = fpsData.filter(fps => fps >= 25).length; // 25fps minimum
        testResult.metrics.adaptationScore = (consistentFrames / fpsData.length) * 100;
        
        restoreDevice();
        finishDeviceSimulation();
      }
    };

    const finishDeviceSimulation = () => {
      // Test passes if maintains at least 25fps consistently
      testResult.passed = testResult.metrics.simulatedFPS >= 25 && 
                         testResult.metrics.adaptationScore >= 80;

      testResult.endTime = Date.now();
      this.testResults.push(testResult);

      console.log(`📱 Device Simulation Test Complete:
        Simulated FPS: ${testResult.metrics.simulatedFPS.toFixed(1)}
        Adaptation Score: ${testResult.metrics.adaptationScore.toFixed(1)}%
        Result: ${testResult.passed ? 'PASSED ✅' : 'FAILED ❌'}
      `);
    };

    // Start measurement and scrolling
    measureFPS();
    
    // Perform scrolling during simulation
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: i * window.innerHeight,
          behavior: 'smooth'
        });
      }, i * 500);
    }

    return testResult;
  }

  // Run all tests sequentially
  async runFullTestSuite() {
    console.log('🏃‍♂️ Running Full Test Suite...');
    
    const suiteStart = Date.now();
    this.testResults = []; // Clear previous results

    try {
      await this.runBasicScrollTest();
      await this.wait(2000);
      
      await this.runHighFrequencyTest();
      await this.wait(2000);
      
      await this.runMemoryPressureTest();
      await this.wait(2000);
      
      await this.runRapidTransitionTest();
      await this.wait(2000);
      
      await this.runNetworkThrottleTest();
      await this.wait(2000);
      
      await this.runMultiTabTest();
      await this.wait(2000);
      
      await this.runDeviceSimulation();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return;
    }

    const suiteEnd = Date.now();
    const suiteDuration = suiteEnd - suiteStart;

    // Generate comprehensive report
    this.generateSuiteReport(suiteDuration);
  }

  generateSuiteReport(duration) {
    const passedTests = this.testResults.filter(test => test.passed).length;
    const totalTests = this.testResults.length;
    const passRate = (passedTests / totalTests) * 100;

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                     FULL TEST SUITE RESULTS                    ║
╠════════════════════════════════════════════════════════════════╣
║  Duration: ${(duration / 1000).toFixed(1)} seconds                                     ║
║  Tests Passed: ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)                                ║
║  Overall Result: ${passRate >= 85 ? 'PASSED ✅' : 'FAILED ❌'}                      ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Individual test results
    this.testResults.forEach((test, index) => {
      console.log(`${index + 1}. ${test.testName}: ${test.passed ? '✅ PASSED' : '❌ FAILED'}`);
    });

    console.log(`
📊 PERFORMANCE SUMMARY:
- Target: 60fps scroll performance under all conditions
- Critical Issues: ${this.testResults.filter(t => !t.passed && t.testName.includes('Basic')).length}
- Performance Issues: ${this.testResults.filter(t => !t.passed).length - this.testResults.filter(t => !t.passed && t.testName.includes('Basic')).length}

💡 RECOMMENDATIONS:
${this.generateRecommendations()}

📥 Export full results: loadTester.exportResults()
    `);
  }

  generateRecommendations() {
    const failedTests = this.testResults.filter(test => !test.passed);
    const recommendations = [];

    failedTests.forEach(test => {
      switch (test.testName) {
        case 'Basic Scroll Test':
          recommendations.push('• Critical: Optimize core scroll performance - consider reducing animation complexity');
          break;
        case 'High Frequency Scroll Test':
          recommendations.push('• Increase scroll event throttling or implement event coalescing');
          break;
        case 'Memory Pressure Test':
          recommendations.push('• Memory leak detected - review event listener cleanup and component unmounting');
          break;
        case 'Rapid Transition Test':
          recommendations.push('• Optimize section transition animations - use transform instead of layout properties');
          break;
        case 'Network Throttle Test':
          recommendations.push('• Reduce dependency on network resources during scroll operations');
          break;
        case 'Multi-Tab Test':
          recommendations.push('• Implement tab visibility detection to pause animations in background tabs');
          break;
        case 'Device Simulation Test':
          recommendations.push('• Add device capability detection and adaptive performance scaling');
          break;
      }
    });

    if (recommendations.length === 0) {
      return '  All tests passed! Performance is excellent. 🎉';
    }

    return recommendations.join('\n');
  }

  // Utility methods
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTestResults() {
    if (this.testResults.length === 0) {
      console.log('❌ No test results available. Run tests first.');
      return;
    }

    console.table(this.testResults.map(test => ({
      Test: test.testName,
      Passed: test.passed ? '✅' : '❌',
      Duration: test.endTime ? `${((test.endTime - test.startTime) / 1000).toFixed(1)}s` : 'Running...',
    })));

    return this.testResults;
  }

  exportResults() {
    if (this.testResults.length === 0) {
      console.log('❌ No test results to export. Run tests first.');
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      deviceInfo: {
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        connection: (navigator as any).connection?.effectiveType,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio,
      },
      testResults: this.testResults,
      summary: {
        totalTests: this.testResults.length,
        passedTests: this.testResults.filter(t => t.passed).length,
        passRate: (this.testResults.filter(t => t.passed).length / this.testResults.length) * 100,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ovsia-scroll-performance-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📥 Test results exported successfully!');
  }

  // Abort all running tests
  abort() {
    this.abortController.abort();
    this.isRunning = false;
    console.log('⏹️ All tests aborted.');
  }
}

// Initialize the load tester
window.loadTester = new ScrollPerformanceLoadTester();

console.log('🚀 Scroll Performance Load Tester ready!');
console.log('📋 Quick start: loadTester.runFullTestSuite()');
console.log('ℹ️  See menu above for individual test options');