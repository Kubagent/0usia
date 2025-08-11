/**
 * Background Transition System Example
 * 
 * Comprehensive example demonstrating the complete background transition system
 * with multiple sections, smooth animations, and performance optimization.
 * 
 * This example shows:
 * - BackgroundTransitionManager setup
 * - Multiple sections with alternating colors
 * - Enhanced Hero integration
 * - SectionWithTransition usage
 * - Performance monitoring
 * - Accessibility features
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import BackgroundTransitionManager from '../BackgroundTransitionManager';
import SectionWithTransition from '../SectionWithTransition';
import EnhancedHero from '../sections/EnhancedHero';

// Section configuration for alternating black/white backgrounds
const SECTION_CONFIG = [
  {
    id: 'hero',
    backgroundColor: '#ffffff',
    transitionTiming: { start: 0.1, end: 0.4 }
  },
  {
    id: 'about',
    backgroundColor: '#000000',
    transitionTiming: { start: 0.1, end: 0.9 }
  },
  {
    id: 'services',
    backgroundColor: '#ffffff',
    transitionTiming: { start: 0.1, end: 0.9 }
  },
  {
    id: 'portfolio',
    backgroundColor: '#000000',
    transitionTiming: { start: 0.1, end: 0.9 }
  },
  {
    id: 'contact',
    backgroundColor: '#ffffff',
    transitionTiming: { start: 0.1, end: 0.9 }
  }
];

/**
 * Content components for each section
 */
const SectionContent = {
  About: () => (
    <div className="max-w-4xl mx-auto px-6 text-center">
      <motion.h2 
        className="text-5xl font-bold mb-8 font-cormorant"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        About Ovsia
      </motion.h2>
      <motion.p 
        className="text-xl leading-relaxed mb-12 font-space"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        From 0 → 1, we make essence real. Our venture studio builds the impossible 
        through strategic vision, AI operations, and targeted capital investment.
      </motion.p>
      <motion.div 
        className="grid md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div>
          <h3 className="text-2xl font-semibold mb-4">Strategy</h3>
          <p className="opacity-80">Deep market analysis and strategic positioning</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-4">AI Operations</h3>
          <p className="opacity-80">Cutting-edge AI integration and automation</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-4">Capital</h3>
          <p className="opacity-80">Strategic funding and resource allocation</p>
        </div>
      </motion.div>
    </div>
  ),

  Services: () => (
    <div className="max-w-6xl mx-auto px-6">
      <motion.h2 
        className="text-5xl font-bold text-center mb-16 font-cormorant"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Our Services
      </motion.h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {[
          { title: 'Venture Building', desc: 'End-to-end venture creation and development' },
          { title: 'AI Integration', desc: 'Advanced AI solutions and automation systems' },
          { title: 'Strategic Consulting', desc: 'Market analysis and strategic positioning' },
          { title: 'Capital Investment', desc: 'Funding and resource allocation' },
          { title: 'Operations Support', desc: 'Operational excellence and scaling' },
          { title: 'Technology Platform', desc: 'Custom technology solutions and platforms' }
        ].map((service, index) => (
          <motion.div
            key={service.title}
            className="p-6 rounded-lg border border-current/20 hover:border-current/40 transition-colors"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
            <p className="opacity-80">{service.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  ),

  Portfolio: () => (
    <div className="max-w-6xl mx-auto px-6">
      <motion.h2 
        className="text-5xl font-bold text-center mb-16 font-cormorant"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Our Portfolio
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-12">
        {[
          { name: 'Venture Alpha', stage: 'Series A', description: 'AI-powered analytics platform' },
          { name: 'Venture Beta', stage: 'Seed', description: 'Sustainable energy solutions' },
          { name: 'Venture Gamma', stage: 'Pre-Seed', description: 'Healthcare technology platform' },
          { name: 'Venture Delta', stage: 'Series B', description: 'Fintech infrastructure' }
        ].map((venture, index) => (
          <motion.div
            key={venture.name}
            className="p-8 rounded-lg border border-current/20 hover:border-current/40 transition-colors"
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-semibold">{venture.name}</h3>
              <span className="px-3 py-1 rounded-full text-sm border border-current/30">
                {venture.stage}
              </span>
            </div>
            <p className="opacity-80">{venture.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  ),

  Contact: () => (
    <div className="max-w-4xl mx-auto px-6 text-center">
      <motion.h2 
        className="text-5xl font-bold mb-8 font-cormorant"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Let's Build Together
      </motion.h2>
      <motion.p 
        className="text-xl leading-relaxed mb-12 font-space"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Ready to transform your vision into reality? Let's discuss how we can 
        accelerate your journey from 0 to 1.
      </motion.p>
      <motion.div 
        className="flex flex-col sm:flex-row gap-6 justify-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <motion.button
          className="px-8 py-4 rounded-full border-2 border-current hover:bg-current hover:text-white transition-colors font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start a Conversation
        </motion.button>
        <motion.button
          className="px-8 py-4 rounded-full bg-current text-white hover:opacity-80 transition-opacity font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Our Deck
        </motion.button>
      </motion.div>
    </div>
  )
};

/**
 * Main Background Transition Example Component
 */
export const BackgroundTransitionExample: React.FC = () => {
  return (
    <div className="relative">
      {/* Background Transition Manager - Controls global background */}
      <BackgroundTransitionManager
        currentSection={0}
        totalSections={4}
        transitionDuration={0.8}
        easing={[0.25, 0.46, 0.45, 0.94]}
        enableProfiling={process.env.NODE_ENV === 'development'}
        respectReducedMotion={true}
      >
        {/* Hero Section - Uses EnhancedHero with integrated transitions */}
        <EnhancedHero 
          enableProfiling={process.env.NODE_ENV === 'development'}
          enableA11y={true}
        />

        {/* About Section - Dark background */}
        <SectionWithTransition
          id="about"
          backgroundColor="#000000"
          contentColor="light"
          enableAnimations={true}
          enableScrollEffects={true}
        >
          <div className="flex items-center justify-center min-h-screen">
            <SectionContent.About />
          </div>
        </SectionWithTransition>

        {/* Services Section - Light background */}
        <SectionWithTransition
          id="services"
          backgroundColor="#ffffff"
          contentColor="dark"
          enableAnimations={true}
        >
          <div className="flex items-center justify-center min-h-screen">
            <SectionContent.Services />
          </div>
        </SectionWithTransition>

        {/* Portfolio Section - Dark background */}
        <SectionWithTransition
          id="portfolio"
          backgroundColor="#000000"
          contentColor="light"
          enableAnimations={true}
          enableScrollEffects={true}
        >
          <div className="flex items-center justify-center min-h-screen">
            <SectionContent.Portfolio />
          </div>
        </SectionWithTransition>

        {/* Contact Section - Light background */}
        <SectionWithTransition
          id="contact"
          backgroundColor="#ffffff"
          contentColor="dark"
          enableAnimations={true}
        >
          <div className="flex items-center justify-center min-h-screen">
            <SectionContent.Contact />
          </div>
        </SectionWithTransition>

        {/* Performance Information Panel (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
          >
            <div className="font-semibold mb-2">Background Transitions</div>
            <div className="text-xs space-y-1 opacity-80">
              <div>• Smooth scroll-triggered color changes</div>
              <div>• Hardware-accelerated transitions</div>
              <div>• Automatic content theme adaptation</div>
              <div>• Performance monitoring active</div>
              <div>• Accessibility features enabled</div>
            </div>
          </motion.div>
        )}
      </BackgroundTransitionManager>
    </div>
  );
};

export default BackgroundTransitionExample;