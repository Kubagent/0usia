/**
 * Content Transformation Utilities
 * 
 * Transforms Notion CMS content into formats compatible with existing components
 * Provides mapping functions for seamless integration with current UI components
 */

import type {
  VentureContent,
  CapabilityContent,
  SiteCopyContent,
  SiteContent,
} from '@/types/notion';

// Types matching the existing component interfaces
export interface ComponentCapabilityCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  modalContent: {
    title: string;
    description: string;
    features: string[];
    examples: string[];
    technologies: string[];
  };
}

export interface ComponentProofItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundColor: string;
  textColor: string;
  overlayContent: {
    title: string;
    details: string[];
    callToAction: string;
  };
}

// Color mapping for capabilities (matches existing design system)
const CAPABILITY_COLORS = {
  strategy: { color: 'bg-blue-100 text-blue-900', icon: '🎯' },
  'ai-operations': { color: 'bg-purple-100 text-purple-900', icon: '🤖' },
  'ai operations': { color: 'bg-purple-100 text-purple-900', icon: '🤖' },
  capital: { color: 'bg-green-100 text-green-900', icon: '💰' },
  default: { color: 'bg-blue-100 text-blue-900', icon: '⚡' },
};

// Background colors for proof items (cycling through the existing colors)
const PROOF_BACKGROUNDS = [
  { backgroundColor: '#1e3a8a', textColor: 'text-white' },
  { backgroundColor: '#059669', textColor: 'text-white' },
  { backgroundColor: '#7c3aed', textColor: 'text-white' },
  { backgroundColor: '#ea580c', textColor: 'text-white' },
  { backgroundColor: '#dc2626', textColor: 'text-white' },
  { backgroundColor: '#4338ca', textColor: 'text-white' },
];

/**
 * Transform Notion capabilities to component format
 */
export function transformCapabilitiesToCards(capabilities: CapabilityContent[]): ComponentCapabilityCard[] {
  return capabilities.map((capability, index) => {
    // Determine color and icon based on title
    const titleLower = capability.title.toLowerCase();
    const colorConfig = Object.entries(CAPABILITY_COLORS).find(([key]) => 
      titleLower.includes(key)
    )?.[1] || CAPABILITY_COLORS.default;
    
    return {
      id: capability.id,
      title: capability.title,
      description: capability.description,
      icon: colorConfig.icon,
      color: colorConfig.color,
      modalContent: {
        title: `${capability.title}${capability.subtitle ? ` - ${capability.subtitle}` : ''}`,
        description: capability.description,
        features: capability.features,
        examples: capability.examples,
        technologies: capability.technologies,
      },
    };
  });
}

/**
 * Transform Notion ventures to proof items format
 */
export function transformVenturesToProofItems(ventures: VentureContent[]): ComponentProofItem[] {
  return ventures.map((venture, index) => {
    // Cycle through background colors
    const colorConfig = PROOF_BACKGROUNDS[index % PROOF_BACKGROUNDS.length];
    
    // Create details array from venture metrics and outcomes
    const details: string[] = [];
    
    if (venture.outcome) {
      details.push(venture.outcome);
    }
    
    if (venture.metrics.revenue) {
      details.push(`${venture.metrics.revenue} achieved`);
    }
    
    if (venture.metrics.users) {
      details.push(`${venture.metrics.users} active users`);
    }
    
    if (venture.metrics.growth) {
      details.push(`${venture.metrics.growth} growth rate`);
    }
    
    // Fallback details if none provided
    if (details.length === 0) {
      details.push('Successful venture transformation');
      details.push('Strategic growth achieved');
      details.push('Market position established');
    }
    
    return {
      id: venture.id,
      title: venture.name,
      subtitle: venture.stat || 'Success Story',
      description: venture.description,
      image: venture.logo || '/venture-logos/default-logo.png',
      backgroundColor: colorConfig.backgroundColor,
      textColor: colorConfig.textColor,
      overlayContent: {
        title: `${venture.name} Success Story`,
        details,
        callToAction: venture.siteUrl ? 'Visit Website' : 'Learn More',
      },
    };
  });
}

/**
 * Extract text content for sections
 */
export function extractSectionText(
  siteCopy: SiteContent['siteCopy'],
  sectionName: keyof SiteContent['siteCopy'],
  fallbackPrimary: string,
  fallbackSecondary?: string
): { primary: string; secondary: string } {
  const section = siteCopy[sectionName];
  
  return {
    primary: section?.primaryText || fallbackPrimary,
    secondary: section?.secondaryText || fallbackSecondary || '',
  };
}

/**
 * Create complete site data structure for components
 */
export function transformSiteContentForComponents(siteContent: SiteContent) {
  // Transform capabilities
  const capabilityCards = transformCapabilitiesToCards(siteContent.capabilities);
  
  // Transform ventures to proof items
  const proofItems = transformVenturesToProofItems(siteContent.ventures);
  
  // Extract section texts
  const heroText = extractSectionText(
    siteContent.siteCopy,
    'hero',
    'Transforming Ideas into Reality',
    'Where vision meets execution through strategic partnerships'
  );
  
  const essenceText = extractSectionText(
    siteContent.siteCopy,
    'essence',
    'From 0 → 1, We Make Essence Real.',
    'Where vision becomes reality through strategic action'
  );
  
  const capabilitiesText = extractSectionText(
    siteContent.siteCopy,
    'capabilities',
    'Core Capabilities',
    'Three pillars of transformation'
  );
  
  const proofText = extractSectionText(
    siteContent.siteCopy,
    'proof',
    'Proof of Ousia',
    'Evidence of transformation'
  );
  
  const ctaText = extractSectionText(
    siteContent.siteCopy,
    'cta',
    'Choose Your Path',
    'Multiple ways to engage with Ovsia'
  );
  
  const footerText = extractSectionText(
    siteContent.siteCopy,
    'footer',
    'Stay in Ousia',
    'Connect with us and stay updated on our journey'
  );
  
  return {
    // Component-ready data
    capabilityCards,
    proofItems,
    
    // Section texts
    sections: {
      hero: heroText,
      essence: essenceText,
      capabilities: capabilitiesText,
      proof: proofText,
      cta: ctaText,
      footer: footerText,
    },
    
    // Raw content for custom usage
    raw: siteContent,
    
    // Metadata
    metadata: {
      venturesCount: siteContent.ventures.length,
      capabilitiesCount: siteContent.capabilities.length,
      assetsCount: siteContent.assets.length,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Create fallback transformation for development/testing
 */
export function createFallbackTransformation() {
  // This would use the same structure as the current hardcoded data
  const fallbackCapabilities: ComponentCapabilityCard[] = [
    {
      id: 'strategy',
      title: 'Strategy',
      description: 'We transform bold visions into executable strategies.',
      icon: '🎯',
      color: 'bg-blue-100 text-blue-900',
      modalContent: {
        title: 'Strategy - Vision to Action',
        description: 'We transform bold visions into executable strategies that drive measurable results.',
        features: ['Market Analysis', 'Business Model Design', 'Go-to-Market Strategy'],
        examples: ['Series A Funding Strategy', 'Market Entry Planning'],
        technologies: ['Strategic Planning', 'Market Research', 'Competitive Analysis']
      }
    },
    {
      id: 'ai-ops',
      title: 'AI Operations',
      description: 'We build and deploy AI systems that drive real results.',
      icon: '🤖',
      color: 'bg-purple-100 text-purple-900',
      modalContent: {
        title: 'AI Operations - Intelligence at Scale',
        description: 'We build and deploy AI systems that drive real results and scale with your business.',
        features: ['Machine Learning', 'Data Engineering', 'AI Infrastructure'],
        examples: ['Predictive Analytics', 'Process Automation'],
        technologies: ['TensorFlow', 'PyTorch', 'MLOps']
      }
    },
    {
      id: 'capital',
      title: 'Capital',
      description: 'We provide the capital and connections to fuel growth.',
      icon: '💰',
      color: 'bg-green-100 text-green-900',
      modalContent: {
        title: 'Capital - Resources for Growth',
        description: 'We provide the capital and connections to fuel sustainable growth and expansion.',
        features: ['Investment Strategy', 'Network Access', 'Growth Capital'],
        examples: ['Seed Investment', 'Series A Support'],
        technologies: ['Financial Modeling', 'Due Diligence', 'Portfolio Management']
      }
    }
  ];
  
  const fallbackProofItems: ComponentProofItem[] = [
    {
      id: 'venture1',
      title: 'Violca',
      subtitle: '×5 ROI Achievement',
      description: 'Revolutionary fintech platform transforming payments',
      image: '/venture-logos/Violca-logo.png',
      backgroundColor: '#1e3a8a',
      textColor: 'text-white',
      overlayContent: {
        title: 'Violca Success Story',
        details: [
          'Scaled from MVP to market leader in 18 months',
          '$10M ARR achieved',
          '100K+ active users',
          '300% YoY growth'
        ],
        callToAction: 'Learn More'
      }
    },
    {
      id: 'venture2',
      title: 'Substans',
      subtitle: '×3 Growth Success',
      description: 'Next-generation healthcare technology platform',
      image: '/venture-logos/substans.png',
      backgroundColor: '#059669',
      textColor: 'text-white',
      overlayContent: {
        title: 'Substans Success Story',
        details: [
          'Achieved unicorn status through strategic positioning',
          '$50M ARR milestone',
          '1M+ platform users',
          '250% YoY growth rate'
        ],
        callToAction: 'View Case Study'
      }
    },
    {
      id: 'venture3',
      title: 'Libelo',
      subtitle: '×7 Scale Achievement',
      description: 'AI-powered logistics optimization platform',
      image: '/venture-logos/libelo.png',
      backgroundColor: '#7c3aed',
      textColor: 'text-white',
      overlayContent: {
        title: 'Libelo Success Story',
        details: [
          'Expanded globally with strategic partnerships',
          '$25M ARR milestone',
          '500K+ platform users',
          '400% YoY growth rate'
        ],
        callToAction: 'Explore Journey'
      }
    }
  ];
  
  return {
    capabilityCards: fallbackCapabilities,
    proofItems: fallbackProofItems,
    sections: {
      hero: {
        primary: 'Transforming Ideas into Reality',
        secondary: 'Where vision meets execution through strategic partnerships'
      },
      essence: {
        primary: 'From 0 → 1, We Make Essence Real.',
        secondary: 'Where vision becomes reality through strategic action'
      },
      capabilities: {
        primary: 'Core Capabilities',
        secondary: 'Three pillars of transformation'
      },
      proof: {
        primary: 'Proof of Ousia',
        secondary: 'Evidence of transformation'
      },
      cta: {
        primary: 'Choose Your Path',
        secondary: 'Multiple ways to engage with Ovsia'
      },
      footer: {
        primary: 'Stay in Ousia',
        secondary: 'Connect with us and stay updated on our journey'
      }
    },
    metadata: {
      venturesCount: 3,
      capabilitiesCount: 3,
      assetsCount: 0,
      lastUpdated: new Date().toISOString(),
    }
  };
}

/**
 * Validate transformed content
 */
export function validateTransformedContent(transformed: ReturnType<typeof transformSiteContentForComponents>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check capability cards
  if (transformed.capabilityCards.length === 0) {
    errors.push('No capability cards available');
  }
  
  transformed.capabilityCards.forEach((card, index) => {
    if (!card.title) {
      errors.push(`Capability card ${index} is missing title`);
    }
    if (!card.description) {
      warnings.push(`Capability card ${card.title || index} is missing description`);
    }
    if (!card.modalContent.features.length) {
      warnings.push(`Capability card ${card.title || index} has no features`);
    }
  });
  
  // Check proof items
  if (transformed.proofItems.length === 0) {
    warnings.push('No proof items available');
  }
  
  transformed.proofItems.forEach((item, index) => {
    if (!item.title) {
      errors.push(`Proof item ${index} is missing title`);
    }
    if (!item.description) {
      warnings.push(`Proof item ${item.title || index} is missing description`);
    }
    if (!item.image) {
      warnings.push(`Proof item ${item.title || index} is missing image`);
    }
  });
  
  // Check section texts
  Object.entries(transformed.sections).forEach(([section, text]) => {
    if (!text.primary) {
      warnings.push(`Section ${section} is missing primary text`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}