'use client';

import React, { useEffect, useRef } from 'react';
import { useScrollLock, ScrollLockOptions } from '@/hooks/useScrollLock';

export interface ScrollLockContainerProps extends Omit<ScrollLockOptions, 'sectionCount'> {
  children: React.ReactNode;
  className?: string;
  /** Enable scroll indicators/dots navigation */
  showIndicators?: boolean;
  /** Callback when section changes */
  onSectionChange?: (sectionIndex: number) => void;
  /** Custom indicator component */
  IndicatorComponent?: React.ComponentType<{
    isActive: boolean;
    sectionIndex: number;
    onClick: () => void;
  }>;
}

/**
 * Container component that wraps sections and provides scroll-lock behavior
 * Automatically counts child sections and manages scroll navigation
 */
export default function ScrollLockContainer({
  children,
  className = '',
  showIndicators = true,
  onSectionChange,
  IndicatorComponent,
  ...scrollLockOptions
}: ScrollLockContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLElement | null)[]>([]);

  // Count sections from children
  const sections = React.Children.toArray(children);
  const sectionCount = sections.length;

  // Initialize scroll lock
  const { state, goToSection, registerSection, setEnabled } = useScrollLock({
    sectionCount,
    ...scrollLockOptions,
  });

  // Register child sections
  useEffect(() => {
    if (containerRef.current) {
      const sectionElements = containerRef.current.children;
      for (let i = 0; i < sectionElements.length; i++) {
        const element = sectionElements[i] as HTMLElement;
        childRefs.current[i] = element;
        registerSection(i, element);
      }
    }
  }, [registerSection, children]);

  // Call onSectionChange when current section changes
  useEffect(() => {
    if (onSectionChange) {
      onSectionChange(state.currentSection);
    }
  }, [state.currentSection, onSectionChange]);

  // Default indicator component
  const DefaultIndicator = ({ isActive, onClick }: { isActive: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
        isActive
          ? 'bg-white border-white scale-125'
          : 'bg-transparent border-white/50 hover:border-white/80'
      }`}
      aria-label={`Go to section ${state.currentSection + 1}`}
    />
  );

  const Indicator = IndicatorComponent || DefaultIndicator;

  return (
    <div className="relative">
      {/* Main container with scroll-snap CSS */}
      <div
        ref={containerRef}
        className={`scroll-lock-container ${className}`}
        style={{
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          overflowY: 'auto',
          height: '100vh',
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="scroll-lock-section"
            style={{
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              minHeight: '100vh',
              height: '100vh',
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Section indicators */}
      {showIndicators && sectionCount > 1 && (
        <nav
          className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-4"
          aria-label="Section navigation"
        >
          {Array.from({ length: sectionCount }, (_, index) => (
            <Indicator
              key={index}
              isActive={index === state.currentSection}
              sectionIndex={index}
              onClick={() => goToSection(index)}
            />
          ))}
        </nav>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg font-mono text-sm z-50">
          <div>Section: {state.currentSection + 1}/{sectionCount}</div>
          <div>Progress: {(state.sectionProgress * 100).toFixed(1)}%</div>
          <div>Scrolling: {state.isScrolling ? 'Yes' : 'No'}</div>
          <div>Enabled: {state.isEnabled ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual section wrapper component for more granular control
 */
export function ScrollLockSection({
  children,
  className = '',
  id,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      id={id}
      className={`scroll-lock-section min-h-screen ${className}`}
      style={{
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        height: '100vh',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </section>
  );
}