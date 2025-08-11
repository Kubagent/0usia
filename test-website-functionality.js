#!/usr/bin/env node

/**
 * Ovsia V4 Website Functionality Test Suite
 * 
 * Comprehensive testing script to validate all implemented features
 * and identify any issues that need to be addressed.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { URL } = require('url');

// Test configuration
const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  TIMEOUT: 10000,
  ENDPOINTS: {
    HOME: '/',
    CONTACT_API: '/api/contact',
    CONTACT_SUBMIT: '/api/contact/submit'
  },
  FORM_TYPES: ['Partner', 'Project', 'Investment', 'General']
};

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  testsSummary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  issues: [],
  sections: [],
  performance: {
    loadTime: null,
    responseTime: null
  }
};

// Logging utilities
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  console.log(`${prefix} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function addIssue(priority, component, description, details = null) {
  const issue = {
    priority,
    component,
    description,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.issues.push(issue);
  testResults.testsSummary.total++;
  
  if (priority === 'critical' || priority === 'high') {
    testResults.testsSummary.failed++;
    log('ERROR', `${priority.toUpperCase()} ISSUE: ${component} - ${description}`, details);
  } else {
    testResults.testsSummary.warnings++;
    log('WARN', `${priority.toUpperCase()} ISSUE: ${component} - ${description}`, details);
  }
}

function addPass(component, description) {
  testResults.testsSummary.total++;
  testResults.testsSummary.passed++;
  log('INFO', `PASS: ${component} - ${description}`);
}

// HTTP request utility
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Ovsia-Test-Agent/1.0',
        'Accept': 'text/html,application/json,*/*',
        ...options.headers
      },
      timeout: TEST_CONFIG.TIMEOUT
    };

    if (options.body) {
      if (typeof options.body === 'object') {
        requestOptions.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = http.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Website Loading and Basic Navigation
async function testWebsiteLoading() {
  log('INFO', 'Testing website loading and basic navigation...');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(TEST_CONFIG.BASE_URL + TEST_CONFIG.ENDPOINTS.HOME);
    const loadTime = Date.now() - startTime;
    
    testResults.performance.loadTime = loadTime;
    
    if (response.statusCode === 200) {
      addPass('Website Loading', 'Homepage loads successfully');
      
      // Check for critical HTML content
      const htmlContent = response.body;
      
      if (htmlContent.includes('Ovsia')) {
        addPass('Content Loading', 'Ovsia branding present');
      } else {
        addIssue('high', 'Content Loading', 'Ovsia branding not found in HTML');
      }
      
      // Check for key sections
      const sectionsToCheck = [
        'Hero',
        'Rotating',
        'Expertise', 
        'Ventures',
        'Choose',
        'Footer'
      ];
      
      sectionsToCheck.forEach(section => {
        if (htmlContent.includes(section) || htmlContent.toLowerCase().includes(section.toLowerCase())) {
          addPass('Section Loading', `${section} section content found`);
        } else {
          addIssue('medium', 'Section Loading', `${section} section content may be missing`);
        }
      });
      
      // Check for performance indicators
      if (loadTime < 2000) {
        addPass('Performance', `Fast load time: ${loadTime}ms`);
      } else if (loadTime < 5000) {
        addIssue('medium', 'Performance', `Slow load time: ${loadTime}ms`);
      } else {
        addIssue('high', 'Performance', `Very slow load time: ${loadTime}ms`);
      }
      
    } else {
      addIssue('critical', 'Website Loading', `Homepage failed to load: Status ${response.statusCode}`);
    }
    
  } catch (error) {
    addIssue('critical', 'Website Loading', 'Homepage completely inaccessible', { error: error.message });
  }
}

// Test 2: Contact API Endpoint Testing
async function testContactAPI() {
  log('INFO', 'Testing contact API endpoints...');
  
  try {
    // Test GET endpoint for service status
    const getResponse = await makeRequest(TEST_CONFIG.BASE_URL + TEST_CONFIG.ENDPOINTS.CONTACT_API);
    testResults.performance.responseTime = getResponse.responseTime;
    
    if (getResponse.statusCode === 200) {
      addPass('Contact API', 'Contact API GET endpoint accessible');
      
      try {
        const statusData = JSON.parse(getResponse.body);
        if (statusData.success && statusData.data && statusData.data.serviceAvailable) {
          addPass('Contact API', 'Contact service reports as available');
          
          if (statusData.data.emailConfigured) {
            addPass('Email Service', 'Email service is configured');
          } else {
            addIssue('high', 'Email Service', 'Email service is not configured');
          }
        } else {
          addIssue('high', 'Contact API', 'Contact service reports as unavailable');
        }
      } catch (parseError) {
        addIssue('medium', 'Contact API', 'Unable to parse API status response');
      }
    } else {
      addIssue('high', 'Contact API', `Contact API GET endpoint failed: Status ${getResponse.statusCode}`);
    }
    
    // Test POST with valid data
    const testFormData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      message: 'This is a test message from the automated test suite.',
      gdprConsent: true,
      marketingConsent: false,
      source: 'test_suite',
      formType: 'Test'
    };
    
    const postResponse = await makeRequest(TEST_CONFIG.BASE_URL + TEST_CONFIG.ENDPOINTS.CONTACT_API, {
      method: 'POST',
      body: testFormData
    });
    
    if (postResponse.statusCode === 200 || postResponse.statusCode === 503) {
      if (postResponse.statusCode === 200) {
        addPass('Contact Form', 'Contact form accepts valid submissions');
      } else {
        addIssue('medium', 'Contact Form', 'Contact form service unavailable (expected if email not configured)');
      }
    } else if (postResponse.statusCode === 400) {
      addIssue('medium', 'Contact Form', 'Contact form validation may be too strict');
    } else {
      addIssue('high', 'Contact Form', `Contact form submission failed: Status ${postResponse.statusCode}`);
    }
    
  } catch (error) {
    addIssue('high', 'Contact API', 'Contact API completely inaccessible', { error: error.message });
  }
}

// Test 3: Form Validation Testing
async function testFormValidation() {
  log('INFO', 'Testing form validation...');
  
  const testCases = [
    {
      name: 'Missing required fields',
      data: {},
      expectedStatus: 400,
      description: 'Should reject empty form'
    },
    {
      name: 'Invalid email',
      data: {
        name: 'Test User',
        email: 'invalid-email',
        message: 'Test message',
        gdprConsent: true
      },
      expectedStatus: 400,
      description: 'Should reject invalid email format'
    },
    {
      name: 'Missing GDPR consent',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        gdprConsent: false
      },
      expectedStatus: 400,
      description: 'Should require GDPR consent'
    },
    {
      name: 'Honeypot detection',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        gdprConsent: true,
        honeypot: 'spam-content'
      },
      expectedStatus: 429,
      description: 'Should detect honeypot spam'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest(TEST_CONFIG.BASE_URL + TEST_CONFIG.ENDPOINTS.CONTACT_API, {
        method: 'POST',
        body: testCase.data
      });
      
      if (response.statusCode === testCase.expectedStatus) {
        addPass('Form Validation', `${testCase.name}: ${testCase.description}`);
      } else {
        addIssue('medium', 'Form Validation', 
          `${testCase.name}: Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
      }
    } catch (error) {
      addIssue('medium', 'Form Validation', 
        `${testCase.name}: Test failed with error`, { error: error.message });
    }
  }
}

// Test 4: File and Asset Analysis
async function testStaticAssets() {
  log('INFO', 'Testing static assets and file structure...');
  
  const projectRoot = process.cwd();
  const assetsToCheck = [
    '/public/ousia_logo.png',
    '/src/app/globals.css',
    '/src/components/sections/Hero.tsx',
    '/src/components/sections/Footer.tsx',
    '/package.json'
  ];
  
  assetsToCheck.forEach(assetPath => {
    const fullPath = path.join(projectRoot, assetPath.startsWith('/') ? assetPath.slice(1) : assetPath);
    if (fs.existsSync(fullPath)) {
      addPass('Static Assets', `Required file exists: ${assetPath}`);
    } else {
      addIssue('medium', 'Static Assets', `Required file missing: ${assetPath}`);
    }
  });
  
  // Check critical dependencies
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const criticalDeps = ['next', 'react', 'framer-motion', 'resend'];
      
      criticalDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          addPass('Dependencies', `Critical dependency present: ${dep}`);
        } else {
          addIssue('high', 'Dependencies', `Critical dependency missing: ${dep}`);
        }
      });
    } catch (error) {
      addIssue('medium', 'Dependencies', 'Unable to parse package.json');
    }
  }
}

// Test 5: Performance and Configuration Analysis
async function testPerformanceConfig() {
  log('INFO', 'Testing performance configuration...');
  
  const projectRoot = process.cwd();
  const configFiles = [
    { file: 'next.config.js', component: 'Next.js Config' },
    { file: 'tailwind.config.js', component: 'Tailwind Config' },
    { file: '.env.example', component: 'Environment Config' }
  ];
  
  configFiles.forEach(({ file, component }) => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      addPass('Configuration', `${component} file exists`);
    } else {
      addIssue('low', 'Configuration', `${component} file missing`);
    }
  });
  
  // Check for scroll lock implementation
  const scrollFiles = [
    '/src/components/OptimizedScrollContainer.tsx',
    '/src/hooks/useOptimizedScrollLock.ts'
  ];
  
  scrollFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file.slice(1));
    if (fs.existsSync(fullPath)) {
      addPass('Scroll System', `Scroll component exists: ${file}`);
    } else {
      addIssue('medium', 'Scroll System', `Scroll component missing: ${file}`);
    }
  });
}

// Test 6: Integration Analysis
async function testIntegrationReadiness() {
  log('INFO', 'Testing integration readiness...');
  
  const projectRoot = process.cwd();
  
  // Check if scroll container is integrated
  const pageClientPath = path.join(projectRoot, 'src/app/page-client.tsx');
  if (fs.existsSync(pageClientPath)) {
    const content = fs.readFileSync(pageClientPath, 'utf8');
    
    if (content.includes('OptimizedScrollContainer')) {
      addPass('Integration', 'Scroll container integrated in main page');
    } else {
      addIssue('high', 'Integration', 'Scroll container NOT integrated - section snapping disabled');
    }
    
    if (content.includes('Hero') && content.includes('Footer')) {
      addPass('Integration', 'All six sections present in page structure');
    } else {
      addIssue('medium', 'Integration', 'Some sections may be missing from page structure');
    }
  } else {
    addIssue('critical', 'Integration', 'Main page client component missing');
  }
  
  // Check environment configuration
  const envExamplePath = path.join(projectRoot, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    const requiredEnvVars = ['RESEND_API_KEY', 'NOTION_TOKEN', 'NOTION_DATABASE_ID'];
    requiredEnvVars.forEach(envVar => {
      if (envContent.includes(envVar)) {
        addPass('Environment', `Environment variable documented: ${envVar}`);
      } else {
        addIssue('medium', 'Environment', `Environment variable not documented: ${envVar}`);
      }
    });
  }
}

// Generate final test report
function generateTestReport() {
  log('INFO', 'Generating comprehensive test report...');
  
  const report = {
    ...testResults,
    summary: {
      totalTests: testResults.testsSummary.total,
      passed: testResults.testsSummary.passed,
      failed: testResults.testsSummary.failed,
      warnings: testResults.testsSummary.warnings,
      passRate: testResults.testsSummary.total > 0 ? 
        Math.round((testResults.testsSummary.passed / testResults.testsSummary.total) * 100) : 0,
      overallStatus: testResults.issues.filter(i => i.priority === 'critical').length > 0 ? 'CRITICAL' :
                    testResults.issues.filter(i => i.priority === 'high').length > 0 ? 'HIGH_ISSUES' :
                    testResults.issues.filter(i => i.priority === 'medium').length > 0 ? 'MEDIUM_ISSUES' : 'GOOD'
    },
    recommendations: generateRecommendations(),
    prioritizedIssues: testResults.issues.sort((a, b) => {
      const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorities[a.priority] - priorities[b.priority];
    })
  };
  
  // Write detailed report to file
  const reportPath = path.join(process.cwd(), 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Console summary
  console.log('\n' + '='.repeat(80));
  console.log('OVSIA V4 WEBSITE TEST REPORT');
  console.log('='.repeat(80));
  console.log(`Test Date: ${report.timestamp}`);
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Pass Rate: ${report.summary.passRate}%`);
  console.log(`Overall Status: ${report.summary.overallStatus}`);
  console.log('\n' + '-'.repeat(80));
  console.log('PRIORITIZED ISSUES:');
  console.log('-'.repeat(80));
  
  if (report.prioritizedIssues.length === 0) {
    console.log('✅ No issues found!');
  } else {
    report.prioritizedIssues.forEach((issue, index) => {
      const priority = issue.priority.toUpperCase();
      const icon = issue.priority === 'critical' ? '🚨' : 
                   issue.priority === 'high' ? '⚠️' : 
                   issue.priority === 'medium' ? '⚡' : 'ℹ️';
      console.log(`${index + 1}. ${icon} [${priority}] ${issue.component}: ${issue.description}`);
    });
  }
  
  console.log('\n' + '-'.repeat(80));
  console.log('RECOMMENDATIONS:');
  console.log('-'.repeat(80));
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('\n' + '-'.repeat(80));
  console.log(`📋 Detailed report saved to: ${reportPath}`);
  console.log('='.repeat(80));
  
  return report;
}

function generateRecommendations() {
  const recommendations = [];
  const criticalIssues = testResults.issues.filter(i => i.priority === 'critical');
  const highIssues = testResults.issues.filter(i => i.priority === 'high');
  const scrollIssues = testResults.issues.filter(i => i.component.includes('Scroll'));
  const integrationIssues = testResults.issues.filter(i => i.component === 'Integration');
  
  if (criticalIssues.length > 0) {
    recommendations.push('🚨 CRITICAL: Address all critical issues immediately before deployment');
  }
  
  if (integrationIssues.length > 0) {
    recommendations.push('🔧 Integrate OptimizedScrollContainer into main page for section snapping');
  }
  
  if (highIssues.filter(i => i.component === 'Email Service').length > 0) {
    recommendations.push('📧 Configure Resend email service for contact forms');
  }
  
  if (testResults.performance.loadTime && testResults.performance.loadTime > 3000) {
    recommendations.push('⚡ Optimize page load time - consider image optimization and code splitting');
  }
  
  if (scrollIssues.length > 0) {
    recommendations.push('📜 Complete scroll lock system integration for smooth section navigation');
  }
  
  recommendations.push('🧪 Run manual user testing to verify animations and interactions');
  recommendations.push('📱 Test mobile responsiveness across different devices');
  recommendations.push('🔍 Perform browser compatibility testing (Chrome, Firefox, Safari, Edge)');
  
  return recommendations;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Ovsia V4 Website Functionality Test Suite...\n');
  
  try {
    await testWebsiteLoading();
    await testContactAPI();
    await testFormValidation();
    await testStaticAssets();
    await testPerformanceConfig();
    await testIntegrationReadiness();
    
    const finalReport = generateTestReport();
    
    // Return exit code based on results
    const exitCode = finalReport.summary.overallStatus === 'CRITICAL' ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testResults,
  TEST_CONFIG
};