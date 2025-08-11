#!/usr/bin/env node

/**
 * Quick Scroll Performance Test
 * Focused on essential metrics for production readiness
 */

const puppeteer = require('puppeteer');

async function quickScrollTest() {
  console.log('🚀 Quick Scroll Performance Test');
  console.log('================================');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Load page
    const startTime = Date.now();
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    console.log(`📖 Page Load Time: ${loadTime}ms`);
    
    // Wait for scroll container
    await page.waitForSelector('.optimized-scroll-container', { timeout: 5000 });
    console.log('✅ Scroll container detected');
    
    // Test Hero natural scrolling
    console.log('\n🏠 Testing Hero Natural Scrolling:');
    for (let scroll = 100; scroll <= 800; scroll += 200) {
      await page.evaluate((s) => window.scrollTo({ top: s, behavior: 'smooth' }), scroll);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentSection = await page.evaluate(() => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        return Math.floor(scrollY / viewportHeight);
      });
      
      console.log(`   📍 Scroll ${scroll}px -> Section ${currentSection + 1}`);
    }
    
    // Reset to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test section navigation
    console.log('\n🎯 Testing Section Navigation:');
    const sectionCount = await page.evaluate(() => {
      return document.querySelectorAll('.scroll-snap-section').length;
    });
    
    console.log(`   Detected ${sectionCount} sections`);
    
    // Test performance under load
    console.log('\n💪 Performance Under Load Test:');
    
    // Start FPS monitoring
    await page.evaluate(() => {
      window.fpsData = [];
      window.lastFrame = performance.now();
      
      function measureFPS() {
        const now = performance.now();
        const fps = 1000 / (now - window.lastFrame);
        window.fpsData.push(fps);
        window.lastFrame = now;
        requestAnimationFrame(measureFPS);
      }
      measureFPS();
    });
    
    // Generate scroll events
    const testStart = Date.now();
    let scrollEventCount = 0;
    
    while (Date.now() - testStart < 3000) { // 3 second test
      await page.evaluate(() => {
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: Math.random() > 0.5 ? 100 : -100,
          bubbles: true,
          cancelable: true,
        }));
      });
      scrollEventCount++;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // Get performance metrics
    const avgFPS = await page.evaluate(() => {
      if (!window.fpsData || window.fpsData.length === 0) return null;
      const sum = window.fpsData.reduce((a, b) => a + b, 0);
      return sum / window.fpsData.length;
    });
    
    const memoryUsage = await page.metrics();
    const memoryMB = memoryUsage.JSHeapUsedSize / 1024 / 1024;
    
    // Test indicators functionality
    console.log('\n🎯 Testing Navigation Indicators:');
    const indicatorCount = await page.evaluate(() => {
      return document.querySelectorAll('nav[aria-label="Section navigation"] button').length;
    });
    
    console.log(`   Found ${indicatorCount} navigation indicators`);
    
    // Test debug panel (development mode)
    const debugPanelExists = await page.evaluate(() => {
      return !!document.querySelector('[class*="debug"]') || 
             !!document.querySelector('.fixed.bottom-4.left-4');
    });
    
    console.log(`   Debug Panel: ${debugPanelExists ? '✅ Active' : '❌ Not Found'}`);
    
    // Generate report
    console.log('\n📊 PERFORMANCE RESULTS');
    console.log('========================');
    console.log(`🚀 Page Load Time: ${loadTime}ms`);
    console.log(`📈 Scroll Events Processed: ${scrollEventCount} in 3s`);
    console.log(`🎯 Average FPS: ${avgFPS ? avgFPS.toFixed(1) : 'N/A'}`);
    console.log(`💾 Memory Usage: ${memoryMB.toFixed(2)}MB`);
    console.log(`🔢 Sections: ${sectionCount}`);
    console.log(`🧭 Indicators: ${indicatorCount}`);
    console.log(`🐛 Debug Panel: ${debugPanelExists ? 'Active' : 'Disabled'}`);
    
    // Grade calculation
    let grade = 'A+';
    if (loadTime > 3000) grade = 'B';
    if (avgFPS && avgFPS < 55) grade = 'B';
    if (memoryMB > 50) grade = 'B-';
    if (loadTime > 5000 || (avgFPS && avgFPS < 45)) grade = 'C';
    
    console.log(`\n🏆 Overall Grade: ${grade}`);
    
    // Production readiness assessment
    const isProductionReady = loadTime < 3000 && 
                             (avgFPS === null || avgFPS >= 55) && 
                             memoryMB < 50 &&
                             sectionCount >= 6 &&
                             indicatorCount > 0;
    
    console.log(`\n🚀 Production Ready: ${isProductionReady ? '✅ YES' : '❌ NO'}`);
    
    if (isProductionReady) {
      console.log('\n🎉 The scroll system is optimized and ready for deployment!');
    } else {
      console.log('\n⚠️  Some optimizations may be needed before deployment.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

quickScrollTest().catch(console.error);