import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import RotatingCapabilityCards from '../RotatingCapabilityCards';
import { CapabilityCard } from '@/types/capability';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock data for testing
const mockCards: CapabilityCard[] = [
  {
    id: 'test-1',
    title: 'Test Card 1',
    description: 'Test description 1',
    icon: '🧪',
    color: 'bg-blue-100',
    modalContent: {
      title: 'Test Modal 1',
      description: 'Test modal description 1',
      features: ['Feature 1', 'Feature 2'],
      examples: ['Example 1'],
      technologies: ['Tech 1'],
    },
  },
  {
    id: 'test-2',
    title: 'Test Card 2',
    description: 'Test description 2',
    icon: '⚡',
    color: 'bg-green-100',
    modalContent: {
      title: 'Test Modal 2',
      description: 'Test modal description 2',
      features: ['Feature A', 'Feature B'],
      examples: ['Example A'],
      technologies: ['Tech A'],
    },
  },
];

describe('RotatingCapabilityCards', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with cards', () => {
    render(<RotatingCapabilityCards cards={mockCards} />);
    
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /rotating capability cards/i })).toBeInTheDocument();
  });

  it('renders empty state when no cards provided', () => {
    render(<RotatingCapabilityCards cards={[]} />);
    
    expect(screen.getByText('No capability cards available')).toBeInTheDocument();
  });

  it('auto-rotates cards after specified interval', () => {
    render(<RotatingCapabilityCards cards={mockCards} rotationInterval={1000} />);
    
    // Initially shows first card
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    
    // After interval, should show next card
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Check that rotation occurred (this would need more sophisticated testing in real implementation)
    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
  });

  it('pauses rotation on hover', async () => {
    render(<RotatingCapabilityCards cards={mockCards} rotationInterval={1000} />);
    
    const container = screen.getByRole('region', { name: /rotating capability cards/i });
    
    // Hover over container
    fireEvent.mouseEnter(container);
    
    // Should show pause indicator
    await waitFor(() => {
      expect(screen.getByText('Rotation Paused')).toBeInTheDocument();
    });
    
    // Advance time - rotation should be paused
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Should still show first card (rotation paused)
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    
    // Mouse leave should resume rotation
    fireEvent.mouseLeave(container);
    
    await waitFor(() => {
      expect(screen.queryByText('Rotation Paused')).not.toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', () => {
    render(<RotatingCapabilityCards cards={mockCards} />);
    
    const container = screen.getByRole('region', { name: /rotating capability cards/i });
    
    // Arrow right should advance to next card
    fireEvent.keyDown(container, { key: 'ArrowRight' });
    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
    
    // Arrow left should go back to previous card
    fireEvent.keyDown(container, { key: 'ArrowLeft' });
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
  });

  it('opens modal on card click', () => {
    const mockOnCardClick = jest.fn();
    render(
      <RotatingCapabilityCards 
        cards={mockCards} 
        onCardClick={mockOnCardClick}
      />
    );
    
    const firstCard = screen.getByLabelText('Test Card 1 capability card');
    fireEvent.click(firstCard);
    
    expect(mockOnCardClick).toHaveBeenCalledWith(mockCards[0]);
  });

  it('handles navigation dots correctly', () => {
    render(<RotatingCapabilityCards cards={mockCards} />);
    
    const dots = screen.getAllByLabelText(/go to card/i);
    expect(dots).toHaveLength(2);
    
    // Click second dot
    fireEvent.click(dots[1]);
    
    // Should navigate to second card
    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <RotatingCapabilityCards 
        cards={mockCards} 
        className="custom-class" 
      />
    );
    
    const container = screen.getByRole('region', { name: /rotating capability cards/i });
    expect(container).toHaveClass('custom-class');
  });

  it('handles Enter key to select card', () => {
    const mockOnCardClick = jest.fn();
    render(
      <RotatingCapabilityCards 
        cards={mockCards} 
        onCardClick={mockOnCardClick}
      />
    );
    
    const container = screen.getByRole('region', { name: /rotating capability cards/i });
    
    fireEvent.keyDown(container, { key: 'Enter' });
    expect(mockOnCardClick).toHaveBeenCalledWith(mockCards[0]);
    
    fireEvent.keyDown(container, { key: ' ' });
    expect(mockOnCardClick).toHaveBeenCalledTimes(2);
  });

  it('cleans up intervals on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = render(<RotatingCapabilityCards cards={mockCards} />);
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
  });
});