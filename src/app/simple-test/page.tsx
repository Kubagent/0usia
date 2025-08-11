'use client';

import { Hero, Footer, ExpertiseShowcase, VenturesCarousel, ThreeCardCTA } from '@/components/sections';
import RotatingWordAnimation from '@/components/RotatingWordAnimation';

/**
 * Simple Test Page - Restore original 6 sections without complex transition managers
 * This demonstrates the working sections with proper black/white alternating backgrounds
 */
export default function SimpleTestPage() {
  return (
    <div className="w-full">
      {/* Section 1: Hero - White background with white to black transition */}
      <Hero />
      
      {/* Section 2: Your [Rotating Word] Actualized - Black background */}
      <section className="min-h-screen flex items-center justify-center relative bg-black">
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
    </div>
  );
}