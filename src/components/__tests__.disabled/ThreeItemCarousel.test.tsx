import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreeItemCarousel, { CarouselItem } from '../ThreeItemCarousel';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock data for testing
const mockCarouselItems: CarouselItem[] = [
  {
    id: 'test-1',
    title: 'Test Slide 1',
    subtitle: 'First Slide',
    description: 'This is the first test slide',
    backgroundColor: '#000000',
    textColor: 'text-white',
    overlayContent: {
      title: 'Test Overlay 1',
      details: ['Detail 1', 'Detail 2'],
      callToAction: 'Test CTA'
    }
  },
  {
    id: 'test-2',
    title: 'Test Slide 2',
    subtitle: 'Second Slide',
    description: 'This is the second test slide',
    backgroundColor: '#111111',
    textColor: 'text-white',
    overlayContent: {
      title: 'Test Overlay 2',
      details: ['Detail A', 'Detail B'],
      callToAction: 'Test CTA 2'
    }
  },
  {
    id: 'test-3',
    title: 'Test Slide 3',
    subtitle: 'Third Slide',
    description: 'This is the third test slide',
    backgroundColor: '#222222',
    textColor: 'text-white'
  }
];

// Helper function to advance timers
const advanceTimers = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe('ThreeItemCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders carousel with items', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      expect(screen.getByRole('region', { name: 'Three-item carousel' })).toBeInTheDocument();
      expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
      expect(screen.getByText('First Slide')).toBeInTheDocument();
      expect(screen.getByText('This is the first test slide')).toBeInTheDocument();
    });

    it('renders navigation arrows', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    });

    it('renders slide indicators', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 3')).toBeInTheDocument();
    });

    it('renders progress bar when enabled', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} showProgressBar={true} />);
      
      // Progress bar should be present in the DOM
      const progressBars = document.querySelectorAll('[class*="bg-white"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('handles empty items array', () => {
      render(<ThreeItemCarousel items={[]} />);
      
      expect(screen.getByText('No carousel items available')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to next slide on arrow click', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const nextButton = screen.getByLabelText('Next slide');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
      });
    });

    it('navigates to previous slide on arrow click', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const prevButton = screen.getByLabelText('Previous slide');
      fireEvent.click(prevButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Slide 3')).toBeInTheDocument();
      });
    });

    it('navigates via slide indicators', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const thirdSlideButton = screen.getByLabelText('Go to slide 3');
      fireEvent.click(thirdSlideButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Slide 3')).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const carousel = screen.getByRole('region');
      carousel.focus();
      
      // Navigate right
      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
      });
      
      // Navigate left
      await user.keyboard('{ArrowLeft}');
      await waitFor(() => {
        expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
      });
    });
  });

  describe('Autoplay', () => {
    it('auto-advances slides', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} autoplayInterval={1000} />);
      
      expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
      
      await advanceTimers(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
      });
    });

    it('pauses on hover when enabled', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ThreeItemCarousel 
          items={mockCarouselItems} 
          autoplayInterval={1000}
          enableHoverPause={true}
        />
      );
      
      const carousel = screen.getByRole('region');
      
      // Hover to pause
      await user.hover(carousel);
      
      await waitFor(() => {
        expect(screen.getByText('Paused on Hover')).toBeInTheDocument();
      });
      
      // Advance time - should not change slide
      await advanceTimers(1500);
      expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
      
      // Unhover to resume
      await user.unhover(carousel);
      
      await waitFor(() => {
        expect(screen.queryByText('Paused on Hover')).not.toBeInTheDocument();
      });
    });

    it('does not pause on hover when disabled', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ThreeItemCarousel 
          items={mockCarouselItems} 
          autoplayInterval={1000}
          enableHoverPause={false}
        />
      );
      
      const carousel = screen.getByRole('region');
      await user.hover(carousel);
      
      // Should not show pause indicator
      expect(screen.queryByText('Paused on Hover')).not.toBeInTheDocument();
    });
  });

  describe('Overlay System', () => {
    it('opens overlay on learn more button click', async () => {
      const user = userEvent.setup();
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const learnMoreButton = screen.getByText('Learn More');
      await user.click(learnMoreButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Overlay 1')).toBeInTheDocument();
        expect(screen.getByText('Detail 1')).toBeInTheDocument();
        expect(screen.getByText('Detail 2')).toBeInTheDocument();
        expect(screen.getByText('Test CTA')).toBeInTheDocument();
      });
    });

    it('closes overlay on close button click', async () => {
      const user = userEvent.setup();
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      // Open overlay
      const learnMoreButton = screen.getByText('Learn More');
      await user.click(learnMoreButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Overlay 1')).toBeInTheDocument();
      });
      
      // Close overlay
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Test Overlay 1')).not.toBeInTheDocument();
      });
    });

    it('closes overlay on escape key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      // Open overlay with Enter key
      const carousel = screen.getByRole('region');
      carousel.focus();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Test Overlay 1')).toBeInTheDocument();
      });
      
      // Close with Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Test Overlay 1')).not.toBeInTheDocument();
      });
    });

    it('does not show learn more button when no overlay content', () => {
      const itemsWithoutOverlay = mockCarouselItems.map(item => ({
        ...item,
        overlayContent: undefined
      }));
      
      render(<ThreeItemCarousel items={itemsWithoutOverlay} />);
      
      expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
    });
  });

  describe('Touch Events', () => {
    it('handles touch swipe right to go to next slide', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const carousel = screen.getByRole('region');
      
      // Simulate swipe right (touch start at 100, end at 50 = -50 distance = next)
      fireEvent.touchStart(carousel, {
        targetTouches: [{ clientX: 100 }]
      });
      
      fireEvent.touchMove(carousel, {
        targetTouches: [{ clientX: 50 }]
      });
      
      fireEvent.touchEnd(carousel);
      
      await waitFor(() => {
        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
      });
    });

    it('handles touch swipe left to go to previous slide', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const carousel = screen.getByRole('region');
      
      // Simulate swipe left (touch start at 50, end at 100 = +50 distance = previous)
      fireEvent.touchStart(carousel, {
        targetTouches: [{ clientX: 50 }]
      });
      
      fireEvent.touchMove(carousel, {
        targetTouches: [{ clientX: 100 }]
      });
      
      fireEvent.touchEnd(carousel);
      
      await waitFor(() => {
        expect(screen.getByText('Test Slide 3')).toBeInTheDocument();
      });
    });

    it('ignores small swipe distances', async () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const carousel = screen.getByRole('region');
      
      // Simulate small swipe (less than threshold)
      fireEvent.touchStart(carousel, {
        targetTouches: [{ clientX: 100 }]
      });
      
      fireEvent.touchMove(carousel, {
        targetTouches: [{ clientX: 90 }] // Only 10px difference
      });
      
      fireEvent.touchEnd(carousel);
      
      // Should still be on first slide
      expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onItemClick when item is clicked', async () => {
      const mockOnItemClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <ThreeItemCarousel 
          items={mockCarouselItems} 
          onItemClick={mockOnItemClick}
        />
      );
      
      const learnMoreButton = screen.getByText('Learn More');
      await user.click(learnMoreButton);
      
      expect(mockOnItemClick).toHaveBeenCalledWith(mockCarouselItems[0]);
    });

    it('calls onItemClick on Enter key press', async () => {
      const mockOnItemClick = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <ThreeItemCarousel 
          items={mockCarouselItems} 
          onItemClick={mockOnItemClick}
        />
      );
      
      const carousel = screen.getByRole('region');
      carousel.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnItemClick).toHaveBeenCalledWith(mockCarouselItems[0]);
    });
  });

  describe('Progress Bar', () => {
    it('shows progress bar when enabled', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} showProgressBar={true} />);
      
      // Check if progress bar container exists
      const progressBar = document.querySelector('.bg-white.bg-opacity-20');
      expect(progressBar).toBeInTheDocument();
    });

    it('hides progress bar when disabled', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} showProgressBar={false} />);
      
      // Check if progress bar container doesn't exist
      const progressBar = document.querySelector('.bg-white.bg-opacity-20');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('pauses progress when hovered', async () => {
      const user = userEvent.setup();
      render(
        <ThreeItemCarousel 
          items={mockCarouselItems} 
          showProgressBar={true}
          enableHoverPause={true}
        />
      );
      
      const carousel = screen.getByRole('region');
      await user.hover(carousel);
      
      // Progress bar should be hidden when paused
      await waitFor(() => {
        const progressBar = document.querySelector('.bg-white.bg-opacity-20');
        expect(progressBar).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      expect(screen.getByRole('region', { name: 'Three-item carousel' })).toBeInTheDocument();
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
    });

    it('is focusable and supports keyboard navigation', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const carousel = screen.getByRole('region');
      expect(carousel).toHaveAttribute('tabIndex', '0');
    });

    it('has aria-live region for announcements', () => {
      render(<ThreeItemCarousel items={mockCarouselItems} />);
      
      const carousel = screen.getByRole('region');
      expect(carousel).toHaveAttribute('aria-live', 'polite');
    });
  });
});