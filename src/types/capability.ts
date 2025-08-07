/**
 * Capability Card Interface
 * Defines the structure for individual capability cards
 */
export interface CapabilityCard {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name or path
  color: string; // Tailwind color class
  modalContent: {
    title: string;
    description: string;
    features: string[];
    examples?: string[];
    technologies?: string[];
  };
}

/**
 * Rotating Cards Props Interface
 */
export interface RotatingCapabilityCardsProps {
  cards: CapabilityCard[];
  rotationInterval?: number; // milliseconds, default 5000
  className?: string;
  onCardClick?: (card: CapabilityCard) => void;
}

/**
 * Modal Props Interface
 */
export interface CapabilityModalProps {
  card: CapabilityCard | null;
  isOpen: boolean;
  onClose: () => void;
}