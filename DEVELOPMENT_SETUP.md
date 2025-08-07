# Ovsia V4 Development Setup

## Project Overview
Modern Next.js 15 application with TypeScript, Tailwind CSS, and Framer Motion for the Ovsia V4 website.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11.11
- **Code Quality**: ESLint, Prettier
- **Development**: VS Code with optimized settings

## Prerequisites
- Node.js 18+ (LRC recommended)
- npm or yarn
- VS Code (recommended)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install recommended VS Code extensions**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Install workspace recommended extensions

3. **Start development server**:
   ```bash
   npm run dev
   # or with Turbo mode (faster)
   npm run dev:turbo
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:turbo` | Start development server with Turbo mode |
| `npm run build` | Build production version |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check if files are properly formatted |
| `npm run type-check` | Run TypeScript type checking |

## Code Quality Configuration

### ESLint Rules
- TypeScript strict rules
- React best practices
- Accessibility (a11y) enforcement
- Next.js optimizations

### Prettier Configuration
- Single quotes for strings
- Semicolons required
- 2-space indentation
- 80 character line width
- Trailing commas (ES5)

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   └── sections/       # Section components
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

## Design System

### Typography
- **Headings**: Cormorant Garamond (serif)
- **Body**: Space Grotesk (sans-serif)
- **Display**: Reckless Neue (serif)

### Colors
- **Primary**: `ovsia-black` (#000000)
- **Secondary**: `ovsia-white` (#FFFFFF)
- **Grays**: `ovsia-gray-{50-900}` scale

### Animations
- Fade transitions: `animate-fade-in`, `animate-fade-in-up`
- Slide transitions: `animate-slide-{up|down|left|right}`
- Special effects: `animate-float`, `animate-pulse-subtle`

## Performance Optimizations

### Next.js Config
- SWC minification enabled
- Image optimization with WebP/AVIF
- CSS optimization
- Package import optimization for Framer Motion

### Image Optimization
- Responsive image sizes
- Modern formats (WebP, AVIF)
- Lazy loading by default

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

## Development Guidelines

### Component Architecture
1. Use functional components with hooks
2. Implement proper TypeScript interfaces
3. Follow composition over inheritance
4. Use memo for performance-critical components

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

### Animation Best Practices
- Use `transform` and `opacity` for smooth animations
- Implement `will-change` for complex animations
- Respect `prefers-reduced-motion`
- Keep animations under 500ms for UI feedback

### Performance Budget
- Target sub-3s load times
- Monitor Core Web Vitals
- Optimize images before deployment
- Use code splitting for large bundles

## VS Code Configuration

The project includes optimized VS Code settings:
- Format on save with Prettier
- Auto-fix ESLint issues
- Tailwind CSS IntelliSense
- TypeScript strict mode
- Path autocomplete

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Run `npm run type-check`
2. **Linting errors**: Run `npm run lint:fix`
3. **Formatting issues**: Run `npm run format`
4. **Build failures**: Check console for specific errors

### Performance Issues
- Use React DevTools Profiler
- Check Network tab for large assets
- Analyze bundle with `ANALYZE=true npm run build`

## Deployment

The project is configured for:
- **Vercel** (recommended)
- **Netlify**
- **Static export** with `npm run build && npm run export`

## Contributing

1. Follow the established code style
2. Write TypeScript interfaces for all props
3. Add ARIA labels for accessibility
4. Test on mobile devices
5. Run linting and formatting before commits