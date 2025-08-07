import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Footer from '../Footer';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    footer: ({ children, ...props }: any) => <footer {...props}>{children}</footer>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
}));

// Mock Date to ensure consistent time in tests
const mockDate = new Date('2024-01-15T10:30:45.000Z');
const originalDate = Date;

beforeAll(() => {
  global.Date = jest.fn(() => mockDate) as any;
  global.Date.now = jest.fn(() => mockDate.getTime());
  Object.setPrototypeOf(global.Date, originalDate);
});

afterAll(() => {
  global.Date = originalDate;
});

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the footer with default content', () => {
      render(<Footer />);
      
      // Check main heading
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Get in Touch');
      
      // Check descriptive text
      expect(screen.getByText('Ready to create something extraordinary together?')).toBeInTheDocument();
      
      // Check email link
      expect(screen.getByRole('link', { name: /send us an email/i })).toHaveAttribute('href', 'mailto:contact@ovsia.com');
      
      // Check copyright
      expect(screen.getByText(/© 2024 Ovsia. All rights reserved./)).toBeInTheDocument();
    });

    it('renders social media links with correct accessibility attributes', () => {
      render(<Footer />);
      
      const socialNav = screen.getByRole('navigation', { name: /social media links/i });
      expect(socialNav).toBeInTheDocument();
      
      const socialLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('twitter.com') ||
        link.getAttribute('href')?.includes('instagram.com') ||
        link.getAttribute('href')?.includes('linkedin.com')
      );
      
      expect(socialLinks).toHaveLength(3);
      
      socialLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('renders legal footer links', () => {
      render(<Footer />);
      
      expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/terms');
      expect(screen.getByRole('link', { name: /imprint/i })).toHaveAttribute('href', '/imprint');
    });
  });

  describe('Berlin Time Display', () => {
    it('displays Berlin time when showTime is true (default)', async () => {
      render(<Footer />);
      
      await waitFor(() => {
        const timeElement = screen.getByText(/Berlin:/);
        expect(timeElement).toBeInTheDocument();
        expect(timeElement).toHaveAttribute('aria-label');
      });
    });

    it('does not display Berlin time when showTime is false', () => {
      render(<Footer showTime={false} />);
      
      expect(screen.queryByText(/Berlin:/)).not.toBeInTheDocument();
    });

    it('updates time display every second', async () => {
      jest.useFakeTimers();
      
      // Mock toLocaleTimeString to return different values
      const mockToLocaleTimeString = jest.fn()
        .mockReturnValueOnce('10:30:45')
        .mockReturnValueOnce('10:30:46');
      
      (Date.prototype as any).toLocaleTimeString = mockToLocaleTimeString;
      
      render(<Footer showTime={true} />);
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText(/Berlin: 10:30:45/)).toBeInTheDocument();
      });
      
      // Advance time by 1 second
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/Berlin: 10:30:46/)).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(<Footer className="custom-footer-class" />);
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('custom-footer-class');
    });

    it('renders custom social links when provided', () => {
      const customSocialLinks = [
        {
          name: 'Custom',
          url: 'https://custom.com',
          ariaLabel: 'Custom social link',
          icon: <span data-testid="custom-icon">Custom Icon</span>
        }
      ];
      
      render(<Footer socialLinks={customSocialLinks} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /custom social link/i })).toHaveAttribute('href', 'https://custom.com');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Footer />);
      
      // Check footer role
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByLabelText('Site footer')).toBeInTheDocument();
      
      // Check navigation role
      expect(screen.getByRole('navigation', { name: /social media links/i })).toBeInTheDocument();
      
      // Check list role
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const emailLink = screen.getByRole('link', { name: /send us an email/i });
      
      // Tab to email link
      await user.tab();
      expect(emailLink).toHaveFocus();
      
      // Continue tabbing through social links
      await user.tab();
      const firstSocialLink = screen.getAllByRole('link').find(link => 
        link.getAttribute('href')?.includes('twitter.com')
      );
      expect(firstSocialLink).toHaveFocus();
    });

    it('has proper focus indicators', () => {
      render(<Footer />);
      
      // Check email link specifically
      const emailLink = screen.getByRole('link', { name: /send us an email/i });
      expect(emailLink).toHaveClass('focus:outline-none');
      
      // Check legal footer links
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toHaveClass('focus:outline-none');
      
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      expect(termsLink).toHaveClass('focus:outline-none');
      
      const imprintLink = screen.getByRole('link', { name: /imprint/i });
      expect(imprintLink).toHaveClass('focus:outline-none');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for different screen sizes', () => {
      render(<Footer />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-6xl', 'sm:text-7xl', 'md:text-8xl', 'lg:text-9xl');
      
      const description = screen.getByText('Ready to create something extraordinary together?');
      expect(description).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl');
    });
  });

  describe('Performance', () => {
    it('cleans up timer on unmount', () => {
      jest.spyOn(global, 'clearInterval');
      
      const { unmount } = render(<Footer showTime={true} />);
      
      unmount();
      
      expect(global.clearInterval).toHaveBeenCalled();
    });

    it('does not create timer when showTime is false', () => {
      jest.spyOn(global, 'setInterval');
      
      render(<Footer showTime={false} />);
      
      expect(global.setInterval).not.toHaveBeenCalled();
    });
  });

  describe('Email Link', () => {
    it('opens email client when clicked', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const emailLink = screen.getByRole('link', { name: /send us an email/i });
      
      await user.click(emailLink);
      
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@ovsia.com');
    });
  });

  describe('Error Handling', () => {
    it('handles missing social links gracefully', () => {
      render(<Footer socialLinks={[]} />);
      
      const socialNav = screen.getByRole('navigation', { name: /social media links/i });
      const socialList = socialNav.querySelector('ul');
      
      expect(socialList).toBeInTheDocument();
      expect(socialList?.children).toHaveLength(0);
    });

    it('handles time formatting errors gracefully', async () => {
      // Mock Date.prototype.toLocaleTimeString to throw an error
      const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      (Date.prototype as any).toLocaleTimeString = jest.fn(() => {
        throw new Error('Time formatting error');
      });
      
      // Should not throw an error and should render fallback time
      const { container } = render(<Footer />);
      
      await waitFor(() => {
        // Should still display some time format
        const timeElement = container.querySelector('[aria-label*="Current time in Berlin"]');
        expect(timeElement).toBeInTheDocument();
      });
      
      // Restore original method
      (Date.prototype as any).toLocaleTimeString = originalToLocaleTimeString;
    });
  });
});