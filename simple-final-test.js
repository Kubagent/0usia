#!/usr/bin/env node

/**
 * Simple Final Test - Confirm Production Readiness
 */

const puppeteer = require('puppeteer');

async function simpleFinalTest() {
  console.log('🎯 Simple Final Validation');
  console.log('==========================');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    const startTime = Date.now();
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    // Basic functionality check
    const basicCheck = await page.evaluate(() => {
      return {
        scrollContainer: !!document.querySelector('.optimized-scroll-container'),
        heroSection: !!document.querySelector('.hero-section'),
        sections: document.querySelectorAll('.scroll-snap-section').length,
        indicators: document.querySelectorAll('nav[aria-label="Section navigation"] button').length,
        hasContent: document.body.textContent.length > 1000,
      };
    });
    
    const memoryUsage = await page.metrics();
    const memoryMB = memoryUsage.JSHeapUsedSize / 1024 / 1024;
    
    console.log('\n📊 Final Results:');
    console.log(`   Load Time: ${loadTime}ms ${loadTime < 3000 ? '✅' : '❌'}`);
    console.log(`   Memory Usage: ${memoryMB.toFixed(2)}MB ${memoryMB < 50 ? '✅' : '❌'}`);
    console.log(`   Scroll Container: ${basicCheck.scrollContainer ? '✅' : '❌'}`);
    console.log(`   Hero Section: ${basicCheck.heroSection ? '✅' : '❌'}`);
    console.log(`   Total Sections: ${basicCheck.sections} ${basicCheck.sections >= 6 ? '✅' : '❌'}`);
    console.log(`   Navigation Indicators: ${basicCheck.indicators} ${basicCheck.indicators >= 6 ? '✅' : '❌'}`);
    console.log(`   Has Content: ${basicCheck.hasContent ? '✅' : '❌'}`);
    
    const allChecks = [
      loadTime < 3000,
      memoryMB < 50,
      basicCheck.scrollContainer,
      basicCheck.heroSection,
      basicCheck.sections >= 6,
      basicCheck.indicators >= 6,
      basicCheck.hasContent,
    ];
    
    const passCount = allChecks.filter(Boolean).length;
    const totalChecks = allChecks.length;
    
    console.log(`\n🏆 Overall: ${passCount}/${totalChecks} checks passed`);
    
    if (passCount === totalChecks) {
      console.log('🚀 PRODUCTION READY - All systems functional!');
    } else if (passCount >= totalChecks * 0.8) {
      console.log('⚠️ MOSTLY READY - Minor issues detected');
    } else {
      console.log('❌ NEEDS ATTENTION - Major issues found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

simpleFinalTest().catch(console.error);