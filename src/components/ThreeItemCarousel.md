# ThreeItemCarousel Component

A modern, performant 3-item carousel component built with React, TypeScript, and Framer Motion. Features smooth animations, progress bar, hover effects, overlay system, and mobile-friendly touch navigation.

## Features

- ✨ **Smooth Animations**: Powered by Framer Motion with spring physics
- 📊 **Progress Bar**: Animated progress indicator with pause functionality
- 🎯 **Hover Effects**: Pause on hover with visual feedback
- 📱 **Touch Support**: Full swipe gesture support for mobile devices
- ⌨️ **Keyboard Navigation**: Complete keyboard accessibility
- 🎨 **Alternating Contrast**: Black backgrounds with high-contrast content
- 📄 **Overlay System**: Rich modal overlays with detailed content
- ♿ **Accessibility**: WCAG compliant with ARIA labels
- 🚀 **Performance**: Optimized with React.memo and RAF scheduling
- 📐 **Responsive**: Adapts to all screen sizes

## Installation

The component is already included in the project. Import it from the components index:

```tsx
import { ThreeItemCarousel } from '@/components';
// or
import ThreeItemCarousel from '@/components/ThreeItemCarousel';
```

## Basic Usage

```tsx
import React from 'react';
import ThreeItemCarousel, { CarouselItem } from '@/components/ThreeItemCarousel';

const items: CarouselItem[] = [
  {
    id: 'slide-1',
    title: 'Innovation',
    subtitle: 'Pushing Boundaries',
    description: 'We create cutting-edge solutions...',
    backgroundColor: '#000000',
    textColor: 'text-white',
    overlayContent: {
      title: 'Innovation Details',
      details: ['Detail 1', 'Detail 2'],
      callToAction: 'Learn More'
    }
  },
  // ... more items
];

function MyCarousel() {
  return (
    <ThreeItemCarousel
      items={items}
      autoplayInterval={4000}
      showProgressBar={true}
      enableHoverPause={true}
    />
  );
}
```

## Props

### ThreeItemCarouselProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CarouselItem[]` | required | Array of carousel items to display |
| `autoplayInterval` | `number` | `4000` | Auto-advance interval in milliseconds |
| `className` | `string` | `''` | Additional CSS classes |
| `onItemClick` | `(item: CarouselItem) => void` | optional | Callback when item is clicked |
| `showProgressBar` | `boolean` | `true` | Whether to show progress bar |
| `enableHoverPause` | `boolean` | `true` | Whether to pause on hover |

### CarouselItem Interface

```tsx
interface CarouselItem {
  id: string;                    // Unique identifier
  title: string;                 // Main title
  subtitle: string;              // Subtitle text
  description: string;           // Description text
  image?: string;                // Optional image URL
  backgroundColor: string;       // Background color
  textColor: string;             // Text color class
  overlayContent?: {             // Optional overlay content
    title: string;
    details: string[];
    callToAction?: string;
  };
}
```

## Advanced Usage

### With Custom Hooks

```tsx
import { useCarousel, useCarouselKeyboard, useCarouselTouch } from '@/hooks/useCarousel';

function CustomCarousel() {
  const carousel = useCarousel({
    itemCount: 3,
    autoplayInterval: 5000,
    pauseOnHover: true
  });

  const handleKeyDown = useCarouselKeyboard(carousel);
  const touchHandlers = useCarouselTouch(carousel);

  return (
    <div
      onMouseEnter={carousel.handleMouseEnter}
      onMouseLeave={carousel.handleMouseLeave}
      onKeyDown={handleKeyDown}
      {...touchHandlers}
    >
      {/* Custom carousel UI */}
    </div>
  );
}
```

### With Performance Monitoring

```tsx
import { useCarouselPerformance } from '@/utils/carouselPerformance';

function OptimizedCarousel() {
  const { monitor, optimizationSettings } = useCarouselPerformance(true);

  return (
    <ThreeItemCarousel
      items={items}
      autoplayInterval={optimizationSettings.autoplayInterval}
      showProgressBar={optimizationSettings.enableProgressBar}
    />
  );
}
```

## Customization

### Styling

The component uses Tailwind CSS classes and can be customized via:

1. **Background Colors**: Set via `backgroundColor` prop on each item
2. **Text Colors**: Set via `textColor` prop on each item
3. **Custom Classes**: Use the `className` prop for additional styling
4. **CSS Variables**: Override component-specific variables

```css
/* Custom styling example */
.carousel-custom {
  --carousel-progress-color: #ff6b6b;
  --carousel-arrow-bg: rgba(255, 255, 255, 0.1);
}
```

### Animation Variants

Customize animations by modifying the motion variants:

```tsx
const customSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    rotateY: direction > 0 ? 45 : -45, // Custom rotation
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    rotateY: direction < 0 ? 45 : -45,
  }),
};
```

## Accessibility

The component is fully accessible and includes:

- **ARIA Labels**: Descriptive labels for all interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper semantic markup
- **Focus Management**: Logical focus order
- **Reduced Motion**: Respects `prefers-reduced-motion`

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous slide |
| `→` | Next slide |
| `Enter` / `Space` | Open overlay or trigger action |
| `Escape` | Close overlay |

## Performance

### Optimization Features

- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Memoizes event handlers
- **requestAnimationFrame**: Smooth animation scheduling
- **Hardware Acceleration**: Uses CSS `transform3d` when available
- **Lazy Loading**: Images can be lazy loaded
- **Performance Monitoring**: Built-in performance tracking

### Best Practices

1. **Preload Images**: Use the performance utility to preload images
2. **Optimize Content**: Keep descriptions concise for better performance
3. **Batch Updates**: Use the performance utilities for DOM updates
4. **Monitor Metrics**: Enable performance logging in development

```tsx
// Preload images for better performance
import { CarouselPerformanceMonitor } from '@/utils/carouselPerformance';

const imageSources = items.map(item => item.image).filter(Boolean);
CarouselPerformanceMonitor.preloadImages(imageSources);
```

## Mobile Considerations

The component is fully responsive and includes:

- **Touch Gestures**: Swipe left/right to navigate
- **Responsive Text**: Scales text appropriately
- **Touch Targets**: Ensures minimum 44px touch targets
- **Viewport Adaptation**: Adjusts layout for mobile screens

### Mobile-Specific Props

```tsx
<ThreeItemCarousel
  items={items}
  // Longer intervals on mobile for better UX
  autoplayInterval={window.innerWidth < 768 ? 6000 : 4000}
  // Disable hover pause on touch devices
  enableHoverPause={!('ontouchstart' in window)}
/>
```

## Testing

The component includes comprehensive tests covering:

- **Rendering**: Basic component rendering
- **Navigation**: Arrow clicks, keyboard, touch gestures
- **Autoplay**: Auto-advancement and pause functionality
- **Overlay**: Modal open/close behavior
- **Accessibility**: ARIA labels and keyboard navigation

Run tests with:

```bash
npm test -- ThreeItemCarousel.test.tsx
```

## Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Ensure image URLs are accessible
   - Check CORS headers for external images
   - Use absolute URLs for images

2. **Animations Stuttering**
   - Enable hardware acceleration in CSS
   - Reduce animation complexity
   - Check for performance bottlenecks

3. **Touch Gestures Not Working**
   - Ensure touch events aren't being prevented
   - Check for conflicting touch handlers
   - Test on actual mobile devices

### Debug Mode

Enable debug logging:

```tsx
import { useCarouselPerformance } from '@/utils/carouselPerformance';

function DebugCarousel() {
  const { monitor } = useCarouselPerformance(true); // Enable logging
  
  return <ThreeItemCarousel items={items} />;
}
```

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Fallbacks**: Graceful degradation for older browsers

## Examples

See the demo page at `/carousel-demo` for interactive examples and configuration options.

## API Reference

For detailed API documentation, see the TypeScript interfaces in the component file. The component is fully typed and provides excellent IntelliSense support.

## Contributing

When contributing to this component:

1. Maintain TypeScript type safety
2. Add tests for new features
3. Update documentation
4. Follow existing code style
5. Consider performance impact
6. Test accessibility compliance

## License

This component is part of the Ovsia V4 project and follows the project's licensing terms.