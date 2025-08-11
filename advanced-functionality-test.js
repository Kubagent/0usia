#!/usr/bin/env node

/**
 * Advanced Ovsia V4 Functionality Tests
 * 
 * Deep testing of animations, interactions, and edge cases
 */

const fs = require('fs');
const path = require('path');

// Advanced test results
let advancedResults = {
  timestamp: new Date().toISOString(),
  sectionsAnalysis: [],
  animationTests: [],
  integrationIssues: [],
  performanceIssues: [],
  recommendations: []
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function analyzeSection(sectionFile, sectionName) {
  const filePath = path.join(process.cwd(), 'src/components/sections', sectionFile);
  
  if (!fs.existsSync(filePath)) {
    return {
      name: sectionName,
      status: 'missing',
      issues: ['File does not exist'],
      features: []
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const analysis = {
    name: sectionName,
    status: 'present',
    issues: [],
    features: [],
    dependencies: [],
    animations: []
  };
  
  // Check for Framer Motion usage
  if (content.includes('framer-motion') || content.includes('motion.')) {
    analysis.features.push('Framer Motion animations');
    if (content.includes('whileHover')) analysis.animations.push('hover');
    if (content.includes('whileInView')) analysis.animations.push('scroll-triggered');
    if (content.includes('AnimatePresence')) analysis.animations.push('enter/exit');
  }
  
  // Check for state management
  if (content.includes('useState')) analysis.features.push('state management');
  if (content.includes('useEffect')) analysis.features.push('lifecycle effects');
  
  // Check for potential issues
  if (content.includes('window.') && !content.includes('mounted')) {
    analysis.issues.push('Direct window access without mount check');
  }
  
  if (content.includes('setTimeout') || content.includes('setInterval')) {
    if (!content.includes('clearTimeout') && !content.includes('clearInterval')) {
      analysis.issues.push('Timer not properly cleaned up');
    }
  }
  
  // Check for accessibility
  if (!content.includes('aria-')) analysis.issues.push('No ARIA labels detected');
  if (!content.includes('alt=')) analysis.issues.push('No alt text for images');
  
  return analysis;
}

function analyzeSections() {
  log('INFO', 'Analyzing all six sections...');
  
  const sections = [
    { file: 'Hero.tsx', name: 'Hero Section' },
    { file: '../RotatingWordAnimation.tsx', name: 'Rotating Word Section' },
    { file: 'ExpertiseShowcase.tsx', name: 'Expertise Section' },
    { file: 'VenturesCarousel.tsx', name: 'Ventures Section' },
    { file: 'ThreeCardCTA.tsx', name: 'Choose Path Section' },
    { file: 'Footer.tsx', name: 'Footer Section' }
  ];
  
  sections.forEach(section => {
    const analysis = analyzeSection(section.file, section.name);
    advancedResults.sectionsAnalysis.push(analysis);
    
    log('INFO', `Analyzed ${section.name}:`, {
      status: analysis.status,
      features: analysis.features.length,
      issues: analysis.issues.length,
      animations: analysis.animations
    });
  });
}

function analyzeScrollIntegration() {
  log('INFO', 'Analyzing scroll system integration...');
  
  const pageClientPath = path.join(process.cwd(), 'src/app/page-client.tsx');
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  
  if (fs.existsSync(pageClientPath)) {
    const content = fs.readFileSync(pageClientPath, 'utf8');
    
    if (!content.includes('OptimizedScrollContainer')) {
      advancedResults.integrationIssues.push({
        component: 'Page Structure',
        issue: 'Scroll container not integrated',
        severity: 'high',
        description: 'The OptimizedScrollContainer is not wrapped around the sections, disabling section snapping'
      });
    }
    
    // Check section structure
    const sectionMatches = content.match(/Section \d:|min-h-screen/g) || [];
    if (sectionMatches.length < 6) {
      advancedResults.integrationIssues.push({
        component: 'Section Structure',
        issue: 'Incomplete section count',
        severity: 'medium',
        description: 'Less than 6 sections detected in the page structure'
      });
    }
    
    // Check background transitions
    if (!content.includes('bg-black') || !content.includes('bg-white')) {
      advancedResults.integrationIssues.push({
        component: 'Background Transitions',
        issue: 'Background transitions may not work',
        severity: 'medium',
        description: 'Missing alternating background colors for sections'
      });
    }
  }
  
  // Check layout for scroll optimization
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (!layoutContent.includes('overflow-x-hidden')) {
      advancedResults.performanceIssues.push({
        component: 'Layout',
        issue: 'Missing horizontal overflow control',
        severity: 'low',
        description: 'May cause horizontal scrollbars on some content'
      });
    }
  }
}

function analyzePerformanceOptimizations() {
  log('INFO', 'Analyzing performance optimizations...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (!fs.existsSync(nextConfigPath)) {
    advancedResults.performanceIssues.push({
      component: 'Next.js Config',
      issue: 'No Next.js config file',
      severity: 'medium',
      description: 'Missing potential optimizations like image optimization, compression, etc.'
    });
  }
  
  // Check for image optimization
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir, { recursive: true });
    const imageFiles = files.filter(file => 
      typeof file === 'string' && /\.(png|jpg|jpeg|webp|avif)$/i.test(file)
    );
    
    imageFiles.forEach(imageFile => {
      const imagePath = path.join(publicDir, imageFile);
      const stats = fs.statSync(imagePath);
      
      // Check for large images (>500KB)
      if (stats.size > 500 * 1024) {
        advancedResults.performanceIssues.push({
          component: 'Images',
          issue: `Large image file: ${imageFile}`,
          severity: 'medium',
          description: `Image is ${Math.round(stats.size / 1024)}KB - consider optimization`
        });
      }
    });
  }
}

function analyzeContactFormImplementation() {
  log('INFO', 'Analyzing contact form implementation...');
  
  const threeCardPath = path.join(process.cwd(), 'src/components/sections/ThreeCardCTA.tsx');
  if (fs.existsSync(threeCardPath)) {
    const content = fs.readFileSync(threeCardPath, 'utf8');
    
    // Check form types
    const formTypes = ['partnership', 'project', 'investment'];
    formTypes.forEach(type => {
      if (!content.includes(type)) {
        advancedResults.integrationIssues.push({
          component: 'Contact Forms',
          issue: `Missing ${type} form type`,
          severity: 'medium',
          description: `The ${type} form type is not implemented`
        });
      }
    });
    
    // Check GDPR implementation
    if (!content.includes('gdprConsent')) {
      advancedResults.integrationIssues.push({
        component: 'Contact Forms',
        issue: 'Missing GDPR compliance',
        severity: 'high',
        description: 'GDPR consent handling not implemented'
      });
    }
    
    // Check honeypot
    if (!content.includes('honeypot')) {
      advancedResults.integrationIssues.push({
        component: 'Contact Forms',
        issue: 'Missing spam protection',
        severity: 'medium',
        description: 'Honeypot anti-spam field not implemented'
      });
    }
    
    // Check file upload
    if (!content.includes('file') && !content.includes('attachment')) {
      advancedResults.integrationIssues.push({
        component: 'Contact Forms',
        issue: 'Missing file upload',
        severity: 'low',
        description: 'File upload functionality not implemented'
      });
    }
  }
}

function analyzeValidationLibrary() {
  log('INFO', 'Analyzing validation library...');
  
  const validationPath = path.join(process.cwd(), 'src/lib/validation.ts');
  if (fs.existsSync(validationPath)) {
    const content = fs.readFileSync(validationPath, 'utf8');
    
    // Check for proper null checking (this was causing the error we saw)
    if (content.includes('.trim()') && !content.includes('?.trim()')) {
      advancedResults.integrationIssues.push({
        component: 'Validation',
        issue: 'Missing null checks in sanitizeString',
        severity: 'high',
        description: 'The validation function may crash on null/undefined values'
      });
    }
  } else {
    advancedResults.integrationIssues.push({
      component: 'Validation',
      issue: 'Missing validation library',
      severity: 'high',
      description: 'The validation.ts file is required for form processing'
    });
  }
}

function generateAdvancedRecommendations() {
  log('INFO', 'Generating advanced recommendations...');
  
  const recommendations = [];
  
  // Critical issues first
  const criticalIssues = advancedResults.integrationIssues.filter(i => i.severity === 'high');
  if (criticalIssues.length > 0) {
    recommendations.push('🚨 CRITICAL: Fix validation null checks in src/lib/validation.ts');
    recommendations.push('🔧 CRITICAL: Integrate OptimizedScrollContainer in src/app/page-client.tsx');
  }
  
  // Animation issues
  const sectionsWithIssues = advancedResults.sectionsAnalysis.filter(s => s.issues.length > 0);
  if (sectionsWithIssues.length > 0) {
    recommendations.push('🎨 Improve accessibility by adding ARIA labels to all sections');
    recommendations.push('⚡ Add proper cleanup for timers and effects');
  }
  
  // Performance issues
  if (advancedResults.performanceIssues.length > 0) {
    recommendations.push('📊 Optimize large images in the public directory');
    recommendations.push('⚙️ Add Next.js config for performance optimizations');
  }
  
  // Integration improvements
  recommendations.push('📱 Test mobile responsiveness and touch interactions');
  recommendations.push('🔗 Test all external links and navigation');
  recommendations.push('🧪 Add automated tests for critical user flows');
  recommendations.push('🎭 Test animations in reduced motion mode');
  
  advancedResults.recommendations = recommendations;
}

function generateAdvancedReport() {
  log('INFO', 'Generating advanced functionality report...');
  
  const report = {
    ...advancedResults,
    summary: {
      sectionsAnalyzed: advancedResults.sectionsAnalysis.length,
      sectionsWithIssues: advancedResults.sectionsAnalysis.filter(s => s.issues.length > 0).length,
      totalIssues: advancedResults.integrationIssues.length + advancedResults.performanceIssues.length,
      criticalIssues: advancedResults.integrationIssues.filter(i => i.severity === 'high').length,
      overallReadiness: (() => {
        const criticalCount = advancedResults.integrationIssues.filter(i => i.severity === 'high').length;
        if (criticalCount > 0) return 'NOT_READY';
        if (advancedResults.integrationIssues.length > 2) return 'NEEDS_WORK';
        return 'READY';
      })()
    }
  };
  
  // Write detailed report
  const reportPath = path.join(process.cwd(), 'advanced-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Console summary
  console.log('\n' + '='.repeat(80));
  console.log('OVSIA V4 ADVANCED FUNCTIONALITY ANALYSIS');
  console.log('='.repeat(80));
  console.log(`Analysis Date: ${report.timestamp}`);
  console.log(`Sections Analyzed: ${report.summary.sectionsAnalyzed}`);
  console.log(`Sections with Issues: ${report.summary.sectionsWithIssues}`);
  console.log(`Total Issues Found: ${report.summary.totalIssues}`);
  console.log(`Critical Issues: ${report.summary.criticalIssues}`);
  console.log(`Overall Readiness: ${report.summary.overallReadiness}`);
  
  console.log('\n' + '-'.repeat(80));
  console.log('SECTION ANALYSIS SUMMARY:');
  console.log('-'.repeat(80));
  
  advancedResults.sectionsAnalysis.forEach((section, index) => {
    const statusIcon = section.status === 'present' ? '✅' : '❌';
    const issueCount = section.issues.length;
    const featureCount = section.features.length;
    
    console.log(`${index + 1}. ${statusIcon} ${section.name}: ${featureCount} features, ${issueCount} issues`);
    if (section.animations.length > 0) {
      console.log(`   🎨 Animations: ${section.animations.join(', ')}`);
    }
    if (issueCount > 0) {
      section.issues.forEach(issue => {
        console.log(`   ⚠️ ${issue}`);
      });
    }
  });
  
  if (report.integrationIssues.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('INTEGRATION ISSUES:');
    console.log('-'.repeat(80));
    report.integrationIssues.forEach((issue, index) => {
      const severityIcon = issue.severity === 'high' ? '🚨' : 
                          issue.severity === 'medium' ? '⚠️' : 'ℹ️';
      console.log(`${index + 1}. ${severityIcon} [${issue.severity.toUpperCase()}] ${issue.component}: ${issue.issue}`);
      console.log(`   ${issue.description}`);
    });
  }
  
  if (report.performanceIssues.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('PERFORMANCE ISSUES:');
    console.log('-'.repeat(80));
    report.performanceIssues.forEach((issue, index) => {
      const severityIcon = issue.severity === 'high' ? '🚨' : 
                          issue.severity === 'medium' ? '⚠️' : 'ℹ️';
      console.log(`${index + 1}. ${severityIcon} [${issue.severity.toUpperCase()}] ${issue.component}: ${issue.issue}`);
      console.log(`   ${issue.description}`);
    });
  }
  
  console.log('\n' + '-'.repeat(80));
  console.log('ADVANCED RECOMMENDATIONS:');
  console.log('-'.repeat(80));
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('\n' + '-'.repeat(80));
  console.log(`📋 Detailed report saved to: ${reportPath}`);
  console.log('='.repeat(80));
  
  return report;
}

// Main execution
async function runAdvancedTests() {
  console.log('🔬 Starting Advanced Ovsia V4 Functionality Analysis...\n');
  
  try {
    analyzeSections();
    analyzeScrollIntegration();
    analyzePerformanceOptimizations();
    analyzeContactFormImplementation();
    analyzeValidationLibrary();
    generateAdvancedRecommendations();
    
    const finalReport = generateAdvancedReport();
    
    // Return exit code based on readiness
    const exitCode = finalReport.summary.overallReadiness === 'NOT_READY' ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Advanced test analysis failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAdvancedTests();
}

module.exports = { runAdvancedTests, advancedResults };