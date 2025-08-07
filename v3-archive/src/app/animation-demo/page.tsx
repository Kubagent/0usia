"use client";

import React from 'react';
import SectionWrapper from '@/components/SectionWrapper';
import { AnimationType } from '@/components/SectionWrapper';
import ScrollPerformanceMonitor from '@/components/ScrollPerformanceMonitor';

const AnimationDemoPage = () => {
  const animationTypes: AnimationType[] = [
    'fade',
    'fade-up',
    'slide-down',
    'slide-subtle',
    'scale-in',
    'rotate-in',
    'crossfade',
    'reveal'
  ];

  const createDemoSection = (animation: AnimationType, index: number) => (
    <div
      key={animation}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: index % 2 === 0 ? '#f8fafc' : '#1e293b',
        color: index % 2 === 0 ? '#1e293b' : '#f8fafc',
      }}
    >
      <SectionWrapper
        animation={animation}
        reverseOnScroll={true}
        enableExitAnimations={true}
        viewportAmount={0.3}
        debugMode={process.env.NODE_ENV === 'development'}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '600px',
          }}
        >
          <h2
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {animation.replace('-', ' ').toUpperCase()}
          </h2>
          
          <p
            style={{
              fontSize: '1.25rem',
              lineHeight: '1.6',
              marginBottom: '2rem',
              opacity: 0.8,
            }}
          >
            This section demonstrates the <strong>{animation}</strong> animation with 
            scroll reversal capabilities. Scroll up and down to see both entrance 
            and exit animations in action.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                style={{
                  height: '100px',
                  backgroundColor: index % 2 === 0 ? '#e2e8f0' : '#334155',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '3rem',
              padding: '1rem',
              backgroundColor: index % 2 === 0 ? '#e2e8f0' : '#334155',
              borderRadius: '12px',
              fontSize: '0.875rem',
              opacity: 0.7,
            }}
          >
            <strong>Features:</strong>
            <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1rem' }}>
              <li>Bidirectional animations (entrance & exit)</li>
              <li>Scroll direction detection</li>
              <li>Performance optimized with GPU acceleration</li>
              <li>Accessibility compliant (respects reduced motion)</li>
              <li>Customizable timing and easing</li>
            </ul>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );

  return (
    <div>
      {/* Performance Monitor */}
      <ScrollPerformanceMonitor
        enabled={process.env.NODE_ENV === 'development'}
        position="top-right"
        showFPS={true}
        showScrollMetrics={true}
      />

      {/* Header Section */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <SectionWrapper animation="scale-in" reverseOnScroll={false}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              Animation System Demo
            </h1>
            <p
              style={{
                fontSize: '1.5rem',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}
            >
              Experience polished entrance and exit animations with scroll reversal behavior.
              Each section demonstrates a different animation type with performance monitoring.
            </p>
            <div
              style={{
                marginTop: '2rem',
                fontSize: '1rem',
                opacity: 0.7,
              }}
            >
              Scroll down to see all animation types ↓
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* Animation Demo Sections */}
      {animationTypes.map((animation, index) => 
        createDemoSection(animation, index)
      )}

      {/* Footer Section */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
        }}
      >
        <SectionWrapper animation="fade-up" reverseOnScroll={true}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              Animation System Complete
            </h2>
            <p
              style={{
                fontSize: '1.25rem',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto 2rem',
                lineHeight: '1.6',
              }}
            >
              All animations support scroll reversal, performance optimization, 
              and accessibility features. The system is ready for production use.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginTop: '2rem',
              }}
            >
              {['60fps Performance', 'Accessibility Ready', 'Mobile Optimized', 'Cross-browser'].map((feature) => (
                <div
                  key={feature}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default AnimationDemoPage;