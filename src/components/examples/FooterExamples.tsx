/**
 * Footer Component Usage Examples
 * 
 * This file demonstrates various ways to use the Footer component
 * with different configurations and customizations.
 */

import React from 'react';
import Footer from '../sections/Footer';

// Custom social links example
const customSocialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/ovsia',
    ariaLabel: 'View our code on GitHub',
    icon: (
      <svg 
        width="24" 
        height="24" 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        aria-hidden="true"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  {
    name: 'Dribbble',
    url: 'https://dribbble.com/ovsia',
    ariaLabel: 'View our designs on Dribbble',
    icon: (
      <svg 
        width="24" 
        height="24" 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        aria-hidden="true"
      >
        <path d="M12 0C5.374 0 0 5.372 0 12s5.374 12 12 12 12-5.372 12-12S18.626 0 12 0zm9.568 7.375c.77 1.423 1.216 3.057 1.216 4.625 0 .414-.025.823-.075 1.224-1.514-.313-3.188-.479-4.947-.479-1.759 0-3.433.166-4.947.479a11.945 11.945 0 01-.075-1.224c0-1.568.446-3.202 1.216-4.625a9.516 9.516 0 007.612 0zM12 2.25a9.706 9.706 0 016.176 2.197 7.759 7.759 0 00-6.176-1.697 7.759 7.759 0 00-6.176 1.697A9.706 9.706 0 0112 2.25zM2.432 7.375a9.516 9.516 0 007.612 0c.77 1.423 1.216 3.057 1.216 4.625 0 .414-.025.823-.075 1.224-1.514-.313-3.188-.479-4.947-.479-1.759 0-3.433.166-4.947.479A11.945 11.945 0 01.82 12c0-1.568.446-3.202 1.216-4.625zM12 21.75a9.706 9.706 0 01-6.176-2.197 7.759 7.759 0 006.176 1.697 7.759 7.759 0 006.176-1.697A9.706 9.706 0 0112 21.75z"/>
      </svg>
    )
  }
];

// Example: Basic Footer
export const BasicFooter = () => (
  <div className="min-h-screen bg-gray-100 flex items-end">
    <Footer />
  </div>
);

// Example: Footer with custom styling
export const FooterWithCustomBackground = () => (
  <div className="min-h-screen bg-gray-100 flex items-end">
    <Footer className="bg-gray-900" />
  </div>
);

// Example: Footer in a different container
export const FooterInContainer = () => (
  <div className="min-h-screen bg-white flex items-end max-w-4xl mx-auto">
    <Footer />
  </div>
);

// Example: Footer with custom styling
export const FooterWithCustomStyling = () => (
  <div className="min-h-screen bg-gray-100 flex items-end">
    <Footer className="border-t-4 border-blue-500" />
  </div>
);

// Example: Footer with no additional props
export const MinimalFooter = () => (
  <div className="min-h-screen bg-gray-100 flex items-end">
    <Footer />
  </div>
);

// Example: Footer in a page layout context
export const FooterInPageLayout = () => (
  <div className="min-h-screen flex flex-col">
    {/* Main content */}
    <main className="flex-1 bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Page Content</h1>
        <p className="text-lg text-gray-600 mb-8">
          This demonstrates how the Footer component works within a full page layout.
          The footer will always take up the full viewport height and center its content.
        </p>
        <div className="space-y-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
          <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco...</p>
        </div>
      </div>
    </main>
    
    {/* Footer */}
    <Footer />
  </div>
);

// Example: Footer styling variations
export const FooterVariationA = () => (
  <div className="min-h-screen bg-blue-50 flex items-end">
    <Footer className="bg-blue-900" />
  </div>
);

export const FooterVariationB = () => (
  <div className="min-h-screen bg-purple-50 flex items-end">
    <Footer className="bg-purple-900" />
  </div>
);

// Export all examples for easy importing
export default {
  BasicFooter,
  FooterWithCustomBackground,
  FooterInContainer,
  FooterWithCustomStyling,
  MinimalFooter,
  FooterInPageLayout,
  FooterVariationA,
  FooterVariationB
};

/**
 * Usage Notes:
 * 
 * 1. Basic Usage:
 *    <Footer />
 * 
 * 2. Without Time Display:
 *    <Footer showTime={false} />
 * 
 * 3. Custom Social Links:
 *    <Footer socialLinks={myCustomLinks} />
 * 
 * 4. With Custom Styling:
 *    <Footer className="custom-footer-class" />
 * 
 * 5. Performance Considerations:
 *    - The component automatically cleans up timers on unmount
 *    - Animations are GPU-accelerated for smooth performance
 *    - Time updates only occur when showTime={true}
 * 
 * 6. Accessibility:
 *    - All interactive elements are keyboard accessible
 *    - Screen reader friendly with proper ARIA labels
 *    - High contrast ratios for readability
 * 
 * 7. Responsive Design:
 *    - Mobile-first approach with responsive breakpoints
 *    - Touch-friendly target sizes on mobile devices
 *    - Adaptive text sizing across screen sizes
 */