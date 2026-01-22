'use client';

import { Hero, Footer, PrinciplesSection, ExpertiseShowcase, VenturesCarousel, ContactSection } from '@/components/sections';
import RotatingWordAnimation from '@/components/RotatingWordAnimation';
import { ImagePreloader } from '@/components/ImagePreloader';
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

  // Venture logo URLs for preloading
  const ventureLogoUrls = [
    '/venture-logos/violca.png',
    '/venture-logos/wojcistics.png', 
    '/venture-logos/fix.png',
    '/venture-logos/libelo.png',
    '/venture-logos/objectsgallery.png',
    '/venture-logos/substans.png'
  ];

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
      {/* Preload venture logos early for smooth carousel experience */}
      <ImagePreloader images={ventureLogoUrls} priority={true} />
      
      {/* Section 1: Hero - White background with white→black transition */}
      <Hero />
      
      {/* Section 2: Your [Rotating Word] Actualized - Black background */}
      <div className="min-h-screen flex items-center justify-center relative bg-black">
        <div className="text-center text-white px-4 sm:px-6 md:px-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem] 3xl:text-[12rem] font-cormorant leading-tight tracking-wide">
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

      {/* Section 3: Principles - White background */}
      <div className="bg-white">
        <PrinciplesSection />
      </div>

      {/* Section 4: Expertise - Black background */}
      <div className="bg-black">
        <ExpertiseShowcase />
      </div>

      {/* Section 5: Proof of Ousia - White background */}
      <div className="bg-white">
        <VenturesCarousel />
      </div>

      {/* Section 6: Contact - Black background */}
      <div className="bg-black">
        <ContactSection />
      </div>

      {/* Section 7: Stay in Ousia - White background */}
      <div className="bg-white">
        <Footer />
      </div>
      
      {children}
    </div>
  );
}