/**
 * Content Management System
 * 
 * Handles fetching, processing, and caching of content from Notion
 * Provides build-time content fetching with fallback support
 */

import {
  fetchVentures,
  fetchCapabilities,
  fetchSiteCopy,
  fetchAssets,
  extractRichTextContent,
  extractFileUrl,
  extractSelectProperty,
  extractMultiSelectProperties,
  extractNumberProperty,
  extractUrlProperty,
} from './notion';

import type {
  NotionVenture,
  NotionCapability,
  NotionSiteCopy,
  NotionAsset,
  VentureContent,
  CapabilityContent,
  SiteCopyContent,
  AssetContent,
  SiteContent,
  ContentFetchResult,
  ValidationResult,
  ContentValidationError,
} from '@/types/notion';

/**
 * Transform Notion venture data to clean content format
 */
function transformVentureData(notionVenture: NotionVenture): VentureContent {
  return {
    id: notionVenture.id,
    name: extractRichTextContent(notionVenture.properties.Name.title),
    logo: extractFileUrl(notionVenture.properties.Logo.files),
    logoAlt: extractRichTextContent(notionVenture.properties['Logo Alt Text'].rich_text),
    stat: extractRichTextContent(notionVenture.properties.Stat.rich_text),
    outcome: extractRichTextContent(notionVenture.properties.Outcome.rich_text),
    description: extractRichTextContent(notionVenture.properties.Description.rich_text),
    metrics: {
      revenue: extractRichTextContent(notionVenture.properties['ARR Revenue'].rich_text),
      users: extractRichTextContent(notionVenture.properties['User Count'].rich_text),
      growth: extractRichTextContent(notionVenture.properties['Growth Rate'].rich_text),
    },
    siteUrl: extractUrlProperty(notionVenture.properties['Website URL'].url),
    sortOrder: extractNumberProperty(notionVenture.properties['Sort Order'].number),
  };
}

/**
 * Transform Notion capability data to clean content format
 */
function transformCapabilityData(notionCapability: NotionCapability): CapabilityContent {
  return {
    id: notionCapability.id,
    title: extractRichTextContent(notionCapability.properties.Title.title),
    subtitle: extractRichTextContent(notionCapability.properties.Subtitle.rich_text),
    description: extractRichTextContent(notionCapability.properties.Description.rich_text),
    features: extractMultiSelectProperties(notionCapability.properties.Features.multi_select),
    examples: extractMultiSelectProperties(notionCapability.properties.Examples.multi_select),
    technologies: extractMultiSelectProperties(notionCapability.properties.Technologies.multi_select),
    sortOrder: extractNumberProperty(notionCapability.properties['Sort Order'].number),
  };
}

/**
 * Transform Notion site copy data to clean content format
 */
function transformSiteCopyData(notionSiteCopy: NotionSiteCopy): SiteCopyContent {
  return {
    sectionName: extractRichTextContent(notionSiteCopy.properties['Section Name'].title),
    contentType: extractSelectProperty(notionSiteCopy.properties['Content Type'].select),
    primaryText: extractRichTextContent(notionSiteCopy.properties['Primary Text'].rich_text),
    secondaryText: extractRichTextContent(notionSiteCopy.properties['Secondary Text'].rich_text),
    buttonText: extractRichTextContent(notionSiteCopy.properties['Button Text'].rich_text),
    lastUpdated: notionSiteCopy.properties['Last Updated'].last_edited_time,
  };
}

/**
 * Transform Notion asset data to clean content format
 */
function transformAssetData(notionAsset: NotionAsset): AssetContent {
  return {
    name: extractRichTextContent(notionAsset.properties.Name.title),
    type: extractSelectProperty(notionAsset.properties['Asset Type'].select),
    url: extractFileUrl(notionAsset.properties.File.files),
    altText: extractRichTextContent(notionAsset.properties['Alt Text'].rich_text),
    usageContext: extractMultiSelectProperties(notionAsset.properties['Usage Context'].multi_select),
  };
}

/**
 * Validate venture content
 */
function validateVentureContent(venture: VentureContent): ValidationResult {
  const errors: ContentValidationError[] = [];
  const warnings: ContentValidationError[] = [];

  if (!venture.name) {
    errors.push({ field: 'name', message: 'Venture name is required' });
  }

  if (!venture.description) {
    warnings.push({ field: 'description', message: 'Venture description is missing' });
  }

  if (!venture.logo) {
    warnings.push({ field: 'logo', message: 'Venture logo is missing' });
  }

  if (!venture.siteUrl) {
    warnings.push({ field: 'siteUrl', message: 'Venture website URL is missing' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate capability content
 */
function validateCapabilityContent(capability: CapabilityContent): ValidationResult {
  const errors: ContentValidationError[] = [];
  const warnings: ContentValidationError[] = [];

  if (!capability.title) {
    errors.push({ field: 'title', message: 'Capability title is required' });
  }

  if (!capability.description) {
    errors.push({ field: 'description', message: 'Capability description is required' });
  }

  if (capability.features.length === 0) {
    warnings.push({ field: 'features', message: 'No features defined for capability' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Fetch and process all ventures
 */
export async function getVentures(): Promise<ContentFetchResult<VentureContent[]>> {
  const result = await fetchVentures();
  
  if (result.error || !result.data) {
    return {
      ...result,
      data: null,
    };
  }

  try {
    const processedVentures = result.data.map(transformVentureData);
    
    // Validate content
    const validationResults = processedVentures.map(validateVentureContent);
    const hasErrors = validationResults.some(result => !result.isValid);
    
    if (hasErrors) {
      console.warn('Venture content validation warnings:', validationResults);
    }

    // Sort by sort order
    processedVentures.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      data: processedVentures,
      error: null,
      timestamp: result.timestamp,
      source: result.source,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        code: 'PROCESSING_ERROR',
        message: `Failed to process venture data: ${error.message}`,
        status: 500,
      },
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Fetch and process all capabilities
 */
export async function getCapabilities(): Promise<ContentFetchResult<CapabilityContent[]>> {
  const result = await fetchCapabilities();
  
  if (result.error || !result.data) {
    return {
      ...result,
      data: null,
    };
  }

  try {
    const processedCapabilities = result.data.map(transformCapabilityData);
    
    // Validate content
    const validationResults = processedCapabilities.map(validateCapabilityContent);
    const hasErrors = validationResults.some(result => !result.isValid);
    
    if (hasErrors) {
      console.warn('Capability content validation warnings:', validationResults);
    }

    // Sort by sort order
    processedCapabilities.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      data: processedCapabilities,
      error: null,
      timestamp: result.timestamp,
      source: result.source,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        code: 'PROCESSING_ERROR',
        message: `Failed to process capability data: ${error.message}`,
        status: 500,
      },
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Fetch and organize site copy by sections
 */
export async function getSiteCopy(): Promise<ContentFetchResult<SiteContent['siteCopy']>> {
  const result = await fetchSiteCopy();
  
  if (result.error || !result.data) {
    return {
      ...result,
      data: null,
    };
  }

  try {
    const processedCopy = result.data.map(transformSiteCopyData);
    
    // Organize by sections
    const siteCopy = {
      hero: processedCopy.find(copy => copy.sectionName.toLowerCase() === 'hero') || createEmptySiteCopy('hero'),
      essence: processedCopy.find(copy => copy.sectionName.toLowerCase() === 'essence') || createEmptySiteCopy('essence'),
      capabilities: processedCopy.find(copy => copy.sectionName.toLowerCase() === 'capabilities') || createEmptySiteCopy('capabilities'),
      proof: processedCopy.find(copy => copy.sectionName.toLowerCase() === 'proof') || createEmptySiteCopy('proof'),
      cta: processedCopy.find(copy => copy.sectionName.toLowerCase() === 'cta') || createEmptySiteCopy('cta'),
      footer: processedCopy.find(copy => copy.sectionName.toLowerCase() === 'footer') || createEmptySiteCopy('footer'),
    };

    return {
      data: siteCopy,
      error: null,
      timestamp: result.timestamp,
      source: result.source,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        code: 'PROCESSING_ERROR',
        message: `Failed to process site copy data: ${error.message}`,
        status: 500,
      },
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Create empty site copy for missing sections
 */
function createEmptySiteCopy(sectionName: string): SiteCopyContent {
  return {
    sectionName,
    contentType: 'fallback',
    primaryText: '',
    secondaryText: '',
    buttonText: '',
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch and process all assets
 */
export async function getAssets(): Promise<ContentFetchResult<AssetContent[]>> {
  const result = await fetchAssets();
  
  if (result.error || !result.data) {
    return {
      ...result,
      data: null,
    };
  }

  try {
    const processedAssets = result.data.map(transformAssetData);

    return {
      data: processedAssets,
      error: null,
      timestamp: result.timestamp,
      source: result.source,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        code: 'PROCESSING_ERROR',
        message: `Failed to process asset data: ${error.message}`,
        status: 500,
      },
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Fetch all site content at build time
 */
export async function getAllSiteContent(): Promise<ContentFetchResult<SiteContent>> {
  console.log('Fetching all site content from Notion...');
  
  try {
    // Fetch all content types in parallel
    const [venturesResult, capabilitiesResult, siteCopyResult, assetsResult] = await Promise.all([
      getVentures(),
      getCapabilities(),
      getSiteCopy(),
      getAssets(),
    ]);

    // Check for any critical errors
    const hasErrors = [venturesResult, capabilitiesResult, siteCopyResult, assetsResult]
      .some(result => result.error);

    if (hasErrors) {
      const errors = [venturesResult, capabilitiesResult, siteCopyResult, assetsResult]
        .filter(result => result.error)
        .map(result => result.error?.message)
        .join(', ');

      console.error('Content fetch errors:', errors);
      
      return {
        data: null,
        error: {
          code: 'CONTENT_FETCH_ERROR',
          message: `Failed to fetch content: ${errors}`,
          status: 500,
        },
        timestamp: new Date().toISOString(),
        source: 'notion',
      };
    }

    const siteContent: SiteContent = {
      ventures: venturesResult.data || [],
      capabilities: capabilitiesResult.data || [],
      siteCopy: siteCopyResult.data || {
        hero: createEmptySiteCopy('hero'),
        essence: createEmptySiteCopy('essence'),  
        capabilities: createEmptySiteCopy('capabilities'),
        proof: createEmptySiteCopy('proof'),
        cta: createEmptySiteCopy('cta'),
        footer: createEmptySiteCopy('footer'),
      },
      assets: assetsResult.data || [],
    };

    console.log('Successfully fetched all site content:', {
      ventures: siteContent.ventures.length,
      capabilities: siteContent.capabilities.length,
      assets: siteContent.assets.length,
    });

    return {
      data: siteContent,
      error: null,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  } catch (error: any) {
    console.error('Failed to fetch site content:', error);
    
    return {
      data: null,
      error: {
        code: 'SITE_CONTENT_ERROR',
        message: `Failed to fetch site content: ${error.message}`,
        status: 500,
      },
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}