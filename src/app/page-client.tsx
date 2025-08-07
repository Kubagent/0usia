'use client';

import { Hero, Footer, ExpertiseShowcase, VenturesCarousel, ThreeCardCTA } from '@/components/sections';
import RotatingWordAnimation from '@/components/RotatingWordAnimation';
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
    <div className="ovsia-scroll-container">
      {/* Section 1: Hero - Preserves natural scroll animations */}
      <Hero />
      
      {/* Section 2: Your [Rotating Word] Actualized */}
      <section className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="text-center text-white px-4">
          <h1 className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-cormorant leading-tight tracking-wide">
            <span className="block mb-4">Your</span>
            <RotatingWordAnimation 
              words={['Venture', 'Vision', 'Virtue']}
              interval={2500}
              className="block mb-4 text-white"
            />
            <span className="block">Actualized</span>
          </h1>
        </div>
      </section>
      
      {/* Section 3: Expertise */}
      <ExpertiseShowcase />
      
      {/* Section 4: Proof of Ousia */}
      <VenturesCarousel />
      
      {/* Section 5: Choose Your Path */}
      <ThreeCardCTA />
      
      {/* Section 6: Stay in Ousia */}
      <Footer />
      
      {children}
    </div>
  );
}