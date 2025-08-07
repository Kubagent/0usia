"use client";
import EssenceManifestoSection from '@/sections/EssenceManifestoSection';
import Hero from '@/sections/Hero';
import VenturesSection from '@/sections/VenturesSection';
import ProjectsSection from '@/sections/ProjectsSection';
import FooterSection from '@/sections/FooterSection';
import ContactSection from '@/sections/ContactSection';
import AnimatedBackgroundTransition from '@/components/AnimatedBackgroundTransition';


// Import ExpertiseSection separately - it's a static server component
import ExpertiseSection from '@/sections/ExpertiseSection';

import usePerformantSectionSnap from '@/utils/usePerformantSectionSnap';
import ScrollPerformanceMonitor from '@/components/ScrollPerformanceMonitor';
import PerformanceDashboard from '@/components/PerformanceDashboard';

export default function Page() {
  // Initialize high-performance scroll snapping with velocity detection
  const { getPerformanceMetrics } = usePerformantSectionSnap({
    velocityThreshold: 0.8, // Require higher velocity for intentional flicks
    debounceMs: 30, // Faster response time
    enableProfiling: process.env.NODE_ENV === 'development'
  });
  return (
    <>
      {/* Performance monitoring in development */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <ScrollPerformanceMonitor enabled={true} position="top-right" />
          <PerformanceDashboard enabled={true} position="top-left" minimal={false} />
        </>
      )}
      
      {/* Animated client components - first group */}
      <div className="snap-section"><Hero /></div>
      <div className="snap-section"><EssenceManifestoSection /></div>
      {/* Static server component - completely isolated from animation flow */}
      <div className="snap-section static-section-container" style={{ position: 'relative', zIndex: 100, backgroundColor: '#ffffff', isolation: 'isolate' }}>
        <ExpertiseSection />
      </div>
      {/* Ventures Section - rendered directly, no animation background wrapper */}
      <div className="snap-section"><VenturesSection /></div>
      {/* Projects Section - rendered below VenturesSection */}
      <div className="snap-section"><ProjectsSection /></div>
      <div className="snap-section"><ContactSection /></div>
      <div className="snap-section"><FooterSection /></div>
    </>
  );
}
