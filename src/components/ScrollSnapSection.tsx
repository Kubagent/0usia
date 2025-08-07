'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScrollSnapSectionProps {
  children: React.ReactNode;
  className?: string;
  sectionId?: string;
  onSectionRegister?: (element: HTMLElement | null) => void;
  enableSnap?: boolean;
  /** Override default min-height behavior */
  customHeight?: string;
  /** Background color for the section */
  backgroundColor?: string;
}

/**
 * Performance-optimized section wrapper with CSS scroll-snap
 * Provides consistent section height and snap behavior
 */
export const ScrollSnapSection = forwardRef<HTMLDivElement, ScrollSnapSectionProps>(
  (
    {
      children,
      className,
      sectionId,
      onSectionRegister,
      enableSnap = true,
      customHeight,
      backgroundColor,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const elementRef = ref || internalRef;

    // Register section with parent scroll controller
    useEffect(() => {
      const element = typeof elementRef === 'object' && elementRef?.current;
      if (element && onSectionRegister) {
        onSectionRegister(element);
      }
      
      return () => {
        if (onSectionRegister) {
          onSectionRegister(null);
        }
      };
    }, [elementRef, onSectionRegister]);

    // Performance optimization: use transform3d to enable hardware acceleration
    const sectionStyles = {
      height: customHeight || '100vh',
      backgroundColor,
      transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
      willChange: 'transform', // Optimize for animations
    };

    return (
      <section
        ref={elementRef}
        id={sectionId}
        className={cn(
          // Base styles for scroll snap
          'relative w-full',
          // Scroll snap behavior
          enableSnap && 'scroll-snap-align-start',
          // Flex layout for content centering
          'flex flex-col',
          // Performance optimizations
          'transform-gpu', // Use GPU acceleration
          className
        )}
        style={sectionStyles}
        {...props}
      >
        {children}
      </section>
    );
  }
);

ScrollSnapSection.displayName = 'ScrollSnapSection';