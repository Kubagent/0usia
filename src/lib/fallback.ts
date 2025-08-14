/**
 * Fallback Content System
 * 
 * Provides static fallback content when Notion API is unavailable
 * Ensures the site always has content to display
 */

import type {
  VentureContent,
  CapabilityContent,
  SiteCopyContent,
  AssetContent,
  SiteContent,
  ContentFetchResult,
} from '@/types/notion';

/**
 * Fallback venture data (based on current sample data)
 */
const FALLBACK_VENTURES: VentureContent[] = [
  {
    id: 'fallback-venture1',
    name: 'Violca',
    logo: '/venture-logos/Violca-logo.png',
    logoAlt: 'Violca',
    stat: '×5 ROI',
    outcome: 'Scaled from MVP to market leader in 18 months',
    description: 'Revolutionary fintech platform transforming payments',
    metrics: {
      revenue: '$10M ARR',
      users: '100K+',
      growth: '300% YoY'
    },
    siteUrl: 'https://violca.com',
    sortOrder: 1,
  },
  {
    id: 'fallback-venture2',
    name: 'Substans',
    logo: '/venture-logos/substans.png',
    logoAlt: 'Substans',
    stat: '×3 Growth',
    outcome: 'Achieved unicorn status through strategic positioning',
    description: 'Next-generation healthcare technology platform',
    metrics: {
      revenue: '$50M ARR',
      users: '1M+',
      growth: '250% YoY'
    },
    siteUrl: 'https://www.substans.art',
    sortOrder: 2,
  },
  {
    id: 'fallback-venture3',
    name: 'Libelo',
    logo: '/venture-logos/libelo.png',
    logoAlt: 'Libelo',
    stat: '×7 Scale',
    outcome: 'Expanded globally with strategic partnerships',
    description: 'AI-powered logistics optimization platform',
    metrics: {
      revenue: '$25M ARR',
      users: '500K+',
      growth: '400% YoY'
    },
    siteUrl: 'https://libelo.com',
    sortOrder: 3,
  },
];

/**
 * Fallback capability data (based on current sample data)
 */
const FALLBACK_CAPABILITIES: CapabilityContent[] = [
  {
    id: 'fallback-strategy',
    title: 'Strategy',
    subtitle: 'Vision to Action',
    description: 'We transform bold visions into executable strategies.',
    features: ['Market Analysis', 'Business Model Design', 'Go-to-Market Strategy'],
    examples: ['Series A Funding Strategy', 'Market Entry Planning'],
    technologies: ['Strategic Planning', 'Market Research', 'Competitive Analysis'],
    sortOrder: 1,
  },
  {
    id: 'fallback-ai-ops',
    title: 'AI Operations',
    subtitle: 'Intelligence at Scale',
    description: 'We build and deploy AI systems that drive real results.',
    features: ['Machine Learning', 'Data Engineering', 'AI Infrastructure'],
    examples: ['Predictive Analytics', 'Process Automation'],
    technologies: ['TensorFlow', 'PyTorch', 'MLOps'],
    sortOrder: 2,
  },
  {
    id: 'fallback-capital',
    title: 'Capital',
    subtitle: 'Resources for Growth',
    description: 'We provide the capital and connections to fuel growth.',
    features: ['Investment Strategy', 'Network Access', 'Growth Capital'],
    examples: ['Seed Investment', 'Series A Support'],
    technologies: ['Financial Modeling', 'Due Diligence', 'Portfolio Management'],
    sortOrder: 3,
  },
];

/**
 * Fallback site copy
 */
const FALLBACK_SITE_COPY = {
  hero: {
    sectionName: 'hero',
    contentType: 'fallback',
    primaryText: 'Transforming Ideas into Reality',
    secondaryText: 'Where vision meets execution through strategic partnerships',
    buttonText: 'Start Your Journey',
    lastUpdated: new Date().toISOString(),
  } as SiteCopyContent,
  
  essence: {
    sectionName: 'essence',
    contentType: 'fallback',
    primaryText: 'From 0 → 1, We Make Essence Real.',
    secondaryText: 'Where vision becomes reality through strategic action',
    buttonText: '',
    lastUpdated: new Date().toISOString(),
  } as SiteCopyContent,
  
  capabilities: {
    sectionName: 'capabilities',
    contentType: 'fallback',
    primaryText: 'Core Capabilities',
    secondaryText: 'Three pillars of transformation',
    buttonText: '',
    lastUpdated: new Date().toISOString(),
  } as SiteCopyContent,
  
  proof: {
    sectionName: 'proof',
    contentType: 'fallback',
    primaryText: 'Proof of Ousia',
    secondaryText: 'Evidence of transformation',
    buttonText: '',
    lastUpdated: new Date().toISOString(),
  } as SiteCopyContent,
  
  cta: {
    sectionName: 'cta',
    contentType: 'fallback',
    primaryText: 'Choose Your Path',
    secondaryText: 'Multiple ways to engage with Ovsia',
    buttonText: 'Get Started',
    lastUpdated: new Date().toISOString(),
  } as SiteCopyContent,
  
  footer: {
    sectionName: 'footer',
    contentType: 'fallback',
    primaryText: 'Stay in Ousia',
    secondaryText: 'Connect with us and stay updated on our journey',
    buttonText: 'Join Us',
    lastUpdated: new Date().toISOString(),
  } as SiteCopyContent,
};

/**
 * Fallback assets (minimal set)
 */
const FALLBACK_ASSETS: AssetContent[] = [
  {
    name: 'Default Logo',
    type: 'image',
    url: '/logo.png',
    altText: 'Ovsia Logo',
    usageContext: ['header', 'footer'],
  },
];

/**
 * Complete fallback site content
 */
const FALLBACK_SITE_CONTENT: SiteContent = {
  ventures: FALLBACK_VENTURES,
  capabilities: FALLBACK_CAPABILITIES,
  siteCopy: FALLBACK_SITE_COPY,
  assets: FALLBACK_ASSETS,
};

/**
 * Get fallback ventures
 */
export function getFallbackVentures(): ContentFetchResult<VentureContent[]> {
  console.log('Using fallback venture data');
  
  return {
    data: FALLBACK_VENTURES,
    error: null,
    timestamp: new Date().toISOString(),
    source: 'fallback',
  };
}

/**
 * Get fallback capabilities
 */
export function getFallbackCapabilities(): ContentFetchResult<CapabilityContent[]> {
  console.log('Using fallback capability data');
  
  return {
    data: FALLBACK_CAPABILITIES,
    error: null,
    timestamp: new Date().toISOString(),
    source: 'fallback',
  };
}

/**
 * Get fallback site copy
 */
export function getFallbackSiteCopy(): ContentFetchResult<SiteContent['siteCopy']> {
  console.log('Using fallback site copy');
  
  return {
    data: FALLBACK_SITE_COPY,
    error: null,
    timestamp: new Date().toISOString(),
    source: 'fallback',
  };
}

/**
 * Get fallback assets
 */
export function getFallbackAssets(): ContentFetchResult<AssetContent[]> {
  console.log('Using fallback asset data');
  
  return {
    data: FALLBACK_ASSETS,
    error: null,
    timestamp: new Date().toISOString(),
    source: 'fallback',
  };
}

/**
 * Get complete fallback site content
 */
export function getFallbackSiteContent(): ContentFetchResult<SiteContent> {
  console.log('Using complete fallback site content');
  
  return {
    data: FALLBACK_SITE_CONTENT,
    error: null,
    timestamp: new Date().toISOString(),
    source: 'fallback',
  };
}

/**
 * Enhanced content fetcher with automatic fallback
 */
export async function getContentWithFallback<T>(
  fetchFunction: () => Promise<ContentFetchResult<T>>,
  fallbackFunction: () => ContentFetchResult<T>,
  contentType: string
): Promise<ContentFetchResult<T>> {
  try {
    console.log(`Attempting to fetch ${contentType} from Notion...`);
    const result = await fetchFunction();
    
    if (result.error || !result.data) {
      console.warn(`Failed to fetch ${contentType} from Notion:`, result.error?.message);
      console.log(`Using fallback ${contentType} data`);
      return fallbackFunction();
    }
    
    console.log(`Successfully fetched ${contentType} from Notion`);
    return result;
  } catch (error: any) {
    console.error(`Error fetching ${contentType}:`, error);
    console.log(`Using fallback ${contentType} data`);
    return fallbackFunction();
  }
}

/**
 * Validate environment variables for Notion API
 */
export function validateNotionEnvironment(): {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
} {
  const requiredVars = [
    'NOTION_TOKEN',
    'NOTION_VENTURES_DB_ID',
    'NOTION_CAPABILITIES_DB_ID',
    'NOTION_SITE_COPY_DB_ID',
    'NOTION_ASSETS_DB_ID',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  const warnings: string[] = [];
  
  if (missingVars.length > 0) {
    warnings.push('Missing Notion environment variables. Fallback content will be used.');
    warnings.push(`Missing variables: ${missingVars.join(', ')}`);
  }
  
  // Check if variables look like they have valid values
  if (process.env.NOTION_TOKEN && process.env.NOTION_TOKEN.length < 50) {
    warnings.push('NOTION_TOKEN appears to be invalid (too short)');
  }
  
  const dbIdVars = requiredVars.filter(v => v.includes('DB_ID'));
  for (const dbVar of dbIdVars) {
    const value = process.env[dbVar];
    if (value && (value.length !== 32 || !/^[a-f0-9]+$/i.test(value.replace(/-/g, '')))) {
      warnings.push(`${dbVar} does not appear to be a valid Notion database ID`);
    }
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * Log content source information
 */
export function logContentSource(results: ContentFetchResult<any>[], context: string = '') {
  const notionCount = results.filter(r => r.source === 'notion').length;
  const fallbackCount = results.filter(r => r.source === 'fallback').length;
  
  console.log(`Content sources ${context}:`, {
    notion: notionCount,
    fallback: fallbackCount,
    total: results.length,
  });
  
  if (fallbackCount > 0) {
    console.warn(`${fallbackCount} content types are using fallback data`);
  }
}