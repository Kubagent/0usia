import React from 'react';
import SplitScreenCTA from '../SplitScreenCTA';

/**
 * SplitScreenCTA Usage Examples
 * 
 * This file contains various usage examples of the SplitScreenCTA component
 * for different business contexts and use cases.
 */

// Agency/Consulting Version
export const AgencyCTA = () => (
  <SplitScreenCTA
    leftTitle="Ready to Transform Your Business?"
    leftDescription="Share your vision with us and we'll craft a strategic solution that drives real results for your company."
    leftButtonText="Start Your Project"
    rightTitle="Have Questions?"
    rightDescription="Not sure where to begin? Let's have a conversation about your goals and challenges."
    rightButtonText="Let's Talk"
    mailtoEmail="projects@ovsia.com"
  />
);

// SaaS Product Version
export const SaaSCTA = () => (
  <SplitScreenCTA
    leftTitle="Ready to Get Started?"
    leftDescription="Sign up for a personalized demo and see how our platform can streamline your workflow."
    leftButtonText="Request Demo"
    rightTitle="Need Support?"
    rightDescription="Our team is here to help you succeed. Get in touch for technical assistance."
    rightButtonText="Contact Support"
    mailtoEmail="support@ovsia.com"
  />
);

// E-commerce Version
export const EcommerceCTA = () => (
  <SplitScreenCTA
    leftTitle="Custom Orders Welcome"
    leftDescription="Need something special? Tell us about your requirements and we'll create a custom solution just for you."
    leftButtonText="Request Custom Quote"
    rightTitle="Quick Questions?"
    rightDescription="Have a question about our products, shipping, or returns? We're here to help."
    rightButtonText="Ask a Question"
    mailtoEmail="orders@ovsia.com"
  />
);

// Creative Studio Version
export const CreativeCTA = () => (
  <SplitScreenCTA
    leftTitle="Let's Create Something Amazing"
    leftDescription="Share your creative vision and let's collaborate to bring your ideas to life with stunning design and flawless execution."
    leftButtonText="Start Collaboration"
    rightTitle="Portfolio Questions?"
    rightDescription="Want to see more of our work or discuss a specific project? Let's connect."
    rightButtonText="View Portfolio"
    mailtoEmail="creative@ovsia.com"
  />
);

// Technology Company Version
export const TechCTA = () => (
  <SplitScreenCTA
    leftTitle="Scale Your Innovation"
    leftDescription="Partner with our technical experts to build cutting-edge solutions that drive your business forward."
    leftButtonText="Discuss Your Project"
    rightTitle="Technical Questions?"
    rightDescription="Need clarification on our capabilities or technical approach? Our engineering team is ready to help."
    rightButtonText="Talk to Engineers"
    mailtoEmail="tech@ovsia.com"
  />
);

// Startup/Investment Version
export const StartupCTA = () => (
  <SplitScreenCTA
    leftTitle="Turn Your Idea Into Reality"
    leftDescription="From concept to launch, we'll help you build and scale your startup with proven strategies and cutting-edge technology."
    leftButtonText="Get Started"
    rightTitle="Quick Chat?"
    rightDescription="Have an idea you want to bounce off someone? Let's have an informal conversation about your vision."
    rightButtonText="Schedule Call"
    mailtoEmail="ventures@ovsia.com"
  />
);

// Default/General Version (same as component default)
export const DefaultCTA = () => <SplitScreenCTA />;

// With custom styling
export const CustomStyledCTA = () => (
  <SplitScreenCTA
    leftTitle="Custom Styling Example"
    leftDescription="This example shows how you can add custom classes to modify the appearance."
    leftButtonText="Explore Customization"
    rightTitle="Need Help?"
    rightDescription="Our documentation includes comprehensive styling guides."
    rightButtonText="View Docs"
    mailtoEmail="docs@ovsia.com"
    className="my-16 shadow-2xl rounded-2xl overflow-hidden"
  />
);

// Minimal Version
export const MinimalCTA = () => (
  <SplitScreenCTA
    leftTitle="Get In Touch"
    leftDescription="Ready to work together?"
    leftButtonText="Contact Us"
    rightTitle="Quick Email"
    rightDescription="Send us a message."
    rightButtonText="Email"
    mailtoEmail="hello@ovsia.com"
  />
);

/**
 * Usage in your application:
 * 
 * import { AgencyCTA } from '@/components/examples/SplitScreenCTAExamples';
 * 
 * function ContactPage() {
 *   return (
 *     <div>
 *       <AgencyCTA />
 *     </div>
 *   );
 * }
 */