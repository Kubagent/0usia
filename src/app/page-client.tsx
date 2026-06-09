'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero, Footer, PrinciplesSection, ExpertiseShowcase, VenturesCarousel, CaseStudiesSection, ContactSection } from '@/components/sections';
import RotatingWordAnimation from '@/components/RotatingWordAnimation';
import SectionTransition from '@/components/SectionTransition';
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

// Flip to false to revert to original colour order (Praxis=white, Contact=black, Footer=white)
const DARK_LOWER_SECTIONS = false;

export default function HomeClient({ siteContent, contentMetadata, children }: HomeClientProps) {
  const [praxisOpen, setPraxisOpen] = useState(false);

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
      <SectionTransition className="bg-black">
        <div className="min-h-screen flex items-center justify-center relative">
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
      </SectionTransition>

      {/* Section 3: Principles - White background */}
      <SectionTransition className="bg-white">
        <PrinciplesSection />
      </SectionTransition>

      {/* Section 4: Expertise - Black background */}
      <SectionTransition className="bg-black">
        <ExpertiseShowcase />
      </SectionTransition>

      {/* Section 5: Proof of Ousia - White background */}
      <SectionTransition className="bg-white">
        <VenturesCarousel onTogglePraxis={() => setPraxisOpen(p => !p)} praxisOpen={praxisOpen} />
      </SectionTransition>

      {/* Section 6: Praxis — revealed by clicking the Praxis button in Proof of Ousia */}
      <AnimatePresence initial={false}>
        {praxisOpen && (
          <motion.div
            key="praxis"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <SectionTransition className={DARK_LOWER_SECTIONS ? 'bg-black' : 'bg-white'}>
              <CaseStudiesSection dark={DARK_LOWER_SECTIONS} />
            </SectionTransition>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 7: Contact — bg inverts relative to Praxis */}
      <SectionTransition className={DARK_LOWER_SECTIONS ? 'bg-white' : 'bg-black'}>
        <ContactSection dark={!DARK_LOWER_SECTIONS} />
      </SectionTransition>

      {/* Footer — same bg as Praxis */}
      <div className={DARK_LOWER_SECTIONS ? 'bg-black' : 'bg-white'}>
        <Footer dark={DARK_LOWER_SECTIONS} />
      </div>
      
      {children}
    </div>
  );
}