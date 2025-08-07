import React from 'react';
import SplitScreenCTA from '@/components/SplitScreenCTA';

/**
 * Demo page for SplitScreenCTA component
 * 
 * This page demonstrates different variations and use cases of the 
 * SplitScreenCTA component with various configurations.
 */
export default function SplitCTADemo() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 font-space">
            Split-Screen CTA Component Demo
          </h1>
          <p className="mt-4 text-xl text-gray-600 font-cormorant">
            Interactive demonstrations of the split-screen call-to-action component
            with modal forms and mailto functionality.
          </p>
        </div>
      </div>

      {/* Demo Sections */}
      <div className="space-y-16 py-16">
        
        {/* Default Configuration */}
        <div>
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">
              Default Configuration
            </h2>
            <p className="text-gray-600 font-cormorant">
              Standard layout with default copy and styling.
            </p>
          </div>
          <SplitScreenCTA />
        </div>

        {/* Custom Configuration - Agency/Consulting */}
        <div>
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">
              Agency/Consulting Version
            </h2>
            <p className="text-gray-600 font-cormorant">
              Customized for agency or consulting business with project-focused messaging.
            </p>
          </div>
          <SplitScreenCTA
            leftTitle="Ready to Transform Your Business?"
            leftDescription="Share your vision with us and we'll craft a strategic solution that drives real results for your company."
            leftButtonText="Start Your Project"
            rightTitle="Have Questions?"
            rightDescription="Not sure where to begin? Let's have a conversation about your goals and challenges."
            rightButtonText="Let's Talk"
            mailtoEmail="projects@ovsia.com"
          />
        </div>

        {/* Custom Configuration - SaaS Product */}
        <div>
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">
              SaaS Product Version
            </h2>
            <p className="text-gray-600 font-cormorant">
              Tailored for software products with trial and support messaging.
            </p>
          </div>
          <SplitScreenCTA
            leftTitle="Ready to Get Started?"
            leftDescription="Sign up for a personalized demo and see how our platform can streamline your workflow."
            leftButtonText="Request Demo"
            rightTitle="Need Support?"
            rightDescription="Our team is here to help you succeed. Get in touch for technical assistance."
            rightButtonText="Contact Support"
            mailtoEmail="support@ovsia.com"
          />
        </div>

        {/* Custom Configuration - E-commerce */}
        <div>
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">
              E-commerce Version
            </h2>
            <p className="text-gray-600 font-cormorant">
              Designed for e-commerce businesses with custom order and inquiry flows.
            </p>
          </div>
          <SplitScreenCTA
            leftTitle="Custom Orders Welcome"
            leftDescription="Need something special? Tell us about your requirements and we'll create a custom solution just for you."
            leftButtonText="Request Custom Quote"
            rightTitle="Quick Questions?"
            rightDescription="Have a question about our products, shipping, or returns? We're here to help."
            rightButtonText="Ask a Question"
            mailtoEmail="orders@ovsia.com"
          />
        </div>

        {/* Custom Configuration - Creative Studio */}
        <div>
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">
              Creative Studio Version
            </h2>
            <p className="text-gray-600 font-cormorant">
              Perfect for creative agencies with portfolio and collaboration focus.
            </p>
          </div>
          <SplitScreenCTA
            leftTitle="Let's Create Something Amazing"
            leftDescription="Share your creative vision and let's collaborate to bring your ideas to life with stunning design and flawless execution."
            leftButtonText="Start Collaboration"
            rightTitle="Portfolio Questions?"
            rightDescription="Want to see more of our work or discuss a specific project? Let's connect."
            rightButtonText="View Portfolio"
            mailtoEmail="creative@ovsia.com"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 font-space mb-8 text-center">
            Component Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-space mb-2">
                Modal Forms
              </h3>
              <p className="text-gray-600 font-cormorant">
                Full-featured forms with validation, file upload, and smooth animations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-space mb-2">
                Mailto Integration
              </h3>
              <p className="text-gray-600 font-cormorant">
                Quick email functionality with pre-filled subject and body content.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-space mb-2">
                File Upload
              </h3>
              <p className="text-gray-600 font-cormorant">
                Drag & drop file upload with size validation and progress indicators.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-space mb-2">
                Mobile Responsive
              </h3>
              <p className="text-gray-600 font-cormorant">
                Fully responsive design that works perfectly on all device sizes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-space mb-2">
                Accessibility First
              </h3>
              <p className="text-gray-600 font-cormorant">
                WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-space mb-2">
                Performance Optimized
              </h3>
              <p className="text-gray-600 font-cormorant">
                Built with React.memo, lazy loading, and efficient animations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 font-space mb-8 text-center">
            Usage Instructions
          </h2>
          
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 font-space mb-4">
              Basic Implementation
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import SplitScreenCTA from '@/components/SplitScreenCTA';

// Basic usage with defaults
<SplitScreenCTA />

// Customized version
<SplitScreenCTA
  leftTitle="Ready to Transform Your Business?"
  leftDescription="Share your vision with us..."
  leftButtonText="Start Your Project"
  rightTitle="Have Questions?"
  rightDescription="Not sure where to begin?"
  rightButtonText="Let's Talk"
  mailtoEmail="projects@company.com"
  className="my-8"
/>`}
            </pre>

            <h3 className="text-xl font-bold text-gray-900 font-space mb-4 mt-8">
              Available Props
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-space">Prop</th>
                    <th className="text-left py-2 font-space">Type</th>
                    <th className="text-left py-2 font-space">Default</th>
                    <th className="text-left py-2 font-space">Description</th>
                  </tr>
                </thead>
                <tbody className="font-cormorant">
                  <tr className="border-b">
                    <td className="py-2">leftTitle</td>
                    <td className="py-2">string</td>
                    <td className="py-2">&quot;Let&apos;s Work Together&quot;</td>
                    <td className="py-2">Title for the left CTA section</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">leftDescription</td>
                    <td className="py-2">string</td>
                    <td className="py-2">Default description</td>
                    <td className="py-2">Description text for left section</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">leftButtonText</td>
                    <td className="py-2">string</td>
                    <td className="py-2">&quot;Start a Project&quot;</td>
                    <td className="py-2">Button text for modal trigger</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">rightTitle</td>
                    <td className="py-2">string</td>
                    <td className="py-2">&quot;Quick Questions?&quot;</td>
                    <td className="py-2">Title for the right CTA section</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">rightDescription</td>
                    <td className="py-2">string</td>
                    <td className="py-2">Default description</td>
                    <td className="py-2">Description text for right section</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">rightButtonText</td>
                    <td className="py-2">string</td>
                    <td className="py-2">&quot;Send Email&quot;</td>
                    <td className="py-2">Button text for mailto action</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">mailtoEmail</td>
                    <td className="py-2">string</td>
                    <td className="py-2">&quot;hello@ovsia.com&quot;</td>
                    <td className="py-2">Email address for mailto link</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">className</td>
                    <td className="py-2">string</td>
                    <td className="py-2">&quot;&quot;</td>
                    <td className="py-2">Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-cormorant text-lg">
            SplitScreenCTA Component - Built with React, TypeScript, and Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
}