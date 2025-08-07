# Claude Development Reference - Ovsia V4

## Project Context
This is version 4 of the Ovsia website. You are working with:
- **PRD**: `ovsia_website_prd_v4.md` (complete requirements)
- **V3 Codebase**: `v3 duplicate/` (salvage hero section and assets)
- **Specialized Agents**: `agents/` directory (46 specialized AI agents)

## Critical Requirements

### Must Preserve from V3
- **Hero section (Section 1)** - Already perfect, adapt exactly as-is
- **Hero-to-tagline transition** - Smooth white→black with logo inversion
- **Core animations** that work well

### Technical Stack
```
Framework: Next.js (React + TypeScript)
Styling: Tailwind CSS
Animations: Framer Motion
Fonts: Cormorant Garamond (headlines), Space Grotesk (body)
Deployment: Cloudflare Pages
CMS: Notion API
```

## Section-by-Section Implementation Guide

### Section 1: Hero (White Background)
```
Status: SALVAGE FROM V3 - DO NOT REBUILD
Location: v3 duplicate/src/components/
Requirements:
- Large-scale logo display
- Scroll-triggered white→black transition
- Logo color inversion on scroll
- No CTAs or text
- Preserve existing animation timing
```

### Section 2: Essence Manifesto (Black Background)
```
Content: "From 0 → 1, We Make Essence Real."
Features:
- Center text, Cormorant Garamond 56px
- Scroll-linked word morphing animation
- Hover: freeze word + underline pulse
- Click: jump to expertise section
- Exit: white flash transition
```

### Section 3: Core Capabilities (White Background)
```
Component: Single rotating pillar
Content: Strategy, AI Ops, Capital
Features:
- Monochrome stroke icons
- Auto-rotate every 5 seconds
- Hover: pause + "Read More" link
- Click: full-screen modal (2-3 bullets)
- Loop continuously
```

### Section 4: Proof of Ousia (Black Background)
```
Component: 3-item carousel
Content: Logo + stat + outcome per slide
Features:
- Alternating contrast per slide
- Progress bar animation
- Hover: logo glow + text slide-in
- Click: metric overlay + "Visit Site" CTA
- Scroll-snap navigation
```

### Section 5: Choose Your Path (White Background)
```
Layout: Split-screen CTAs
Left: "Partner with Us" → modal form (3 fields)
Right: "Get Support" → mailto link
Right: "Seek Investment" → file upload + send
Features:
- Entry: left types in, right fades up
- Hover: background shade shift
- Interactive forms and file handling
```

### Section 6: Stay in Ousia (Black Background)
```
Content: "Ready to build from 0→1 together?"
Features:
- Centered text with subtle pulse (4s interval)
- Social links: LinkedIn, Email, Privacy
- 10px legal footer bar
- Minimal design
```

## Animation Requirements

### Scroll Behavior
- **Scroll-locked sections**: One flick = one section
- **Soft scroll snapping** between sections
- **Background alternation**: White → Black → White → Black → White → Black
- **Scroll reversal**: Animations replay in reverse

### Performance Targets
- **Load time**: <3 seconds
- **Scroll performance**: ≥60fps
- **Mobile responsive**: All breakpoints
- **Accessibility**: WCAG AA compliance

## Integration Requirements

### Notion CMS
```javascript
// Fetch content at build time
- Venture metadata
- Section copy
- Asset URLs
- Project information
```

### Mailchimp API
```javascript
// Contact form integration
- Partner form submissions
- Newsletter signups
- GDPR compliance
```

### Analytics Events
```javascript
// Track these interactions:
- Contact CTA clicks (Partner, Support, Investment)
- Project tile hovers and clicks
- Modal opens and form submissions
- File upload interactions
```

## File Structure (Recommended)
```
src/
├── components/
│   ├── sections/
│   │   ├── Hero.tsx (SALVAGE FROM V3)
│   │   ├── EssenceManifesto.tsx
│   │   ├── CoreCapabilities.tsx
│   │   ├── ProofOfOusia.tsx
│   │   ├── ChooseYourPath.tsx
│   │   └── StayInOusia.tsx
│   ├── ui/
│   │   ├── Modal.tsx
│   │   ├── ContactForm.tsx
│   │   └── FileUpload.tsx
│   └── animations/
│       ├── ScrollManager.tsx
│       └── TransitionEffects.tsx
├── lib/
│   ├── notion.ts
│   ├── mailchimp.ts
│   └── analytics.ts
├── styles/
│   └── globals.css
└── pages/
    └── index.tsx
```

## Agent Utilization Strategy

### Phase-Based Agent Assignment
```
Phase 1 (Setup): architect-review.md + frontend-developer.md
Phase 2 (Sections): frontend-developer.md + javascript-pro.md
Phase 3 (Animations): performance-engineer.md + frontend-developer.md
Phase 4 (Integrations): api-documenter.md + backend-architect.md
Phase 5 (Performance): performance-engineer.md + search-specialist.md
Phase 6 (Deployment): deployment-engineer.md + test-automator.md
```

### Continuous Support Agents
- `code-reviewer.md` - All code reviews
- `error-detective.md` - Debugging issues
- `security-auditor.md` - Security validation

## Development Workflow

### 1. Start with V3 Analysis
```bash
# First, analyze v3 duplicate structure
# Identify hero section components
# Extract working animations
# Document asset locations
```

### 2. Project Initialization
```bash
npx create-next-app@latest ovsia-v4 --typescript --tailwind --eslint
cd ovsia-v4
npm install framer-motion
# Configure Tailwind with custom theme
```

### 3. Component Development Order
1. Salvage and adapt Hero section
2. Build EssenceManifesto with word morphing
3. Create CoreCapabilities rotating pillar
4. Implement ProofOfOusia carousel
5. Build ChooseYourPath split CTAs
6. Complete StayInOusia footer

### 4. Integration Phase
1. Set up Notion API connection
2. Implement Mailchimp forms
3. Add analytics tracking
4. Configure SEO meta tags

### 5. Performance Optimization
1. Bundle analysis and optimization
2. Animation performance tuning
3. Mobile responsiveness testing
4. Accessibility audit

### 6. Deployment
1. Cloudflare Pages setup
2. DNS configuration
3. SSL and CDN optimization
4. Final QA and go-live

## Key Success Factors

1. **Preserve V3 Hero**: Don't rebuild what's already perfect
2. **Smooth Transitions**: Focus on scroll-triggered animations
3. **Performance First**: Monitor metrics throughout development
4. **Mobile Experience**: Test on devices regularly
5. **Agent Specialization**: Use specific agents for their expertise

## Emergency Protocols

### If Hero Section Breaks
- Immediately revert to V3 version
- Isolate the issue in a separate branch
- Use `error-detective.md` agent for debugging

### If Performance Degrades
- Use `performance-engineer.md` for analysis
- Implement lazy loading
- Optimize animation complexity
- Consider reducing animation scope

### If Deployment Issues
- Use `deployment-engineer.md` for troubleshooting
- Have Cloudflare fallback plan ready
- Maintain staging environment for testing
