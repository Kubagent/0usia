'use client';

import { motion } from 'framer-motion';

export default function PrinciplesSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-ovsia-header-3xl font-cormorant tracking-tight text-black mb-4">
            Our Principles
          </h2>
          <p className="text-ovsia-body-xl text-black font-light max-w-2xl mx-auto">
            The foundation of how we create value
          </p>
        </div>
        {/* Circle will go here */}
      </div>
    </section>
  );
}
