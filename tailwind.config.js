/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'serif'],
        space: ['Space Grotesk', 'sans-serif'],
        reckless: ['Reckless Neue', 'serif'],
      },
      colors: {
        'ovsia-black': '#000000',
        'ovsia-white': '#FFFFFF',
        'ovsia-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'rotate-in': 'rotateIn 0.5s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-10deg) scale(0.9)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
        900: '900ms',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        xs: '475px',
        '3xl': '1600px',
      },
      // Unified Font Size System - Three Categories
      fontSize: {
        // Extend default sizes with our custom sizes
        ...require('tailwindcss/defaultTheme').fontSize,
        // Body Size (Smallest) - for content, body text, sub headers
        'ovsia-body-xs': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'ovsia-body-sm': ['1rem', { lineHeight: '1.5rem' }], // 16px
        'ovsia-body-base': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'ovsia-body-lg': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        'ovsia-body-xl': ['1.375rem', { lineHeight: '1.875rem' }], // 22px
        'ovsia-body-2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        
        // Header Size (Medium) - for navigation, section headers
        'ovsia-header-sm': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        'ovsia-header-base': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        'ovsia-header-lg': ['2.5rem', { lineHeight: '3rem' }], // 40px
        'ovsia-header-lg-plus': ['3.125rem', { lineHeight: '3.625rem' }], // 50px
        'ovsia-header-xl': ['3rem', { lineHeight: '3.5rem' }], // 48px
        'ovsia-header-2xl': ['3.5rem', { lineHeight: '4rem' }], // 56px
        'ovsia-header-3xl': ['4rem', { lineHeight: '4.5rem' }], // 64px
        'ovsia-header-4xl': ['4.8rem', { lineHeight: '5.25rem' }], // 77px (~20% larger)

        // Tagline Size (Largest) - for main taglines, hero text
        'ovsia-tagline-sm': ['4.5rem', { lineHeight: '5rem' }], // 72px
        'ovsia-tagline-base': ['5rem', { lineHeight: '5.5rem' }], // 80px
        'ovsia-tagline-lg': ['6rem', { lineHeight: '6.5rem' }], // 96px
        'ovsia-tagline-xl': ['7rem', { lineHeight: '7.5rem' }], // 112px
        'ovsia-tagline-2xl': ['8rem', { lineHeight: '8.5rem' }], // 128px
        'ovsia-tagline-3xl': ['10rem', { lineHeight: '10.5rem' }], // 160px
        'ovsia-tagline-4xl': ['12rem', { lineHeight: '12.5rem' }], // 192px
        'ovsia-tagline-5xl': ['14rem', { lineHeight: '14.5rem' }], // 224px
        'ovsia-tagline-6xl': ['16rem', { lineHeight: '16.5rem' }], // 256px
      },
      // 3D perspective utilities for rotating cards
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
        '2000': '2000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
        'flat': 'flat',
      },
    },
  },
  plugins: [
    // Custom plugin for 3D transforms
    function({ addUtilities }) {
      const newUtilities = {
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.perspective-1500': {
          perspective: '1500px',
        },
        '.perspective-2000': {
          perspective: '2000px',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.transform-gpu': {
          transform: 'translateZ(0)',
          'will-change': 'transform',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
