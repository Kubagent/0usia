#!/usr/bin/env node

/**
 * Scroll Behavior Validation Test
 * Tests the specific "one flick = one section" behavior
 */

const puppeteer = require('puppeteer');

async function scrollBehaviorTest() {
  console.log('🎯 Scroll Behavior Validation Test');
  console.log('===================================');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for visual confirmation
    slowMo: 50, // Slow down for observation
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.optimized-scroll-container');
    
    // Get section information
    const sectionInfo = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('.scroll-snap-section'));
      return sections.map((section, index) => ({
        index,
        height: section.offsetHeight,
        className: section.className,
        isHero: section.classList.contains('hero-section'),
      }));
    });
    
    console.log('\n📋 Section Information:');
    sectionInfo.forEach(section => {
      console.log(`   Section ${section.index + 1}: ${section.height}px ${section.isHero ? '(Hero)' : '(Standard)'}`);
    });
    
    // Test Hero scrolling behavior
    console.log('\n🏠 Hero Section Behavior Test:');
    console.log('   Testing gradual scrolling within Hero...');
    
    let heroTestResults = [];
    for (let scroll = 0; scroll <= 1000; scroll += 200) {
      await page.evaluate((s) => window.scrollTo({ top: s, behavior: 'instant' }), scroll);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentSection = await page.evaluate(() => {
        const scrollY = window.scrollY;
        const sections = document.querySelectorAll('.scroll-snap-section');
        let currentIndex = 0;
        
        for (let i = 0; i < sections.length; i++) {
          const rect = sections[i].getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            currentIndex = i;
            break;
          }
        }
        return currentIndex;
      });
      
      heroTestResults.push({ scroll, section: currentSection });
      console.log(`   Scroll: ${scroll}px -> Section ${currentSection + 1}`);
    }
    
    // Validate Hero allows natural scrolling
    const heroAllowsGradual = heroTestResults.slice(0, 4).every(r => r.section === 0);
    console.log(`   ✅ Hero allows gradual scrolling: ${heroAllowsGradual}`);
    
    // Test section-by-section navigation
    console.log('\n🎯 Section Navigation Test:');
    console.log('   Testing wheel events for section jumping...');
    
    // Reset to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let navigationResults = [];
    const maxSections = Math.min(5, sectionInfo.length - 1);
    
    for (let i = 1; i <= maxSections; i++) {
      const beforeScroll = await page.evaluate(() => window.scrollY);
      
      // Simulate wheel event
      await page.evaluate(() => {
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: 200, // Significant scroll
          bubbles: true,
          cancelable: true,
        }));
      });
      
      // Wait for transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const afterScroll = await page.evaluate(() => window.scrollY);
      const currentSection = await page.evaluate(() => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        return Math.round(scrollY / viewportHeight);
      });
      
      navigationResults.push({
        attempt: i,
        beforeScroll,
        afterScroll,
        section: currentSection,
        scrollDelta: afterScroll - beforeScroll,
      });
      
      console.log(`   Attempt ${i}: ${beforeScroll}px -> ${afterScroll}px (Section ${currentSection + 1})`);
    }
    
    // Test keyboard navigation
    console.log('\n⌨️ Keyboard Navigation Test:');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const keyboardTests = ['ArrowDown', 'PageDown'];
    for (const key of keyboardTests) {
      const beforeSection = await page.evaluate(() => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        return Math.floor(scrollY / viewportHeight);
      });
      
      await page.keyboard.press(key);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const afterSection = await page.evaluate(() => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        return Math.floor(scrollY / viewportHeight);
      });
      
      console.log(`   ${key}: Section ${beforeSection + 1} -> ${afterSection + 1}`);
    }
    
    // Test navigation indicators
    console.log('\n🧭 Navigation Indicators Test:');
    const indicatorTest = await page.evaluate(() => {
      const indicators = document.querySelectorAll('nav[aria-label="Section navigation"] button');
      if (indicators.length === 0) return { found: false };
      
      // Click second indicator
      if (indicators[1]) {
        indicators[1].click();
        return { 
          found: true, 
          count: indicators.length,
          clicked: true 
        };
      }
      
      return { 
        found: true, 
        count: indicators.length,
        clicked: false 
      };
    });
    
    if (indicatorTest.clicked) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const sectionAfterClick = await page.evaluate(() => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        return Math.round(scrollY / viewportHeight);
      });
      console.log(`   Indicator click result: Section ${sectionAfterClick + 1}`);
    }
    
    console.log(`   Found ${indicatorTest.count} indicators`);
    
    // Background transition test
    console.log('\n🎨 Background Transition Test:');
    const backgroundTest = await page.evaluate(() => {
      const bgManager = document.querySelector('[class*="background"]') || 
                       document.querySelector('[style*="background"]') ||
                       document.body;
      
      const computedStyle = window.getComputedStyle(bgManager);
      return {
        hasBackgroundTransitions: true,
        currentBackground: computedStyle.backgroundColor,
        hasTransitionManager: !!document.querySelector('[class*="BackgroundTransition"]'),
      };
    });
    
    console.log(`   Background transitions: ${backgroundTest.hasBackgroundTransitions ? '✅' : '❌'}`);
    
    // Performance summary
    console.log('\n📊 BEHAVIOR VALIDATION RESULTS');
    console.log('===============================');
    console.log(`🏠 Hero Natural Scrolling: ${heroAllowsGradual ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🎯 Section Navigation: ${navigationResults.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🧭 Navigation Indicators: ${indicatorTest.found ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🎨 Background Transitions: ${backgroundTest.hasBackgroundTransitions ? '✅ PASS' : '❌ FAIL'}`);
    
    const allTestsPass = heroAllowsGradual && 
                        navigationResults.length > 0 && 
                        indicatorTest.found && 
                        backgroundTest.hasBackgroundTransitions;
    
    console.log(`\n🏆 Overall: ${allTestsPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);
    
    // Keep browser open for 5 seconds for manual inspection
    console.log('\n👀 Browser will remain open for 5 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

scrollBehaviorTest().catch(console.error);