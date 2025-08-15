'use client';

import { Hero, Footer, ExpertiseShowcase, VenturesCarousel, ThreeCardCTA } from '@/components/sections';
import RotatingWordAnimation from '@/components/RotatingWordAnimation';
import OptimizedScrollContainer from '@/components/OptimizedScrollContainer';
import type { SiteContent } from '@/types/notion';
import { transformSiteContentForComponents, createFallbackTransformation } from '@/lib/content-transformers';

// Page props interface
interface HomeClientProps {
  siteContent?: SiteContent;
  contentMetadata?: {
    source: 'notion' | 'fallback' | 'cache';
    timestamp: string;
    buildId: string;
    errors: string[];
    warnings: string[];
  };
  children?: React.ReactNode;
}

export default function HomeClient({ siteContent, contentMetadata, children }: HomeClientProps) {
  // Transform content for components
  const transformedContent = siteContent 
    ? transformSiteContentForComponents(siteContent)
    : createFallbackTransformation();

  // Development logging (suppressed for cleaner output)
  // Log content source in development
  if (process.env.NODE_ENV === 'development' && contentMetadata && process.env.DEBUG_CONTENT) {
    console.log('[Content Source]', {
      source: contentMetadata.source,
      timestamp: contentMetadata.timestamp,
      ventures: transformedContent.metadata.venturesCount,
      capabilities: transformedContent.metadata.capabilitiesCount,
      errors: contentMetadata.errors.length,
      warnings: contentMetadata.warnings.length,
    });
    
    if (contentMetadata.errors.length > 0) {
      console.warn('[Content Errors]', contentMetadata.errors);
    }
    
    if (contentMetadata.warnings.length > 0) {
      console.warn('[Content Warnings]', contentMetadata.warnings);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Section 1: Hero - White background with white→black transition */}
      <Hero />
      
      {/* Section 2: Your [Rotating Word] Actualized - Black background */}
      <div className="min-h-screen flex items-center justify-center relative bg-black">
        <div className="text-center text-white px-4 sm:px-6 md:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl 3xl:text-[10rem] font-cormorant leading-tight tracking-wide">
            <span className="block mb-2 sm:mb-3 md:mb-4">Your</span>
            <RotatingWordAnimation 
              words={['Venture', 'Vision', 'Virtue']}
              interval={2500}
              className="block mb-2 sm:mb-3 md:mb-4 text-white"
            />
            <span className="block">Actualized</span>
          </h1>
        </div>
      </div>
      
      {/* Section 3: Expertise - White background */}
      <div className="bg-white">
        <ExpertiseShowcase />
      </div>
      
      {/* Section 4: Proof of Ousia - Black background */}
      <div className="bg-black">
        <VenturesCarousel />
      </div>
      
      {/* Section 5: Choose Your Path - White background */}
      <div className="bg-white">
        <ThreeCardCTA />
      </div>
      
      {/* Section 6: Stay in Ousia - Black background */}
      <div className="bg-black">
        <Footer />
      </div>
      
      {children}
    </div>
  );
}