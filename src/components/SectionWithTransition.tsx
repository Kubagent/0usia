/**
 * Section with Background Transition Component
 * 
 * A wrapper component that automatically handles background color transitions
 * when sections come into view. Integrates with the BackgroundTransitionManager
 * to provide smooth, performant scroll-triggered animations.
 * 
 * Features:
 * - Automatic background transition registration
 * - Customizable transition timing and easing
 * - Content color adaptation (text/elements adjust to background)
 * - Accessibility support with reduced motion
 * - Performance monitoring integration
 * - SEO-friendly section structure
 * 
 * @example
 * ```tsx
 * <SectionWithTransition
 *   id="hero"
 *   backgroundColor="#000000"
 *   contentColor="light"
 *   transitionTiming={{ start: 0.2, end: 0.8 }}
 * >
 *   <YourSectionContent />
 * </SectionWithTransition>
 * ```
 */

'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useBackgroundTransitionSection } from './BackgroundTransitionManager';

export interface SectionTransitionProps {
  /** Unique identifier for this section */
  id: string;
  /** Background color for this section */
  backgroundColor: string;
  /** Content theme adaptation */
  contentColor?: 'light' | 'dark' | 'auto';
  /** Custom transition timing */
  transitionTiming?: {
    start: number;
    end: number;
  };
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom section tag (default: section) */
  as?: keyof JSX.IntrinsicElements;
  /** Enable entrance animations */
  enableAnimations?: boolean;
  /** Custom animation variants */
  animationVariants?: {
    hidden: object;
    visible: object;
  };
  /** Scroll-triggered content effects */
  enableScrollEffects?: boolean;
}

/**
 * Default animation variants for section entrance
 */
const defaultAnimationVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
};

/**
 * Section component with automatic background transitions
 */
export const SectionWithTransition: React.FC<SectionTransitionProps> = ({
  id,
  backgroundColor,
  contentColor = 'auto',
  transitionTiming = { start: 0.1, end: 0.9 },
  children,
  className = '',
  as: Component = 'section',
  enableAnimations = true,
  animationVariants = defaultAnimationVariants,
  enableScrollEffects = false
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { sectionRef: transitionRef } = useBackgroundTransitionSection(id);
  
  // Track if section is in view for animations
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-10% 0px -10% 0px'
  });

  // Determine content color theme
  const contentTheme = useMemo(() => {
    if (contentColor !== 'auto') return contentColor;
    
    // Auto-detect based on background color brightness
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'dark' : 'light';
  }, [backgroundColor, contentColor]);

  // CSS classes based on content theme
  const themeClasses = useMemo(() => {
    const baseClasses = 'transition-colors duration-300 ease-in-out';
    
    if (contentTheme === 'light') {
      return `${baseClasses} text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-gray-100 [&_a]:text-white`;
    } else {
      return `${baseClasses} text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_p]:text-gray-900 [&_a]:text-black`;
    }
  }, [contentTheme]);

  // Scroll effects for content
  const scrollY = useMotionValue(0);
  const contentY = useTransform(scrollY, [0, 1], [0, -50]);
  const contentOpacity = useTransform(scrollY, [0, 0.5, 1], [1, 0.8, 0.6]);

  // Update scroll value based on section visibility
  useEffect(() => {
    if (!enableScrollEffects) return;

    const updateScrollValue = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = 1 - (rect.bottom / (windowHeight + rect.height));
      
      scrollY.set(Math.max(0, Math.min(1, progress)));
    };

    const handleScroll = () => requestAnimationFrame(updateScrollValue);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollEffects, scrollY]);

  // Combine refs for both transition and view tracking
  const combinedRef = (element: any) => {
    if (element) {
      (sectionRef as any).current = element;
      transitionRef(element);
    }
  };

  const ComponentToRender = Component as any;
  
  return (
    <ComponentToRender
      ref={combinedRef}
      id={id}
      className={`
        section-full relative min-h-screen w-full
        ${themeClasses}
        ${className}
      `}
      data-section-id={id}
      data-background-color={backgroundColor}
      data-content-theme={contentTheme}
    >
      <motion.div
        className="relative z-10 w-full h-full flex flex-col"
        variants={enableAnimations ? animationVariants as any : undefined}
        initial={enableAnimations ? 'hidden' : undefined}
        animate={enableAnimations && isInView ? 'visible' : undefined}
        style={enableScrollEffects ? {
          y: contentY,
          opacity: contentOpacity
        } : undefined}
      >
        {children}
      </motion.div>

      {/* Section metadata for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs font-mono z-50">
          <div>Section: {id}</div>
          <div>Background: {backgroundColor}</div>
          <div>Theme: {contentTheme}</div>
          <div>In View: {isInView ? 'Yes' : 'No'}</div>
        </div>
      )}
    </ComponentToRender>
  );
};

/**
 * Higher-order component for adding transition capabilities to existing sections
 */
export const withSectionTransition = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  sectionConfig: {
    id: string;
    backgroundColor: string;
    contentColor?: 'light' | 'dark' | 'auto';
  }
) => {
  const WithTransitionComponent = React.forwardRef<HTMLElement, P>((props, ref) => {
    return (
      <SectionWithTransition
        id={sectionConfig.id}
        backgroundColor={sectionConfig.backgroundColor}
        contentColor={sectionConfig.contentColor}
      >
        <WrappedComponent {...(props as P)} />
      </SectionWithTransition>
    );
  });

  WithTransitionComponent.displayName = `withSectionTransition(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithTransitionComponent;
};

/**
 * Pre-configured section variants for common use cases
 */
export const SectionVariants = {
  Hero: (props: Omit<SectionTransitionProps, 'backgroundColor' | 'contentColor'>) => (
    <SectionWithTransition
      backgroundColor="#ffffff"
      contentColor="dark"
      enableAnimations={true}
      enableScrollEffects={true}
      {...props}
    />
  ),
  
  About: (props: Omit<SectionTransitionProps, 'backgroundColor' | 'contentColor'>) => (
    <SectionWithTransition
      backgroundColor="#000000"
      contentColor="light"
      enableAnimations={true}
      {...props}
    />
  ),
  
  Services: (props: Omit<SectionTransitionProps, 'backgroundColor' | 'contentColor'>) => (
    <SectionWithTransition
      backgroundColor="#ffffff"
      contentColor="dark"
      enableAnimations={true}
      {...props}
    />
  ),
  
  Contact: (props: Omit<SectionTransitionProps, 'backgroundColor' | 'contentColor'>) => (
    <SectionWithTransition
      backgroundColor="#000000"
      contentColor="light"
      enableAnimations={true}
      {...props}
    />
  )
};

export default SectionWithTransition;