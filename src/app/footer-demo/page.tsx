import React from 'react';
import Footer from '@/components/sections/Footer';

/**
 * Footer Demo Page
 * 
 * This page demonstrates the Footer component in action.
 * Navigate to /footer-demo to see the component.
 */

export default function FooterDemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple content area to show footer at bottom */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Footer Component Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Scroll down to see the animated footer with pulse text animation, 
            social media links, and live Berlin time display.
          </p>
          <div className="space-y-6 text-gray-700">
            <p>
              The footer component includes the following features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-left max-w-2xl mx-auto">
              <li>Black background with centered, responsive text</li>
              <li>Subtle pulse animation on the main heading</li>
              <li>Interactive social media links with hover animations</li>
              <li>Live Berlin time display that updates every second</li>
              <li>Legal footer links with smooth hover effects</li>
              <li>Full accessibility compliance (WCAG AA)</li>
              <li>Mobile-responsive design</li>
              <li>Performance optimized with GPU-accelerated animations</li>
            </ul>
            <p className="mt-8">
              The component is built with Framer Motion for smooth animations
              and uses Tailwind CSS for styling with the Ovsia design system.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer Component */}
      <Footer />
    </div>
  );
}

// Metadata for Next.js
export const metadata = {
  title: 'Footer Demo - Ovsia V4',
  description: 'Demonstration of the animated Footer component with pulse animations and social links.',
};