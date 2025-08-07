/**
 * Test page for Essence Manifesto Section
 * 
 * This isolated test page allows us to verify the Essence Manifesto implementation
 * without the interference of other sections or complex layout logic.
 */
"use client";

import EssenceManifestoSection from '@/sections/EssenceManifestoSection';
import { Cormorant_Garamond } from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function TestEssencePage() {
  return (
    <div className={cormorantGaramond.className}>
      {/* Spacer to enable scroll testing */}
      <div style={{ 
        height: '50vh', 
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#666'
      }}>
        Scroll down to test the Essence Manifesto section
      </div>
      
      {/* The Essence Manifesto Section */}
      <EssenceManifestoSection />
      
      {/* Mock Expertise Section for navigation testing */}
      <section 
        id="expertise-section"
        style={{
          height: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#000000'
        }}
      >
        🎯 Expertise Section (Navigation Target)
      </section>
      
      {/* Additional spacer */}
      <div style={{ 
        height: '50vh', 
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#888'
      }}>
        End of test page
      </div>
    </div>
  );
}