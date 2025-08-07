'use client';

import React, { useState } from 'react';
import ThreeItemCarousel, { CarouselItem } from '@/components/ThreeItemCarousel';
import { carouselData, alternativeCarouselData } from '@/data/carouselData';

/**
 * Carousel Demo Page
 * 
 * Demonstrates the ThreeItemCarousel component with different configurations
 * and data sets to showcase all features and interactions.
 */
export default function CarouselDemoPage() {
  const [currentDataSet, setCurrentDataSet] = useState<'primary' | 'alternative'>('primary');
  const [autoplayInterval, setAutoplayInterval] = useState(4000);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [enableHoverPause, setEnableHoverPause] = useState(true);

  const currentData = currentDataSet === 'primary' ? carouselData : alternativeCarouselData;

  const handleItemClick = (item: CarouselItem) => {
    // Track item interaction (console.log removed for production)
    // Optional: Analytics tracking, navigation, etc.
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Configuration Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="text-lg font-bold mb-4 font-space">Carousel Controls</h3>
        
        {/* Data Set Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Data Set:</label>
          <select
            value={currentDataSet}
            onChange={(e) => setCurrentDataSet(e.target.value as 'primary' | 'alternative')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="primary">Innovation, Excellence, Impact</option>
            <option value="alternative">Design, Technology, Partnership</option>
          </select>
        </div>

        {/* Autoplay Interval */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Autoplay Interval: {autoplayInterval}ms
          </label>
          <input
            type="range"
            min="2000"
            max="8000"
            step="500"
            value={autoplayInterval}
            onChange={(e) => setAutoplayInterval(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Progress Bar Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showProgressBar}
              onChange={(e) => setShowProgressBar(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show Progress Bar</span>
          </label>
        </div>

        {/* Hover Pause Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enableHoverPause}
              onChange={(e) => setEnableHoverPause(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Hover to Pause</span>
          </label>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 border-t pt-4">
          <p className="mb-2"><strong>Keyboard:</strong></p>
          <p>← → Navigate</p>
          <p>Enter/Space: Show overlay</p>
          <p>Escape: Close overlay</p>
          <p className="mt-2"><strong>Mobile:</strong> Swipe to navigate</p>
        </div>
      </div>

      {/* Main Carousel */}
      <ThreeItemCarousel
        items={currentData}
        autoplayInterval={autoplayInterval}
        showProgressBar={showProgressBar}
        enableHoverPause={enableHoverPause}
        onItemClick={handleItemClick}
      />

      {/* Feature Showcase Panel */}
      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white rounded-lg p-4 max-w-sm">
        <h4 className="font-bold mb-2 font-space">Carousel Features</h4>
        <ul className="text-sm space-y-1 font-cormorant">
          <li>✨ Smooth animations with Framer Motion</li>
          <li>📱 Touch/swipe support for mobile</li>
          <li>⌨️ Full keyboard navigation</li>
          <li>🎯 Progress bar with pause functionality</li>
          <li>🎨 Alternating contrast backgrounds</li>
          <li>📄 Rich overlay system</li>
          <li>♿ Accessibility compliant</li>
          <li>🚀 Performance optimized</li>
        </ul>
      </div>
    </div>
  );
}