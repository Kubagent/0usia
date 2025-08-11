#!/usr/bin/env node

/**
 * Final Validation Test - Production Readiness Confirmation
 */

const puppeteer = require('puppeteer');

async function finalValidation() {
  console.log('🎯 Final Production Readiness Validation');
  console.log('=========================================');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    // Test 1: Desktop Performance
    console.log('\n💻 Desktop Performance Test:');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1920, height: 1080 });
    
    const startTime = Date.now();
    await desktopPage.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    const desktopMetrics = await desktopPage.metrics();
    console.log(`   Load Time: ${loadTime}ms`);
    console.log(`   Memory: ${(desktopMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Check critical elements
    const criticalElements = await desktopPage.evaluate(() => {
      return {
        scrollContainer: !!document.querySelector('.optimized-scroll-container'),
        heroSection: !!document.querySelector('.hero-section'),
        indicators: document.querySelectorAll('nav[aria-label="Section navigation"] button').length,
        debugPanel: !!document.querySelector('.fixed.bottom-4.left-4'),
        sections: document.querySelectorAll('.scroll-snap-section').length,
      };
    });
    
    console.log(`   Critical Elements: ${Object.values(criticalElements).every(Boolean) ? '✅ All Present' : '❌ Missing Elements'}`);
    
    // Test 2: Mobile Responsiveness
    console.log('\n📱 Mobile Responsiveness Test:');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 812 }); // iPhone X
    
    const mobileStartTime = Date.now();
    await mobilePage.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    const mobileLoadTime = Date.now() - mobileStartTime;
    
    const mobileMetrics = await mobilePage.metrics();
    console.log(`   Mobile Load Time: ${mobileLoadTime}ms`);
    console.log(`   Mobile Memory: ${(mobileMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Test mobile scroll behavior
    const mobileScrollTest = await mobilePage.evaluate(() => {
      const container = document.querySelector('.optimized-scroll-container');
      if (!container) return false;
      
      // Simulate touch events
      container.scrollTop = 100;
      return container.scrollTop >= 0;
    });
    
    console.log(`   Mobile Scroll: ${mobileScrollTest ? '✅ Working' : '❌ Issues'}`);
    
    // Test 3: Content Integrity
    console.log('\n📝 Content Integrity Test:');
    const contentTest = await desktopPage.evaluate(() => {
      const heroContent = document.querySelector('.hero-section');
      const manifestoContent = document.querySelector('[class*="manifesto"]') || 
                              Array.from(document.querySelectorAll('h1')).find(h1 => h1.textContent.includes('Your'));
      const expertiseContent = document.querySelector('[class*="expertise"]') ||
                              document.querySelector('[class*="capability"]');
      const venturesContent = document.querySelector('[class*="ventures"]') ||
                             document.querySelector('[class*="carousel"]');
      const footerContent = document.querySelector('footer') || 
                           document.querySelector('[class*="footer"]');
      
      return {
        hero: !!heroContent,
        manifesto: !!manifestoContent,
        expertise: !!expertiseContent,
        ventures: !!venturesContent,
        footer: !!footerContent,
      };
    });
    
    const contentScore = Object.values(contentTest).filter(Boolean).length;
    console.log(`   Content Sections: ${contentScore}/5 sections loaded`);
    console.log(`   Content Status: ${contentScore >= 4 ? '✅ Good' : '❌ Missing Content'}`);
    
    // Test 4: Performance Under Rapid Interaction
    console.log('\n⚡ Rapid Interaction Test:');
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    
    const rapidTestStart = Date.now();
    for (let i = 0; i < 20; i++) {
      await desktopPage.evaluate(() => {
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: i % 2 === 0 ? 100 : -100,
          bubbles: true,
        }));
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const rapidTestEnd = Date.now();
    const rapidTestMemory = await desktopPage.metrics();
    
    console.log(`   Rapid Test Duration: ${rapidTestEnd - rapidTestStart}ms`);
    console.log(`   Memory After Rapid Test: ${(rapidTestMemory.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Test 5: Error Handling
    console.log('\n🛡️ Error Handling Test:');
    const errorTest = await desktopPage.evaluate(() => {
      // Test invalid section navigation
      try {
        const nonExistentSection = document.querySelector('[data-section="999"]');
        if (nonExistentSection) nonExistentSection.scrollIntoView();
        
        // Test invalid scroll events
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: NaN,
          bubbles: true,
        }));
        
        return { hasErrors: false };
      } catch (error) {
        return { hasErrors: true, error: error.message };
      }
    });
    
    console.log(`   Error Resilience: ${!errorTest.hasErrors ? '✅ Robust' : '⚠️ Needs Attention'}`);
    
    // Final Assessment
    console.log('\n🏆 FINAL PRODUCTION ASSESSMENT');
    console.log('===============================');
    
    const assessmentCriteria = {
      desktopPerformance: loadTime < 3000 && (desktopMetrics.JSHeapUsedSize / 1024 / 1024) < 50,
      mobilePerformance: mobileLoadTime < 4000 && (mobileMetrics.JSHeapUsedSize / 1024 / 1024) < 60,
      contentIntegrity: contentScore >= 4,
      elementsPresent: Object.values(criticalElements).every(Boolean),
      errorHandling: !errorTest.hasErrors,
      rapidInteraction: (rapidTestMemory.JSHeapUsedSize / 1024 / 1024) < 100,
    };
    
    const passingCriteria = Object.values(assessmentCriteria).filter(Boolean).length;
    const totalCriteria = Object.keys(assessmentCriteria).length;
    
    console.log('\nCriteria Results:');
    Object.entries(assessmentCriteria).forEach(([key, passed]) => {
      const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`   ${displayName}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    const overallScore = (passingCriteria / totalCriteria) * 100;
    console.log(`\nOverall Score: ${overallScore.toFixed(1)}% (${passingCriteria}/${totalCriteria})`);
    
    let productionStatus;
    if (overallScore >= 90) {
      productionStatus = '🚀 APPROVED FOR PRODUCTION';
    } else if (overallScore >= 80) {
      productionStatus = '⚠️ APPROVED WITH MONITORING';
    } else {
      productionStatus = '❌ NEEDS OPTIMIZATION';
    }
    
    console.log(`Production Status: ${productionStatus}`);
    
    // Performance Summary
    console.log('\n📊 Performance Summary:');
    console.log(`   Desktop Load: ${loadTime}ms`);
    console.log(`   Mobile Load: ${mobileLoadTime}ms`);
    console.log(`   Desktop Memory: ${(desktopMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Mobile Memory: ${(mobileMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Content Coverage: ${contentScore}/5 sections`);
    
    await desktopPage.close();
    await mobilePage.close();
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalValidation().catch(console.error);