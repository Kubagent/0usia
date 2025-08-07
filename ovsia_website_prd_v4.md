# Project: Ovsia One-Page Animated Website (Full Rebuild v4)

## Internal Context (Not for Display)

- OVSIA = OUSIA (essence, being)
- Venture studio: Vision → Strategy → Intention → Action
- “O”: void, infinity, unity → 0 → 1
- We build, consult, invest
 - This is version number 4 of the platform. We will work with Claude Code for development. We will salvage the files and development of version 3, which can usefully be re-utilised. Especially important is that the home page (tope section/hero banner) and its transition to the tagline section remain as they are because they're perfect.
- Main resources: Talent network, Strategy, AI operations, Brand values & narrative, Inspiration, Capital

---

## Vision

Develop and launch a high-performance, animated one-page website for **Ovsia** that communicates its philosophy and capabilities through six elegant, scroll-triggered sections. The site will feature alternating black/white backgrounds, unique animated transitions, and interactive elements—all deployed live via Cloudflare within two weeks.

---

## Goals

- Build a new website architecture from scratch, using **select salvaged V3 documentation, files and contents**
- Deliver **six distinct full-screen sections** with **smooth, scroll-triggered background transitions**
- Ensure mobile-responsiveness, performance optimization, and fast load times
- Integrate all tools (Mailchimp, Analytics, Cloudflare DNS/Pages)
- Deploy live full SEO, analytics and seamless flow without bugs

---

## Success Criteria

- Website live on Cloudflare
- Six scroll-locked full-screen sections with smooth, performant animations
- Interactive project tiles with hover metadata and external links
- Framer Motion scroll transitions: **white ↔ black**, each with unique animation
- Fully responsive (desktop, tablet, mobile)
- ≤3s load time, ≥60fps scroll performance
- GDPR-compliant Mailchimp integration
- Live analytics integration
- SEO & Meta: Unique page title, meta descriptions, Open Graph tags, sitemap.xml, robots.txt

---

## Scroll & Motion Philosophy

- The website experience is scroll-driven: each **scroll flick** should ideally transition to **one full section**, with **soft scroll snapping** to maintain pacing.
- All six sections are **scroll-locked full-screen blocks**, with **smooth transitions** and **distinct animated styles**.
- Backgrounds **alternate strictly between black and white**, reinforcing visual rhythm.
- Transitions respond fluidly to scroll velocity and direction.
- **Scroll Reversal Behavior**: When scrolling up, all project tiles fly back down and re-animate asynchronously in the original sequence.

---

## Visual Identity

### Design Principles

- Minimalist and essentialist philosophy
- Scroll flow must feel organic and seamless
- Each section is full-viewport and distinct, but transitions must connect them beautifully

### Typography

- **Headlines:** Cormorant Garamond (Medium/Semibold)
- **Body & Navigation:** Space Grotesk (Regular/Medium)

### Color Palette

- Dominant background: white and black, alternating between sections
- No gradients or imagery-heavy backgrounds—clean, high-contrast canvas

---

## UX Architecture: Section-by-Section Breakdown

### Section 1: Hero (White Background) – this is already implemented in accordance with vision. Please adapt exactly as it is from ovsia_v3.

- Displays only the logo (large-scale)
- Scroll-triggered transition: white → black
- Logo smoothly inverts via scroll-linked fade
- No CTAs or text
- Final state: fully black background with inverted logo

### Section 2: Essence Manifesto (Black Background)

- **Single Bold Statement**: Center one line in Cormorant, 56px (“From 0 → 1, We Make Essence Real.”)
- **Scroll‑Linked Word Morph**: Each flick morphs a key word in sequence; underline progresses with scroll.
- **Hover Interaction**: Freeze on hovered word + subtle underline pulse; click jumps to Expertise deep dive.
- **Flash Transition**: Final word triggers white flash and snap into Section 3.

### Section 3: Core Capabilities (White Background)

- **Single Rotating Pillar**: One large card at center rotates through capabilities (Strategy, AI Ops, Capital).
- **Visuals**: Monochrome stroke icon + title + one-line impact text.
- **Hover**: Pause rotation; fade in “Read More” link (8 words max).
- **Click**: Full-screen modal with 2–3 bullet points.
- **Auto‑Rotate Interval**: 5s per card, looped.

### Section 4: Proof of Ousia (Black Background)

- **3‑Item Carousel**: Logo, one vivid stat (e.g. “×5 ROI”), one-sentence outcome per slide.
- **Alternating Contrast**: Slides flip background color; top progress bar animates per scroll.
- **Hover**: Logo glow + outcome text slide-in.
- **Click**: Overlay with metric chart + “Visit Site” CTA.
- **Scroll-Snap**: One flick = next slide.

### Section 5: Choose Your Path (White Background)

- **Split Full-Screen CTA**: Left “Partner with Us”, right stacked “Get Support” & “Seek Investment”.
- **Entry Animation**: Left text types in; right buttons fade up.
- **Hover**: Background shade shift; button outline invert.
- **Click Interactions**:
  - Partner → slide-in modal form (3 fields)
  - Support → mailto link
  - Investment → drag-drop pitch deck + send

### Section 6: Stay in Ousia (Black Background)

- **Single-Line Call**: “Ready to build from 0→1 together?” centered.
- **Micro-Links**: LinkedIn, Email, Privacy icons beneath.
- **Subtle Pulse**: CTA text pulses every 4 s.
- **Legal Bar**: Tiny 10px footer with minimal legal links always visible.

---

## Functional Requirements

- Scroll-locked sections, one flick = one section progression
- Soft scroll snapping between sections
- Hover-reveal animations on all interactive elements
- Interactive venture tiles with metadata overlays and external linking
- Scroll reversal replays project animation
- Modal form logic, file upload handling
- SEO & meta-tagging: titles, descriptions, OG tags, sitemap, robots.txt
- Accessibility: WCAG AA, keyboard nav, semantic HTML, alt text

---

## Non-Functional Requirements

- Tech Stack: React (Next.js), Tailwind CSS, Framer Motion
- Integrations: Mailchimp API, Analytics (Google or Matomo)
- Deployment: Cloudflare Pages + DNS
- Performance: <3s load time, ≥60fps scroll performance
- GDPR compliance (cookie consent)
- SEO: sitemap.xml, robots.txt, unique meta tags
- Content Management: Data fetched from Notion via API (ventures, taglines, logos, metadata)
- JS Fallback: Core content and links visible/functioning if JS disabled
- Fallback handling, lazy loading, server-rendered content

---

## Accessibility Considerations

- WCAG AA compliance for text contrast, focus states, and animations
- Keyboard navigation for all interactive elements (tiles, cards, modals)
- Alt text for all logos and images
- ARIA labels for buttons, forms, and dynamic content

---

## Content Management

- All venture metadata, section copy, and assets managed in Notion
- Data is fetched at build/runtime via Notion API
- Enables non-developer updates to projects, taglines, and visuals

---

## Analytics Events

- Track clicks on Contact CTAs (Partner, Support, Investment)
- Track hover and clicks on each project tile (capture venture name & URL)
- Track modal opens and form submissions
- Track file upload interactions for pitch decks

---

## SEO & Meta Objectives

- Unique page titles and meta descriptions per section anchor
- Open Graph tags for social sharing
- robots.txt and sitemap.xml configuration
- Basic 404/fallback pages

---

## Milestones

### Week 1

- ✅ Codebase audit (Phase 2 reuse)
- ✅ Repo scaffold and layout setup
- ✅ Hero, Tagline, Expertise sections with scroll logic & animations
- ✅ Projects section: tiles animation, hover, click logic

### Week 2

- ✅ Contact and Footer sections build
- ✅ Integrations: Mailchimp, Analytics, GDPR consents
- ✅ Responsive QA and performance tuning
- ✅ Cloudflare DNS/Pages setup and deploy
- ✅ Final QA and go live

