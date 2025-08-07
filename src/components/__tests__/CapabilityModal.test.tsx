import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CapabilityModal from '../CapabilityModal';
import { CapabilityCard } from '@/types/capability';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockCard: CapabilityCard = {
  id: 'test-modal',
  title: 'Test Card',
  description: 'Test description',  
  icon: '🧪',
  color: 'bg-blue-100',
  modalContent: {
    title: 'Test Modal Title',
    description: 'This is a test modal description with detailed information.',
    features: [
      'Feature 1: First test feature',
      'Feature 2: Second test feature', 
      'Feature 3: Third test feature'
    ],
    examples: [
      'Example 1: First example',
      'Example 2: Second example'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS']
  }
};

describe('CapabilityModal', () => {
  const defaultProps = {
    card: mockCard,
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock body style
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('renders modal when open with card data', () => {
    render(<CapabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal description with detailed information.')).toBeInTheDocument();
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByText('Examples')).toBeInTheDocument();
    expect(screen.getByText('Technologies')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CapabilityModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Modal Title')).not.toBeInTheDocument();
  });

  it('does not render when no card provided', () => {
    render(<CapabilityModal {...defaultProps} card={null} />);
    
    expect(screen.queryByText('Test Modal Title')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const mockOnClose = jest.fn();
    render(<CapabilityModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    const mockOnClose = jest.fn();
    render(<CapabilityModal {...defaultProps} onClose={mockOnClose} />);
    
    // Find the backdrop (parent div with dialog role)
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content clicked', () => {
    const mockOnClose = jest.fn();
    render(<CapabilityModal {...defaultProps} onClose={mockOnClose} />);
    
    const modalContent = screen.getByText('Test Modal Title');
    fireEvent.click(modalContent);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles escape key press', () => {
    const mockOnClose = jest.fn();
    render(<CapabilityModal {...defaultProps} onClose={mockOnClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll when open', () => {
    render(<CapabilityModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<CapabilityModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<CapabilityModal {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('unset');
  });

  it('renders all features in list', () => {
    render(<CapabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Feature 1: First test feature')).toBeInTheDocument();
    expect(screen.getByText('Feature 2: Second test feature')).toBeInTheDocument();
    expect(screen.getByText('Feature 3: Third test feature')).toBeInTheDocument();
  });

  it('renders all examples', () => {
    render(<CapabilityModal {...defaultProps} />);
    
    expect(screen.getByText('Example 1: First example')).toBeInTheDocument();
    expect(screen.getByText('Example 2: Second example')).toBeInTheDocument();
  });

  it('renders all technologies as tags', () => {
    render(<CapabilityModal {...defaultProps} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
  });

  it('handles card without optional fields', () => {
    const minimalCard: CapabilityCard = {
      id: 'minimal',
      title: 'Minimal Card',
      description: 'Minimal description',
      icon: '⚡',
      color: 'bg-gray-100',
      modalContent: {
        title: 'Minimal Modal',
        description: 'Minimal modal description',
        features: []
      }
    };

    render(<CapabilityModal {...defaultProps} card={minimalCard} />);
    
    expect(screen.getByText('Minimal Modal')).toBeInTheDocument();
    expect(screen.getByText('Minimal modal description')).toBeInTheDocument();
    
    // Should not render empty sections
    expect(screen.queryByText('Examples')).not.toBeInTheDocument();
    expect(screen.queryByText('Technologies')).not.toBeInTheDocument();
  });

  it('calls Learn More action', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<CapabilityModal {...defaultProps} />);
    
    const learnMoreButton = screen.getByText('Learn More');
    fireEvent.click(learnMoreButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Interest in Test Card');
    
    consoleSpy.mockRestore();
  });

  it('has proper accessibility attributes', () => {
    render(<CapabilityModal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    
    const title = screen.getByText('Test Modal Title');
    expect(title).toHaveAttribute('id', 'modal-title');
    
    const description = screen.getByText('This is a test modal description with detailed information.');
    expect(description).toHaveAttribute('id', 'modal-description');
  });

  it('focuses modal on open', async () => {
    render(<CapabilityModal {...defaultProps} />);
    
    await waitFor(() => {
      const modal = document.getElementById('capability-modal');
      expect(modal).toBeInTheDocument();
    });
  });
});