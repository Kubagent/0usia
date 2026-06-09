'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero, Footer, PrinciplesSection, ExpertiseShowcase, VenturesCarousel, CaseStudiesSection, ContactSection } from '@/components/sections';
import RotatingWordAnimation from '@/components/RotatingWordAnimation';
import SectionTransition from '@/components/SectionTransition';
import { ImagePreloader } from '@/components/ImagePreloader';

const DARK_LOWER_SECTIONS = false;

export default function HomeClient() {
  const [praxisOpen, setPraxisOpen] = useState(false);

  const ventureLogoUrls = [
    '/venture-logos/violca.png',
    '/venture-logos/wojcistics.png',
    '/venture-logos/fix.png',
    '/venture-logos/libelo.png',
    '/venture-logos/objectsgallery.png',
    '/venture-logos/substans.png',
  ];

  return (
    <div className="min-h-screen">
      <ImagePreloader images={ventureLogoUrls} priority={true} />

      <Hero />

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

      <SectionTransition className="bg-white">
        <PrinciplesSection />
      </SectionTransition>

      <SectionTransition className="bg-black">
        <ExpertiseShowcase />
      </SectionTransition>

      <SectionTransition className="bg-white">
        <VenturesCarousel onTogglePraxis={() => setPraxisOpen(p => !p)} praxisOpen={praxisOpen} />
      </SectionTransition>

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

      <SectionTransition className={DARK_LOWER_SECTIONS ? 'bg-white' : 'bg-black'}>
        <ContactSection dark={!DARK_LOWER_SECTIONS} />
      </SectionTransition>

      <div className={DARK_LOWER_SECTIONS ? 'bg-black' : 'bg-white'}>
        <Footer dark={DARK_LOWER_SECTIONS} />
      </div>
    </div>
  );
}
