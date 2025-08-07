# Ovsia V4 Development Guide

## Project Overview
Full rebuild of Ovsia one-page animated website with 6 scroll-locked sections, alternating black/white backgrounds, and smooth Framer Motion transitions.

## Tech Stack
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: Cloudflare Pages
- **CMS**: Notion API
- **Analytics**: Google Analytics / Matomo
- **Email**: Mailchimp API

## Development Phases

### Phase 1: Foundation & Architecture (Days 1-3)
**Lead Agent**: `architect-review.md` + `frontend-developer.md`

#### Tasks:
1. **Project Setup**
   - Initialize Next.js project with TypeScript
   - Configure Tailwind CSS with custom theme
   - Set up Framer Motion
   - Configure ESLint, Prettier
   - Set up Git repository

2. **Architecture Planning**
   - Design component structure
   - Plan state management approach
   - Define scroll behavior system
   - Create animation system architecture

3. **V3 Asset Salvage**
   - Extract hero section components from v3
   - Identify reusable animations
   - Migrate fonts and basic styling
   - Preserve hero-to-tagline transition logic

### Phase 2: Core Sections Development (Days 4-8)
**Lead Agents**: `frontend-developer.md` + `javascript-pro.md`

#### Section 1: Hero (White → Black)
- **Status**: Salvage from V3 (already perfect)
- **Tasks**: 
  - Extract hero component
  - Ensure scroll-triggered logo inversion works
  - Test transition to Section 2

#### Section 2: Essence Manifesto (Black)
- **Animation**: Scroll-linked word morphing
- **Interaction**: Hover freeze + underline pulse
- **Transition**: White flash to Section 3

#### Section 3: Core Capabilities (White)
- **Component**: Rotating capability cards
- **Features**: Auto-rotate (5s), hover pause, modal system
- **Content**: Strategy, AI Ops, Capital

#### Section 4: Proof of Ousia (Black)
- **Component**: 3-item carousel
- **Features**: Scroll-snap navigation, hover effects
- **Content**: Logo + stats + outcomes

#### Section 5: Choose Your Path (White)
- **Layout**: Split-screen CTAs
- **Features**: Modal forms, file upload, mailto links
- **CTAs**: Partner, Support, Investment

#### Section 6: Stay in Ousia (Black)
- **Content**: Final CTA + social links
- **Animation**: Subtle text pulse
- **Footer**: Legal links bar

### Phase 3: Scroll System & Animations (Days 9-10)
**Lead Agent**: `performance-engineer.md` + `frontend-developer.md`

#### Tasks:
1. **Scroll Lock System**
   - Implement section-by-section scroll snapping
   - Ensure one flick = one section
   - Handle scroll velocity detection

2. **Background Transitions**
   - Smooth white ↔ black transitions
   - Scroll-triggered color changes
   - Performance optimization

3. **Animation Polish**
   - Scroll reversal behavior
   - Entrance/exit animations
   - Hover state refinements

### Phase 4: Integrations & Content (Days 11-12)
**Lead Agents**: `api-documenter.md` + `backend-architect.md`

#### Tasks:
1. **Notion CMS Integration**
   - Set up Notion API connection
   - Create content fetching system
   - Implement build-time data fetching

2. **Mailchimp Integration**
   - Contact form submissions
   - Newsletter signup
   - GDPR compliance

3. **Analytics Setup**
   - Event tracking implementation
   - Performance monitoring
   - User interaction analytics

### Phase 5: Performance & SEO (Days 13-14)
**Lead Agents**: `performance-engineer.md` + `search-specialist.md`

#### Tasks:
1. **Performance Optimization**
   - Achieve <3s load time
   - Maintain ≥60fps scroll performance
   - Implement lazy loading
   - Optimize animations

2. **SEO Implementation**
   - Meta tags and Open Graph
   - Sitemap.xml and robots.txt
   - Structured data
   - Accessibility compliance (WCAG AA)

3. **Mobile Responsiveness**
   - Responsive design testing
   - Touch interaction optimization
   - Mobile performance tuning

### Phase 6: Deployment & QA (Days 15-16)
**Lead Agents**: `deployment-engineer.md` + `test-automator.md`

#### Tasks:
1. **Cloudflare Setup**
   - Configure Cloudflare Pages
   - Set up DNS
   - SSL configuration
   - CDN optimization

2. **Final QA**
   - Cross-browser testing
   - Performance validation
   - Accessibility audit
   - User acceptance testing

## Agent Assignments

### Primary Development Team
- **Project Lead**: `architect-review.md`
- **Frontend Lead**: `frontend-developer.md`
- **JavaScript Specialist**: `javascript-pro.md`
- **Performance Expert**: `performance-engineer.md`

### Supporting Specialists
- **API Integration**: `api-documenter.md`
- **Backend Logic**: `backend-architect.md`
- **SEO & Content**: `search-specialist.md`
- **Deployment**: `deployment-engineer.md`
- **Testing**: `test-automator.md`
- **Security**: `security-auditor.md`

### Quality Assurance
- **Code Review**: `code-reviewer.md`
- **Error Handling**: `error-detective.md`
- **Performance**: `performance-engineer.md`

## Success Metrics
- [ ] All 6 sections implemented with smooth transitions
- [ ] <3s load time achieved
- [ ] ≥60fps scroll performance maintained
- [ ] Mobile responsive across all devices
- [ ] WCAG AA accessibility compliance
- [ ] SEO optimization complete
- [ ] Analytics and integrations working
- [ ] Deployed live on Cloudflare

## Risk Mitigation
- **V3 Hero Preservation**: Priority task to ensure no regression
- **Performance Budget**: Monitor bundle size and animation performance
- **Browser Compatibility**: Test across major browsers early
- **Mobile Experience**: Regular mobile testing throughout development

## Communication Protocol
- Daily progress updates in project channel
- Code reviews for all major components
- Performance testing at each phase completion
- Stakeholder demos at end of each phase
