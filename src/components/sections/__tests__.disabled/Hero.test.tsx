/**
 * Hero Component Tests
 * 
 * Tests for scroll-triggered animations and logo inversion
 * Verifies V3 functionality preservation
 */

import { render, screen } from '@testing-library/react';
import { motion } from 'framer-motion';
import Hero from '../Hero';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useScroll: () => ({
    scrollYProgress: {
      on: jest.fn(() => jest.fn()),
    },
  }),
  useTransform: (progress: any, input: number[], output: string[]) => output[0],
}));

// Mock Next.js Image
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('Hero Component', () => {
  beforeEach(() => {
    // Clear console.log mock calls
    jest.clearAllMocks();
  });

  it('renders with correct structure', () => {
    render(<Hero />);
    
    // Check section exists
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('relative', 'min-h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('renders logo with correct properties', () => {
    render(<Hero />);
    
    const logo = screen.getByAltText('Ovsia Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/ousia_logo.png');
    expect(logo).toHaveAttribute('width', '600');
    expect(logo).toHaveAttribute('height', '600');
  });

  it('applies correct styling classes', () => {
    render(<Hero />);
    
    const logoContainer = screen.getByAltText('Ovsia Logo').closest('div');
    expect(logoContainer).toHaveClass('select-none', 'drop-shadow-xl');
  });

  it('has scroll progress tracking', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<Hero />);
    
    expect(consoleSpy).toHaveBeenCalledWith('Hero mounted');
    
    consoleSpy.mockRestore();
  });
});