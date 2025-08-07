/**
 * Notion CMS Testing Utilities
 * 
 * Provides utilities for testing Notion API connectivity and content validation
 * Can be used in development and CI/CD pipelines
 */

import { checkNotionConnection, NOTION_DATABASES } from './notion';
import { getAllSiteContent } from './content';
import { validateNotionEnvironment } from './fallback';
import { validateContentCompleteness } from './build-time-content';
import { logger } from './logger';
import type { SiteContent } from '@/types/notion';

export interface NotionTestResult {
  success: boolean;
  tests: {
    environment: TestResult;
    connectivity: TestResult;
    databases: TestResult;
    content: TestResult;
    validation: TestResult;
  };
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
  };
  timestamp: string;
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  warnings?: string[];
}

/**
 * Run comprehensive Notion CMS tests
 */
export async function runNotionTests(): Promise<NotionTestResult> {
  logger.info('notion', 'Starting Notion CMS test suite');
  
  const testResults: NotionTestResult = {
    success: false,
    tests: {
      environment: await testEnvironment(),
      connectivity: await testConnectivity(),
      databases: await testDatabases(),
      content: await testContent(),
      validation: await testValidation(),
    },
    summary: { passed: 0, failed: 0, warnings: 0, total: 5 },
    timestamp: new Date().toISOString(),
  };

  // Calculate summary
  Object.values(testResults.tests).forEach(test => {
    if (test.passed) {
      testResults.summary.passed++;
    } else {
      testResults.summary.failed++;
    }
    
    if (test.warnings && test.warnings.length > 0) {
      testResults.summary.warnings += test.warnings.length;
    }
  });

  testResults.success = testResults.summary.failed === 0;

  logger.info('notion', 'Notion CMS test suite completed', {
    success: testResults.success,
    passed: testResults.summary.passed,
    failed: testResults.summary.failed,
    warnings: testResults.summary.warnings,
  });

  return testResults;
}

/**
 * Test environment configuration
 */
async function testEnvironment(): Promise<TestResult> {
  try {
    const validation = validateNotionEnvironment();
    
    return {
      name: 'Environment Configuration',
      passed: validation.isValid,
      message: validation.isValid 
        ? 'All environment variables are properly configured'
        : `Missing or invalid environment variables: ${validation.missingVars.join(', ')}`,
      warnings: validation.warnings,
      details: {
        hasToken: !!process.env.NOTION_TOKEN,
        hasVenturesDb: !!process.env.NOTION_VENTURES_DB_ID,
        hasCapabilitiesDb: !!process.env.NOTION_CAPABILITIES_DB_ID,
        hasSiteCopyDb: !!process.env.NOTION_SITE_COPY_DB_ID,
        hasAssetsDb: !!process.env.NOTION_ASSETS_DB_ID,
        missingVars: validation.missingVars,
      },
    };
  } catch (error: any) {
    return {
      name: 'Environment Configuration',
      passed: false,
      message: `Environment test failed: ${error.message}`,
      details: { error: error.message },
    };
  }
}

/**
 * Test Notion API connectivity
 */
async function testConnectivity(): Promise<TestResult> {
  try {
    const connectionResult = await checkNotionConnection();
    
    return {
      name: 'API Connectivity',
      passed: connectionResult.isConnected,
      message: connectionResult.isConnected
        ? 'Successfully connected to Notion API'
        : `Connection failed: ${connectionResult.error || 'Unknown error'}`,
      details: connectionResult,
    };
  } catch (error: any) {
    return {
      name: 'API Connectivity',
      passed: false,
      message: `Connectivity test failed: ${error.message}`,
      details: { error: error.message },
    };
  }
}

/**
 * Test database accessibility
 */
async function testDatabases(): Promise<TestResult> {
  try {
    const connectionResult = await checkNotionConnection();
    const accessibleDbs = Object.entries(connectionResult.databases)
      .filter(([_, accessible]) => accessible)
      .map(([name]) => name);
    
    const inaccessibleDbs = Object.entries(connectionResult.databases)
      .filter(([_, accessible]) => !accessible)
      .map(([name]) => name);

    const allAccessible = inaccessibleDbs.length === 0;
    
    return {
      name: 'Database Access',
      passed: allAccessible,
      message: allAccessible
        ? `All ${accessibleDbs.length} databases are accessible`
        : `${inaccessibleDbs.length} databases are not accessible: ${inaccessibleDbs.join(', ')}`,
      details: {
        accessible: accessibleDbs,
        inaccessible: inaccessibleDbs,
        total: Object.keys(connectionResult.databases).length,
      },
      warnings: inaccessibleDbs.length > 0 
        ? [`Inaccessible databases: ${inaccessibleDbs.join(', ')}`]
        : undefined,
    };
  } catch (error: any) {
    return {
      name: 'Database Access',
      passed: false,
      message: `Database test failed: ${error.message}`,
      details: { error: error.message },
    };
  }
}

/**
 * Test content fetching
 */
async function testContent(): Promise<TestResult> {
  try {
    const contentResult = await getAllSiteContent();
    
    if (contentResult.error) {
      return {
        name: 'Content Fetching',
        passed: false,
        message: `Content fetch failed: ${contentResult.error.message}`,
        details: { error: contentResult.error },
      };
    }

    const content = contentResult.data!;
    const warnings: string[] = [];

    if (content.ventures.length === 0) {
      warnings.push('No ventures found');
    }

    if (content.capabilities.length === 0) {
      warnings.push('No capabilities found');
    }

    if (content.assets.length === 0) {
      warnings.push('No assets found');
    }

    return {
      name: 'Content Fetching',
      passed: true,
      message: `Successfully fetched content from ${contentResult.source}`,
      details: {
        source: contentResult.source,
        ventures: content.ventures.length,
        capabilities: content.capabilities.length,
        assets: content.assets.length,
        siteCopySections: Object.keys(content.siteCopy).length,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error: any) {
    return {
      name: 'Content Fetching',
      passed: false,
      message: `Content test failed: ${error.message}`,
      details: { error: error.message },
    };
  }
}

/**
 * Test content validation
 */
async function testValidation(): Promise<TestResult> {
  try {
    const contentResult = await getAllSiteContent();
    
    if (contentResult.error || !contentResult.data) {
      return {
        name: 'Content Validation',
        passed: false,
        message: 'Cannot validate content: fetch failed',
        details: { error: contentResult.error?.message || 'No data' },
      };
    }

    const validation = validateContentCompleteness(contentResult.data);
    
    return {
      name: 'Content Validation',
      passed: validation.isComplete,
      message: validation.isComplete
        ? 'All content is valid and complete'
        : `Content validation issues found: ${validation.missing.length} missing, ${validation.warnings.length} warnings`,
      details: {
        isComplete: validation.isComplete,
        missing: validation.missing,
        warningCount: validation.warnings.length,
      },
      warnings: validation.warnings,
    };
  } catch (error: any) {
    return {
      name: 'Content Validation',
      passed: false,
      message: `Validation test failed: ${error.message}`,
      details: { error: error.message },
    };
  }
}

/**
 * Generate test report
 */
export function generateTestReport(results: NotionTestResult): string {
  const { tests, summary, timestamp } = results;
  
  let report = `# Notion CMS Test Report

**Timestamp**: ${timestamp}
**Overall Status**: ${results.success ? '✅ PASSED' : '❌ FAILED'}

## Summary
- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Warnings**: ${summary.warnings}

## Test Results

`;

  Object.values(tests).forEach(test => {
    const status = test.passed ? '✅' : '❌';
    report += `### ${status} ${test.name}\n`;
    report += `**Status**: ${test.passed ? 'PASSED' : 'FAILED'}\n`;
    report += `**Message**: ${test.message}\n`;
    
    if (test.warnings && test.warnings.length > 0) {
      report += `**Warnings**:\n`;
      test.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
    }
    
    if (test.details) {
      report += `**Details**:\n\`\`\`json\n${JSON.stringify(test.details, null, 2)}\n\`\`\`\n`;
    }
    
    report += '\n';
  });

  if (!results.success) {
    report += `## Recommendations

`;
    Object.values(tests).forEach(test => {
      if (!test.passed) {
        switch (test.name) {
          case 'Environment Configuration':
            report += `- **Environment**: Check your .env.local file and ensure all required variables are set\n`;
            break;
          case 'API Connectivity':
            report += `- **Connectivity**: Verify your NOTION_TOKEN is correct and has proper permissions\n`;
            break;
          case 'Database Access':
            report += `- **Databases**: Ensure all databases are shared with your Notion integration\n`;
            break;
          case 'Content Fetching':
            report += `- **Content**: Check database schemas and ensure they match the expected structure\n`;
            break;
          case 'Content Validation':
            report += `- **Validation**: Review content completeness and fix any missing required fields\n`;
            break;
        }
      }
    });
  }

  report += `
---
*Generated by Ovsia V4 Notion CMS Test Suite*
`;

  return report;
}

/**
 * Run tests and log results
 */
export async function runTestsWithLogging(): Promise<boolean> {
  const results = await runNotionTests();
  const report = generateTestReport(results);
  
  if (results.success) {
    logger.info('notion', 'All tests passed', results.summary);
  } else {
    logger.error('notion', 'Some tests failed', results.summary);
  }
  
  // In development, also log the full report
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + report);
  }
  
  return results.success;
}

// Export for CLI usage
export { runNotionTests as default };