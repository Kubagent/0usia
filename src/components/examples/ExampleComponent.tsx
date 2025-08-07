'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Example Component - Demonstrates the V4 tech stack
 * 
 * This component showcases:
 * - TypeScript interfaces and type safety
 * - Tailwind CSS with custom design system
 * - Framer Motion animations
 * - React hooks and best practices
 * - Accessibility features
 * - Performance optimizations
 */

interface ExampleProps {
  title?: string;
  description?: string;
  variant?: 'primary' | 'secondary';
  animate?: boolean;
}

export default function ExampleComponent({
  title = 'Example Component',
  description = 'This showcases the Ovsia V4 tech stack',
  variant = 'primary',
  animate = true,
}: ExampleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [count, setCount] = useState(0);

  const variants = {
    primary: 'bg-ovsia-black text-ovsia-white',
    secondary: 'bg-ovsia-white text-ovsia-black border-2 border-ovsia-black',
  };

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        whileHover: { scale: 1.02 },
        transition: { duration: 0.3, ease: 'easeOut' },
      }
    : {};

  return (
    <motion.div
      className={`
        p-8 rounded-lg shadow-lg max-w-md mx-auto
        ${variants[variant]}
        transition-all duration-300 ease-in-out
        hover:shadow-xl
        focus-within:ring-2 focus-within:ring-ovsia-gray-400
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...animationProps}
      role="article"
      aria-labelledby="example-title"
      aria-describedby="example-description"
    >
      {/* Header */}
      <div className="mb-4">
        <h2
          id="example-title"
          className="text-2xl font-cormorant font-bold mb-2"
        >
          {title}
        </h2>
        <p
          id="example-description"
          className="text-sm font-space opacity-80"
        >
          {description}
        </p>
      </div>

      {/* Interactive Content */}
      <div className="space-y-4">
        {/* Animation Demo */}
        <motion.div
          className="w-full h-2 bg-ovsia-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-ovsia-gray-600 to-ovsia-gray-800"
            animate={{
              width: isHovered ? '100%' : '30%',
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Counter Demo */}
        <div className="flex items-center justify-between">
          <span className="font-space text-sm">
            Count: <span className="font-bold">{count}</span>
          </span>
          <button
            onClick={() => setCount(prev => prev + 1)}
            className={`
              px-4 py-2 rounded-md font-space text-sm font-medium
              transition-all duration-200
              ${
                variant === 'primary'
                  ? 'bg-ovsia-white text-ovsia-black hover:bg-ovsia-gray-100'
                  : 'bg-ovsia-black text-ovsia-white hover:bg-ovsia-gray-800'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ovsia-gray-400
              active:scale-95
            `}
            aria-label={`Increment counter, current value is ${count}`}
          >
            Increment
          </button>
        </div>

        {/* Typography Demo */}
        <div className="pt-4 border-t border-current border-opacity-20">
          <p className="text-xs font-space opacity-60">
            Fonts: Cormorant Garamond (headings) • Space Grotesk (body)
          </p>
          <div className="mt-2 flex gap-2">
            <span className="animate-pulse-subtle text-xs">✨</span>
            <span className="animate-bounce-subtle text-xs">🚀</span>
            <span className="animate-float text-xs">💫</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <ExampleComponent />
 * 
 * // With custom props
 * <ExampleComponent 
 *   title="Custom Title"
 *   description="Custom description text"
 *   variant="secondary"
 *   animate={false}
 * />
 * 
 * // In a layout
 * <div className="grid gap-6 md:grid-cols-2">
 *   <ExampleComponent variant="primary" />
 *   <ExampleComponent variant="secondary" />
 * </div>
 */