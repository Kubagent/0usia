import React, { createContext, useContext, useState, ReactNode } from 'react';

// Possible section names for pinning
type PinSection = 'ventures' | 'projects' | null;

interface PinningContextType {
  pinnedSection: PinSection;
  pin: (section: PinSection) => void;
  unpin: (section: PinSection) => void;
  isPinned: (section: PinSection) => boolean;
}

const PinningContext = createContext<PinningContextType | undefined>(undefined);

export const PinningProvider = ({ children }: { children: ReactNode }) => {
  const [pinnedSection, setPinnedSection] = useState<PinSection>(null);

  const pin = (section: PinSection) => {
    setPinnedSection(section);
  };

  const unpin = (section: PinSection) => {
    if (pinnedSection === section) {
      setPinnedSection(null);
    }
  };

  const isPinned = (section: PinSection) => pinnedSection === section;

  return (
    <PinningContext.Provider value={{ pinnedSection, pin, unpin, isPinned }}>
      {children}
    </PinningContext.Provider>
  );
};

export const usePinning = () => {
  const context = useContext(PinningContext);
  if (!context) {
    throw new Error('usePinning must be used within a PinningProvider');
  }
  return context;
};
