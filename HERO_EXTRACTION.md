# Hero Section Component - V3 to V4 Extraction

## Overview
This document details the extraction and adaptation of the hero section component from the Ovsia V3 codebase to the new V4 Next.js structure, as specified in the PRD requirement that the hero section must be preserved exactly as it is.

## V3 Hero Section Analysis

### Original Location
- **File**: `/v3 duplicate/src/sections/Hero.tsx`
- **Dependencies**: `framer-motion`, `next/image`
- **Assets**: `/public/ousia_logo.png`

### Key Features Identified
1. **Large-scale logo display** - 600x600px Ovsia logo
2. **Scroll-triggered background transition** - White (#ffffff) to black (#000000)
3. **Logo color inversion** - CSS `filter: invert()` from 0 to 1
4. **Precise animation timing** - Transitions complete in first 40% of scroll progress
5. **Smooth scroll tracking** - Uses `framer-motion`'s `useScroll` and `useTransform`
6. **Debug logging** - Console logs for scroll progress tracking
7. **No CTAs or text** - Pure visual logo presentation
8. **Performance optimized** - `priority` loading, `layoutEffect: false`

### Technical Implementation Details
```typescript
// Scroll progress tracking
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start start", "end start"],
  layoutEffect: false
});

// Background color transformation
const bgColor = useTransform(
  scrollYProgress,
  [0, 0.4], // Critical 40% timing
  ["#ffffff", "#000000"]
);

// Logo inversion transformation
const logoFilter = useTransform(
  scrollYProgress, 
  [0, 0.4], // Synchronized timing
  ['invert(0)', 'invert(1)']
);
```

## V4 Adaptation

### New Location
- **File**: `/src/components/sections/Hero.tsx`
- **Structure**: Enhanced with comprehensive documentation
- **Dependencies**: Same as V3 (framer-motion, next/image)

### Preservation Strategy
1. **Exact timing preservation** - Maintained 40% scroll progress timing
2. **Animation curves** - Identical `useTransform` configurations
3. **CSS classes** - Preserved `select-none drop-shadow-xl` styling
4. **Debug functionality** - Kept console logging for development
5. **Image optimization** - Enhanced with quality and blur placeholder
6. **Component structure** - Maintained same JSX hierarchy

### Enhancements for V4
- **Improved documentation** - Comprehensive inline comments
- **Better image optimization** - Added `quality={100}` and blur placeholder
- **Type safety** - Better TypeScript integration
- **Export structure** - Clean module exports

## Usage in V4

```typescript
import { Hero } from '@/components/sections';

export default function HomePage() {
  return (
    <main>
      <Hero />
      {/* Additional sections */}
    </main>
  );
}
```

## Critical Requirements Met
✅ **Logo display** - Large-scale logo preserved  
✅ **Background transition** - White→black scroll trigger  
✅ **Logo inversion** - Black→white color inversion  
✅ **Animation timing** - Exact 40% scroll progress timing  
✅ **No CTAs/text** - Pure visual presentation  
✅ **Functionality preservation** - All V3 features intact  

## Assets Required
- `ousia_logo.png` - Main logo file (copied from V3 public folder)

## Dependencies
```json
{
  "framer-motion": "^11.11.17",
  "next": "^15.4.5"
}
```

## Testing
The component can be tested by:
1. Running `npm run dev`
2. Opening `http://localhost:3000`
3. Scrolling to observe the background and logo transitions
4. Checking console for scroll progress debug logs

The hero section now maintains all V3 functionality while being properly integrated into the V4 Next.js architecture.