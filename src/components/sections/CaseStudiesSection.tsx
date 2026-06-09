'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { caseStudiesData, type CaseStudy } from '@/data/case-studies';

// ─── Physics ───────────────────────────────────────────────────────────────────

interface Bubble {
  id: string;
  x: number; // centre
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const DAMPING = 0.9982;
const RESTITUTION = 0.72;
const MAX_SPEED = 2.64;
const MIN_SPEED = 0.26;
const WALL_PAD = 8;

function clampSpeed(vx: number, vy: number): [number, number] {
  const s = Math.hypot(vx, vy);
  if (s === 0) return [MIN_SPEED, 0];
  if (s > MAX_SPEED) return [(vx / s) * MAX_SPEED, (vy / s) * MAX_SPEED];
  if (s < MIN_SPEED) return [(vx / s) * MIN_SPEED, (vy / s) * MIN_SPEED];
  return [vx, vy];
}

function stepPhysics(bubbles: Bubble[], W: number, H: number) {
  for (const b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= DAMPING;
    b.vy *= DAMPING;
  }

  // Wall bounce
  for (const b of bubbles) {
    const lo = b.r + WALL_PAD;
    if (b.x < lo)      { b.x = lo;      b.vx =  Math.abs(b.vx) * RESTITUTION; }
    if (b.x > W - lo)  { b.x = W - lo;  b.vx = -Math.abs(b.vx) * RESTITUTION; }
    if (b.y < lo)      { b.y = lo;      b.vy =  Math.abs(b.vy) * RESTITUTION; }
    if (b.y > H - lo)  { b.y = H - lo;  b.vy = -Math.abs(b.vy) * RESTITUTION; }
    [b.vx, b.vy] = clampSpeed(b.vx, b.vy);
  }

  // Circle–circle collision
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i], b = bubbles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minD = a.r + b.r + 6;
      if (dist < minD && dist > 0) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = (minD - dist) / 2;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;

        const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot < 0) {
          const imp = dot * RESTITUTION;
          a.vx += imp * nx; a.vy += imp * ny;
          b.vx -= imp * nx; b.vy -= imp * ny;
        }
        [a.vx, a.vy] = clampSpeed(a.vx, a.vy);
        [b.vx, b.vy] = clampSpeed(b.vx, b.vy);
      }
    }
  }
}

function initBubbles(W: number, H: number, r: number): Bubble[] {
  const out: Bubble[] = [];
  for (const study of caseStudiesData) {
    let x = 0, y = 0, tries = 0;
    do {
      x = r + WALL_PAD + Math.random() * (W - 2 * r - 2 * WALL_PAD);
      y = r + WALL_PAD + Math.random() * (H - 2 * r - 2 * WALL_PAD);
      tries++;
    } while (tries < 300 && out.some(b => Math.hypot(b.x - x, b.y - y) < 2 * r + 10));

    const spd = 0.72 + Math.random() * 1.2;
    const ang = Math.random() * Math.PI * 2;
    out.push({ id: study.id, x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r });
  }
  return out;
}

// ─── Search scoring ────────────────────────────────────────────────────────────

function scoreStudy(study: CaseStudy, query: string): number {
  if (!query.trim()) return 1;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let s = 0;
  for (const t of terms) {
    if (study.name.toLowerCase().includes(t)) s += 4;
    if (study.domain.toLowerCase().includes(t)) s += 3;
    if (study.tags.some(tag => tag.includes(t))) s += 2;
    if (study.summary.toLowerCase().includes(t)) s += 1;
  }
  return s;
}

// ─── Filter domains ────────────────────────────────────────────────────────────

const DOMAINS = ['All', 'Strategy', 'Communication', 'Function', 'Operations', 'Arts'] as const;
type Domain = (typeof DOMAINS)[number];

// ─── Modal ─────────────────────────────────────────────────────────────────────

function ExpandedBubble({ study, dark, diameter, onClose }: {
  study: CaseStudy;
  dark: boolean;
  diameter: number;
  onClose: () => void;
}) {
  const half = diameter / 2;
  return (
    <motion.div
      className={`absolute z-20 rounded-full border flex items-center justify-center
        ${dark ? 'border-white/25 bg-black' : 'border-black/15 bg-white'}`}
      style={{ width: diameter, height: diameter, left: `calc(50% - ${half}px)`, top: `calc(50% - ${half}px)` }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.85 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col items-center text-center space-y-3 select-none" style={{ maxWidth: diameter * 0.62 }}>
        <p className={`text-[9px] tracking-[0.25em] uppercase font-light ${dark ? 'text-white/35' : 'text-black/35'}`}>
          {study.domain}&nbsp;·&nbsp;{study.year}
        </p>
        <h3 className={`font-cormorant leading-tight ${dark ? 'text-white' : 'text-black'}`} style={{ fontSize: Math.max(22, diameter * 0.075) }}>
          {study.name}
        </h3>
        <p className={`text-[10px] italic font-light leading-relaxed line-clamp-3 ${dark ? 'text-white/55' : 'text-black/55'}`}>
          {study.summary}
        </p>
        <div className={`w-8 h-px ${dark ? 'bg-white/15' : 'bg-black/15'}`} />
        <ul className="space-y-1.5 w-full text-left">
          {study.outcomes.slice(0, 3).map((o, i) => (
            <li key={i} className={`text-[9px] font-light leading-snug line-clamp-1 ${dark ? 'text-white/40' : 'text-black/40'}`}>
              — {o}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className={`pt-1 text-[11px] leading-none transition-colors ${dark ? 'text-white/20 hover:text-white/60' : 'text-black/20 hover:text-black/60'}`}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// ─── Mobile list ──────────────────────────────────────────────────────────────

function MobileStudyList({
  activeIds,
  dark,
  c,
}: {
  activeIds: Set<string>;
  dark: boolean;
  c: Record<string, string>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const visible = caseStudiesData.filter(s => activeIds.has(s.id));

  return (
    <div className={`flex flex-col divide-y ${dark ? 'divide-white/8' : 'divide-black/8'}`}>
      {visible.map(study => (
        <div key={study.id}>
          <button
            className="w-full text-left py-4 flex items-start justify-between gap-4"
            onClick={() => setExpandedId(expandedId === study.id ? null : study.id)}
          >
            <div>
              <p className={`text-[9px] tracking-[0.2em] uppercase font-light ${c.bTextDomain}`}>
                {study.domain}&nbsp;·&nbsp;{study.year}
              </p>
              <p className={`font-cormorant text-xl mt-0.5 leading-snug ${c.bTextName}`}>{study.name}</p>
            </div>
            <span className={`text-base leading-none mt-1 flex-shrink-0 ${c.clearBtn}`}>
              {expandedId === study.id ? '−' : '+'}
            </span>
          </button>
          <AnimatePresence>
            {expandedId === study.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="pb-5 space-y-3">
                  <p className={`text-sm font-light italic leading-relaxed ${dark ? 'text-white/55' : 'text-black/55'}`}>
                    {study.summary}
                  </p>
                  <div className="space-y-1.5">
                    {study.outcomes.slice(0, 3).map((o, i) => (
                      <p key={i} className={`text-xs font-light ${dark ? 'text-white/35' : 'text-black/35'}`}>— {o}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {visible.length === 0 && (
        <p className={`text-sm font-light py-8 text-center ${dark ? 'text-white/25' : 'text-black/25'}`}>
          No results
        </p>
      )}
    </div>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────

export default function CaseStudiesSection({ dark = false }: { dark?: boolean }) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const bubblesRef     = useRef<Bubble[]>([]);
  const domRefs        = useRef<Map<string, HTMLDivElement>>(new Map());
  const rafRef         = useRef<number>(0);
  const perturbRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const expandedIdRef  = useRef<string | null>(null);

  const c = dark ? {
    title:         'text-white',
    subtitle:      'text-white',
    toggleOn:      'text-white/75 border-b border-white/40',
    toggleOff:     'text-white/30 border-b border-transparent hover:text-white/55',
    searchInput:   'border-white/15 text-white/55 placeholder-white/25 focus:border-white/35',
    clearBtn:      'text-white/25 hover:text-white/55',
    bBorderHover:  'rgba(255,255,255,0.40)',
    bBorderOn:     'rgba(255,255,255,0.15)',
    bBorderOff:    'rgba(255,255,255,0.05)',
    bBgHover:      'rgba(255,255,255,0.03)',
    bTextDomain:   'text-white/30',
    bTextName:     'text-white/80',
    bTextYear:     'text-white/35',
  } : {
    title:         'text-black',
    subtitle:      'text-black',
    toggleOn:      'text-black/75 border-b border-black/40',
    toggleOff:     'text-black/30 border-b border-transparent hover:text-black/55',
    searchInput:   'border-black/15 text-black/55 placeholder-black/25 focus:border-black/35',
    clearBtn:      'text-black/25 hover:text-black/55',
    bBorderHover:  'rgba(0,0,0,0.40)',
    bBorderOn:     'rgba(0,0,0,0.15)',
    bBorderOff:    'rgba(0,0,0,0.05)',
    bBgHover:      'rgba(0,0,0,0.03)',
    bTextDomain:   'text-black/30',
    bTextName:     'text-black/80',
    bTextYear:     'text-black/35',
  };

  const [ready, setReady]           = useState(false);
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<Domain>('All');
  const [query, setQuery]           = useState('');
  const [bubbleR, setBubbleR]       = useState(80);

  // Keep ref in sync for RAF access without closure staleness
  useEffect(() => { expandedIdRef.current = expandedId; }, [expandedId]);

  // IDs that match current filter/search
  const activeIds = useMemo(() => new Set(
    caseStudiesData
      .filter(s => {
        const domMatch = activeDomain === 'All' || s.domain === activeDomain;
        return domMatch && (query ? scoreStudy(s, query) > 0 : true);
      })
      .map(s => s.id)
  ), [activeDomain, query]);

  // Init + animation loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let W = 0, H = 0;

    const start = (width: number, height: number) => {
      W = width; H = height;
      const r = Math.min(66, Math.max(42, width / 10.6));
      setBubbleR(r);
      bubblesRef.current = initBubbles(W, H, r);
      setReady(true);
    };

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) start(width, height);
    });
    observer.observe(container);

    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) start(width, height);

    // RAF loop — direct DOM writes, no React state; pauses when a bubble is expanded
    const loop = () => {
      if (!expandedIdRef.current) {
        stepPhysics(bubblesRef.current, W, H);
        for (const b of bubblesRef.current) {
          const el = domRefs.current.get(b.id);
          if (el) el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // Gentle random nudges — keeps the field alive; skipped when expanded
    perturbRef.current = setInterval(() => {
      const bs = bubblesRef.current;
      if (!bs.length || expandedIdRef.current) return;
      // Nudge two random bubbles each tick for livelier field
      for (let k = 0; k < 2; k++) {
        const b = bs[Math.floor(Math.random() * bs.length)];
        const ang = Math.random() * Math.PI * 2;
        b.vx += Math.cos(ang) * 0.66;
        b.vy += Math.sin(ang) * 0.66;
      }
    }, 1600);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      if (perturbRef.current) clearInterval(perturbRef.current);
    };
  }, []);

  const size = bubbleR * 2;

  return (
    <section className="relative min-h-screen flex flex-col py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-20 flex flex-col flex-1 w-full">

        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className={`text-ovsia-header-lg-plus sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-4xl font-cormorant tracking-tight mb-4 ${c.title}`}>
            Praxis
          </h2>
          <p className={`text-ovsia-body-xl font-light max-w-2xl mx-auto mt-4 ${c.subtitle}`}>
            Selected engagements
          </p>
        </motion.div>

        {/* Domain filter — centred, minimal underline style */}
        <motion.div
          className="flex flex-col items-center gap-6 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {DOMAINS.map(domain => (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={`text-[10px] tracking-[0.22em] font-light uppercase pb-px transition-all duration-200 ${
                  activeDomain === domain ? c.toggleOn : c.toggleOff
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="search"
              className={`bg-transparent border-b text-[10px] tracking-widest font-light focus:outline-none transition-colors py-1.5 w-32 text-center ${c.searchInput}`}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className={`transition-colors text-xs leading-none ${c.clearBtn}`}
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>

        {/* Mobile: accordion list */}
        <div className="md:hidden w-full">
          <MobileStudyList activeIds={activeIds} dark={dark} c={c} />
        </div>

        {/* Desktop: physics bubble field */}
        <div
          ref={containerRef}
          className="relative w-full flex-1 hidden md:block"
          style={{ minHeight: 'clamp(400px, 50vh, 700px)' }}
          onClick={() => expandedId && setExpandedId(null)}
        >
          {/* Transparent backdrop — click anywhere to close expanded bubble */}
          {expandedId && <div className="absolute inset-0 z-10" />}

          <AnimatePresence>
            {expandedId && (() => {
              const study = caseStudiesData.find(s => s.id === expandedId);
              const diameter = Math.min(400, Math.max(280, bubbleR * 5.8));
              return study ? (
                <ExpandedBubble
                  key={expandedId}
                  study={study}
                  dark={dark}
                  diameter={diameter}
                  onClose={() => setExpandedId(null)}
                />
              ) : null;
            })()}
          </AnimatePresence>

          {caseStudiesData.map(study => {
            const isActive = activeIds.has(study.id);
            const isHovered = hoveredId === study.id;

            return (
              <div
                key={study.id}
                ref={el => { if (el) domRefs.current.set(study.id, el); }}
                className="absolute"
                // Start off-screen; RAF writes correct transform on first frame
                style={{
                  width: size,
                  height: size,
                  transform: 'translate(-9999px, -9999px)',
                  willChange: 'transform',
                }}
              >
                <motion.div
                  className="w-full h-full rounded-full border flex flex-col items-center justify-center text-center cursor-pointer select-none"
                  style={{ padding: Math.max(12, bubbleR * 0.18) }}
                  animate={{
                    opacity: ready ? (expandedId ? 0 : (isActive ? 1 : 0.12)) : 0,
                    scale: expandedId ? 0.85 : (isActive ? (isHovered ? 1.07 : 1) : 0.78),
                    borderColor: isActive
                      ? isHovered ? c.bBorderHover : c.bBorderOn
                      : c.bBorderOff,
                    backgroundColor: isHovered && isActive ? c.bBgHover : 'rgba(0,0,0,0.0)',
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.8 }}
                  onMouseEnter={() => !expandedId && setHoveredId(study.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => isActive && !expandedId && setExpandedId(study.id)}
                >
                  <p
                    className={`uppercase font-light mb-1 leading-none ${c.bTextDomain}`}
                    style={{ fontSize: Math.max(8, bubbleR * 0.105) }}
                  >
                    {study.domain}
                  </p>
                  <p
                    className={`font-cormorant leading-tight ${c.bTextName}`}
                    style={{ fontSize: Math.max(14, bubbleR * 0.26) }}
                  >
                    {study.name}
                  </p>
                  <motion.p
                    className={`font-light mt-1 ${c.bTextYear}`}
                    style={{ fontSize: Math.max(8, bubbleR * 0.1) }}
                    animate={{ opacity: isHovered && isActive ? 1 : 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {study.year}
                  </motion.p>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
