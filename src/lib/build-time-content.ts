/**
 * Build-Time Content Fetching System
 * 
 * Handles content fetching during build time for static generation
 * Provides caching, fallback handling, and comprehensive error management
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getAllSiteContent } from './content';
import type { SiteContent, ContentFetchResult } from '@/types/notion';
import { getFallbackSiteContent, validateNotionEnvironment, logContentSource } from './fallback';
import { logger, buildLogger, logBuildOperation } from './logger';
import { contentCache, getCachedSiteContent, setCachedSiteContent } from './cache';

// Build-time cache configuration
const CACHE_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  directory: join(process.cwd(), '.next/cache/notion'),
  filename: 'site-content.json',
  maxAge: 1000 * 60 * 60, // 1 hour
};

// Build-time content fetching interface
export interface BuildTimeContentResult {
  content: SiteContent;
  metadata: {
    source: 'notion' | 'fallback' | 'cache';
    timestamp: string;
    buildId: string;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Main function to fetch content at build time
 * This is designed to be called during Next.js static generation
 */
export async function fetchBuildTimeContent(
  options: {
    useCache?: boolean;
    forceFresh?: boolean;
    buildId?: string;
  } = {}
): Promise<BuildTimeContentResult> {
  const { useCache = CACHE_CONFIG.enabled, forceFresh = false, buildId = generateBuildId() } = options;
  
  return logBuildOperation('fetchBuildTimeContent', buildId, async () => {
    buildLogger.buildStart(buildId);
    buildLogger.info('build', 'Starting build-time content fetch', {
      buildId,
      useCache,
      forceFresh,
      environment: process.env.NODE_ENV,
    });
    
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Validate environment first
    const envValidation = validateNotionEnvironment();
    if (!envValidation.isValid) {
      warnings.push(...envValidation.warnings);
      buildLogger.warn('build', 'Environment validation warnings', envValidation.warnings);
    }
    
    // Try to load from cache if enabled and not forcing fresh
    if (useCache && !forceFresh) {
      const cachedContent = await getCachedSiteContent();
      if (cachedContent) {
        buildLogger.info('build', 'Using cached content', { buildId });
        return {
          content: cachedContent,
          metadata: {
            source: 'cache',
            timestamp: new Date().toISOString(),
            buildId,
            errors,
            warnings,
          },
        };
      } else {
        buildLogger.debug('build', 'No valid cached content found', { buildId });
      }
    }
  
    // Fetch content from Notion or fallback
    let contentResult: ContentFetchResult<SiteContent>;
    
    try {
      buildLogger.info('build', 'Fetching content from Notion', { buildId });
      contentResult = await getAllSiteContent();
      
      if (contentResult.error) {
        errors.push(`Notion fetch error: ${contentResult.error.message}`);
        buildLogger.error('build', 'Notion content fetch failed', { buildId }, new Error(contentResult.error.message));
        
        // Fall back to static content
        buildLogger.info('build', 'Falling back to static content', { buildId });
        contentResult = getFallbackSiteContent();
        warnings.push('Using fallback content due to Notion API error');
      } else {
        buildLogger.info('build', 'Successfully fetched content from Notion', {
          buildId,
          ventures: contentResult.data?.ventures.length || 0,
          capabilities: contentResult.data?.capabilities.length || 0,
        });
      }
    } catch (error: any) {
      errors.push(`Content fetch exception: ${error.message}`);
      buildLogger.error('build', 'Content fetch exception', { buildId }, error);
      
      // Fall back to static content
      buildLogger.info('build', 'Using fallback content due to exception', { buildId });
      contentResult = getFallbackSiteContent();
      warnings.push('Using fallback content due to fetch exception');
    }
  
    if (!contentResult.data) {
      throw new Error('No content available from any source');
    }
    
    const result: BuildTimeContentResult = {
      content: contentResult.data,
      metadata: {
        source: contentResult.source,
        timestamp: contentResult.timestamp,
        buildId,
        errors,
        warnings,
      },
    };
    
    // Cache the result if enabled
    if (useCache && contentResult.data) {
      await setCachedSiteContent(contentResult.data, contentResult.source, buildId);
      buildLogger.debug('build', 'Content cached successfully', { buildId });
    }
    
    // Log summary
    buildLogger.info('build', 'Build-time content fetch completed', {
      buildId,
      source: result.metadata.source,
      ventures: result.content.ventures.length,
      capabilities: result.content.capabilities.length,
      assets: result.content.assets.length,
      errors: errors.length,
      warnings: warnings.length,
    });
    
    if (errors.length > 0) {
      buildLogger.error('build', 'Build-time content errors', { buildId, errors });
    }
    
    if (warnings.length > 0) {
      buildLogger.warn('build', 'Build-time content warnings', { buildId, warnings });
    }
    
    return result;
  });
}

/**
 * Load content from build cache
 */
async function loadFromCache(): Promise<BuildTimeContentResult | null> {
  try {
    const cacheFile = join(CACHE_CONFIG.directory, CACHE_CONFIG.filename);
    
    if (!existsSync(cacheFile)) {
      return null;
    }
    
    const content = await readFile(cacheFile, 'utf-8');
    const cached: BuildTimeContentResult & { cachedAt: number } = JSON.parse(content);
    
    // Check if cache is still valid
    const now = Date.now();
    const cacheAge = now - cached.cachedAt;
    
    if (cacheAge > CACHE_CONFIG.maxAge) {
      console.log('Cache expired, fetching fresh content');
      return null;
    }
    
    console.log(`Using cache from ${new Date(cached.cachedAt).toISOString()}`);
    return cached;
  } catch (error: any) {
    console.warn('Failed to load from cache:', error.message);
    return null;
  }
}

/**
 * Save content to build cache
 */
async function saveToCache(result: BuildTimeContentResult): Promise<void> {
  try {
    // Ensure cache directory exists
    if (!existsSync(CACHE_CONFIG.directory)) {
      await mkdir(CACHE_CONFIG.directory, { recursive: true });
    }
    
    const cacheFile = join(CACHE_CONFIG.directory, CACHE_CONFIG.filename);
    const cacheData = {
      ...result,
      cachedAt: Date.now(),
    };
    
    await writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
    console.log('Content cached successfully');
  } catch (error: any) {
    console.warn('Failed to save to cache:', error.message);
  }
}

/**
 * Generate unique build ID
 */
function generateBuildId(): string {
  return `build-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate content completeness
 */
export function validateContentCompleteness(content: SiteContent): {
  isComplete: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check required content
  if (content.ventures.length === 0) {
    missing.push('ventures');
  }
  
  if (content.capabilities.length === 0) {
    missing.push('capabilities');
  }
  
  // Check site copy sections
  const requiredSections = ['hero', 'essence', 'capabilities', 'proof', 'cta', 'footer'];
  for (const section of requiredSections) {
    const sectionContent = content.siteCopy[section as keyof typeof content.siteCopy];
    if (!sectionContent || !sectionContent.primaryText) {
      warnings.push(`Missing or incomplete site copy for section: ${section}`);
    }
  }
  
  // Check venture completeness
  for (const venture of content.ventures) {
    if (!venture.name) {
      warnings.push(`Venture ${venture.id} is missing name`);
    }
    if (!venture.logo) {
      warnings.push(`Venture ${venture.name || venture.id} is missing logo`);
    }
    if (!venture.description) {
      warnings.push(`Venture ${venture.name || venture.id} is missing description`);
    }
  }
  
  // Check capability completeness
  for (const capability of content.capabilities) {
    if (!capability.title) {
      warnings.push(`Capability ${capability.id} is missing title`);
    }
    if (!capability.description) {
      warnings.push(`Capability ${capability.title || capability.id} is missing description`);
    }
    if (capability.features.length === 0) {
      warnings.push(`Capability ${capability.title || capability.id} has no features`);
    }
  }
  
  return {
    isComplete: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Create build report
 */
export function createBuildReport(result: BuildTimeContentResult): string {
  const validation = validateContentCompleteness(result.content);
  
  const report = `
# Notion CMS Build Report

**Build ID:** ${result.metadata.buildId}
**Timestamp:** ${result.metadata.timestamp}
**Content Source:** ${result.metadata.source}

## Content Summary
- **Ventures:** ${result.content.ventures.length}
- **Capabilities:** ${result.content.capabilities.length}
- **Assets:** ${result.content.assets.length}
- **Site Copy Sections:** ${Object.keys(result.content.siteCopy).length}

## Content Validation
- **Complete:** ${validation.isComplete ? 'Yes' : 'No'}
- **Missing Required:** ${validation.missing.length === 0 ? 'None' : validation.missing.join(', ')}

## Issues
${result.metadata.errors.length > 0 ? `
### Errors (${result.metadata.errors.length})
${result.metadata.errors.map(error => `- ${error}`).join('\n')}
` : ''}

${result.metadata.warnings.length > 0 ? `
### Warnings (${result.metadata.warnings.length})
${result.metadata.warnings.map(warning => `- ${warning}`).join('\n')}
` : ''}

${validation.warnings.length > 0 ? `
### Content Warnings (${validation.warnings.length})
${validation.warnings.map(warning => `- ${warning}`).join('\n')}
` : ''}

## Venture Details
${result.content.ventures.map(venture => `
### ${venture.name}
- **Logo:** ${venture.logo ? 'Yes' : 'Missing'}
- **Description:** ${venture.description ? 'Yes' : 'Missing'}
- **Website:** ${venture.siteUrl || 'Not provided'}
- **Metrics:** Revenue: ${venture.metrics.revenue}, Users: ${venture.metrics.users}, Growth: ${venture.metrics.growth}
`).join('')}

## Capability Details
${result.content.capabilities.map(capability => `
### ${capability.title}
- **Description:** ${capability.description ? 'Yes' : 'Missing'}
- **Features:** ${capability.features.length}
- **Examples:** ${capability.examples.length}
- **Technologies:** ${capability.technologies.length}
`).join('')}

---
*Generated by Ovsia V4 Notion CMS at ${new Date().toISOString()}*
`;
  
  return report.trim();
}

/**
 * Utility function for Next.js static props
 */
export async function getStaticPropsContent() {
  const result = await fetchBuildTimeContent();
  
  return {
    props: {
      siteContent: result.content,
      contentMetadata: result.metadata,
    },
    // Revalidate every hour in production
    revalidate: process.env.NODE_ENV === 'production' ? 3600 : false,
  };
}