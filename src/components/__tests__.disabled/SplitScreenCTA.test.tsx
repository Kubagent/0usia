import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SplitScreenCTA from '../SplitScreenCTA';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock window.location.href
delete (window as any).location;
window.location = { href: '' } as any;

describe('SplitScreenCTA Component', () => {
  const defaultProps = {
    leftTitle: 'Test Left Title',
    leftDescription: 'Test left description',
    leftButtonText: 'Test Left Button',
    rightTitle: 'Test Right Title', 
    rightDescription: 'Test right description',
    rightButtonText: 'Test Right Button',
    mailtoEmail: 'test@example.com',
  };

  beforeEach(() => {
    window.location.href = '';
  });

  it('renders with default props', () => {
    render(<SplitScreenCTA />);
    
    expect(screen.getByText("Let's Work Together")).toBeInTheDocument();
    expect(screen.getByText('Quick Questions?')).toBeInTheDocument();
    expect(screen.getByText('Start a Project')).toBeInTheDocument();
    expect(screen.getByText('Send Email')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(<SplitScreenCTA {...defaultProps} />);
    
    expect(screen.getByText('Test Left Title')).toBeInTheDocument();
    expect(screen.getByText('Test Right Title')).toBeInTheDocument();
    expect(screen.getByText('Test Left Button')).toBeInTheDocument();
    expect(screen.getByText('Test Right Button')).toBeInTheDocument();
  });

  it('opens modal when left button is clicked', async () => {
    const user = userEvent.setup();
    render(<SplitScreenCTA {...defaultProps} />);
    
    const leftButton = screen.getByText('Test Left Button');
    await user.click(leftButton);
    
    expect(screen.getByText('Start Your Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Details *')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SplitScreenCTA {...defaultProps} />);
    
    // Open modal
    const leftButton = screen.getByText('Test Left Button');
    await user.click(leftButton);
    
    // Close modal
    const closeButton = screen.getByLabelText('Close modal');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Start Your Project')).not.toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<SplitScreenCTA {...defaultProps} />);
    
    // Open modal
    const leftButton = screen.getByText('Test Left Button');
    await user.click(leftButton);
    
    // Close modal
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Start Your Project')).not.toBeInTheDocument();
    });
  });

  it('generates correct mailto link when right button is clicked', async () => {
    const user = userEvent.setup();
    render(<SplitScreenCTA {...defaultProps} />);
    
    const rightButton = screen.getByText('Test Right Button');
    await user.click(rightButton);
    
    expect(window.location.href).toContain('mailto:test@example.com');
    expect(window.location.href).toContain('subject=Quick%20Question');
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Try to submit empty form
      const submitButton = screen.getByText('Send Message');
      await user.click(submitButton);
      
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Fill with invalid email
      const emailInput = screen.getByLabelText('Email *');
      await user.type(emailInput, 'invalid-email');
      
      // Try to submit
      const submitButton = screen.getByText('Send Message');
      await user.click(submitButton);
      
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });

    it('validates successfully with all required fields filled', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Fill form
      await user.type(screen.getByLabelText('Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email *'), 'john@example.com');
      await user.type(screen.getByLabelText('Project Details *'), 'Test project description');
      
      // Submit form
      const submitButton = screen.getByText('Send Message');
      await user.click(submitButton);
      
      // Should show loading state
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      
      // Should close modal after submission
      await waitFor(() => {
        expect(screen.queryByText('Start Your Project')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('File Upload', () => {
    it('allows file selection via input', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Create a test file
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      // Upload file
      const fileInput = screen.getByLabelText('Upload file');
      await user.upload(fileInput, file);
      
      // Should show file name
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('removes file when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Upload file
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText('Upload file');
      await user.upload(fileInput, file);
      
      // Remove file
      const removeButton = screen.getByText('Remove file');
      await user.click(removeButton);
      
      // Should show upload prompt again
      expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });

    it('handles drag and drop file upload', async () => {
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      fireEvent.click(leftButton);
      
      const uploadArea = screen.getByText('Click to upload or drag and drop').closest('div');
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      // Simulate drag over
      fireEvent.dragOver(uploadArea!);
      
      // Simulate drop
      fireEvent.drop(uploadArea!, {
        dataTransfer: {
          files: [file],
        },
      });
      
      // Should show file name
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Check button ARIA labels
      expect(screen.getByLabelText(/Open form to test left button/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Test Right Button to test@example.com/i)).toBeInTheDocument();
      
      // Open modal and check form accessibility
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Check form labels
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Details *')).toBeInTheDocument();
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('shows error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Open modal
      const leftButton = screen.getByText('Test Left Button');
      await user.click(leftButton);
      
      // Submit empty form to trigger errors
      const submitButton = screen.getByText('Send Message');
      await user.click(submitButton);
      
      // Check error message accessibility
      const nameInput = screen.getByLabelText('Name *');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      
      const emailInput = screen.getByLabelText('Email *');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      
      const messageInput = screen.getByLabelText('Project Details *');
      expect(messageInput).toHaveAttribute('aria-describedby', 'message-error');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Test Tab navigation
      await user.tab();
      expect(screen.getByText('Test Left Button')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Test Right Button')).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('uses React.memo for optimization', () => {
      // Check that component is wrapped with memo
      expect(SplitScreenCTA.displayName).toBe(undefined); // memo components don't have displayName by default
      expect(typeof SplitScreenCTA).toBe('object'); // memo returns an object, not function
    });
  });

  describe('Responsive Design', () => {
    it('applies correct responsive classes', () => {
      render(<SplitScreenCTA {...defaultProps} />);
      
      // Check for responsive grid classes
      const gridContainer = screen.getByText('Test Left Title').closest('.grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-2');
      
      // Check for responsive padding classes
      const leftSection = screen.getByText('Test Left Title').closest('div');
      expect(leftSection).toHaveClass('px-8', 'lg:px-16');
    });
  });
});