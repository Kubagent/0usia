'use client';

import RotatingCapabilityCards from '@/components/RotatingCapabilityCards';
import { capabilityCards } from '@/data/capabilityData';
import { CapabilityCard } from '@/types/capability';

/**
 * Capability Cards Demo Page
 * 
 * Demonstrates the RotatingCapabilityCards component with:
 * - Auto-rotation every 5 seconds
 * - Hover to pause functionality
 * - Modal system for detailed views
 * - Responsive design
 * - Accessibility features
 */
export default function CapabilityDemoPage() {
  const handleCardClick = (card: CapabilityCard) => {
    // Track card interaction (console.log removed for production)
    // Optional: Analytics tracking, custom actions, etc.
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-space">
            Our Capabilities
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-cormorant">
            Discover our comprehensive range of services through our interactive capability showcase
          </p>
        </div>
      </div>

      {/* Rotating Capability Cards */}
      <RotatingCapabilityCards 
        cards={capabilityCards}
        rotationInterval={5000}
        onCardClick={handleCardClick}
        className="bg-white"
      />

      {/* Instructions */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-space">
            How to Interact
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🖱️</div>
              <h3 className="font-semibold mb-2 font-space">Hover to Pause</h3>
              <p className="text-gray-600 text-sm font-cormorant">
                Hover over the cards to pause auto-rotation and explore at your own pace
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-4">👆</div>
              <h3 className="font-semibold mb-2 font-space">Click for Details</h3>
              <p className="text-gray-600 text-sm font-cormorant">
                Click any card to open a detailed modal with features and examples
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-4">⌨️</div>
              <h3 className="font-semibold mb-2 font-space">Keyboard Navigation</h3>
              <p className="text-gray-600 text-sm font-cormorant">
                Use arrow keys to navigate and Enter to select cards
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}