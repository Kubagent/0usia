'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCalApi } from '@calcom/embed-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface ExpertiseDomain {
  id: string;
  name: string;
  hook: string;
  description: string;
  deliverables: string[];
}

const domains: ExpertiseDomain[] = [
  {
    id: 'strategy',
    name: 'Strategy',
    hook: 'Clarity precedes all movement.',
    description:
      'Before strategy, there is the determination of truth: present and envisioned. We establish the foundational thesis of your undertaking — what you are creating, for whom, and the precise conditions under which you win.',
    deliverables: [
      'Strategic positioning',
      'Business model design',
      'Roadmap & KPI framework',
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    hook: 'Present your truth thoroughly.',
    description:
      'Re-presentation to others is finding the exact form in which your venture\'s truth becomes visible to its new community. We build the conceptual scaffolding: your virtues, your story, how you communicate it to the world, and whom it targets.',
    deliverables: [
      'Brand philosophy & book',
      'Voice, tone & messaging',
      'Copy, film & photography',
    ],
  },
  {
    id: 'community',
    name: 'Community',
    hook: 'From your team to your world.',
    description:
      'An organisation is as coherent as its people are connected — those inside it and those it is built for. We shape the conditions under which teams align, audiences gather, and joy is shared.',
    deliverables: [
      'Founder & team analysis',
      'Decision framework',
      'Community-led GTM',
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    hook: 'Build a system that flows.',
    description:
      'Before we build anything, we understand your establihsed practices, your present needs and will toward the future. Then we design something better: a system that automates intelligently, scales your business, and is built to be enjoyed.',
    deliverables: [
      'Process audit & design',
      'Systems & automation',
      'Workflow architecture',
    ],
  },
  {
    id: 'function',
    name: 'Function',
    hook: 'Innovate your essence.',
    description:
      'What and how you are may change. We help you innovate. \n We develop the features, moves, and evolution that expand your reach, deepen your presence and leave the right footprint on the communities you belong to.',
    deliverables: [
      'Product strategy & roadmap',
      'UX & UI design system',
      'Feature development',
    ],
  },
];

// Floating content — no circle, no container. Text lives in the open black space.
// pointer-events-auto overrides parent's pointer-events-none; clicking the background dismisses.
function DomainContent({
  domain,
  onDismiss,
  onBookCall,
}: {
  domain: ExpertiseDomain;
  onDismiss: () => void;
  onBookCall: () => void;
}) {
  return (
    <motion.div
      className="relative flex flex-col items-center text-center max-w-2xl px-8 pointer-events-auto cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDismiss}
      onMouseLeave={onDismiss}
    >
      {/* Dark radial vignette behind text for legibility against varied backgrounds */}
      <div
        className="absolute -inset-x-20 -inset-y-14 pointer-events-none -z-10"
        style={{ background: 'radial-gradient(ellipse 78% 92% at center, rgba(0,0,0,0.48) 10%, transparent 78%)' }}
      />

      <motion.p
        className="font-cormorant font-light text-lg tracking-widest text-white mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        {domain.name}
      </motion.p>

      <motion.h3
        className="text-4xl md:text-5xl font-cormorant italic text-white leading-snug mb-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {domain.hook}
      </motion.h3>

      <motion.div
        className="h-px bg-white/25 mb-6"
        initial={{ width: 0 }}
        animate={{ width: 48 }}
        transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
      />

      <motion.p
        className="text-base font-light text-white/70 leading-relaxed mb-8 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.24 }}
      >
        {domain.description}
      </motion.p>

      {/* Deliverables as clickable action panels — 3 columns keeps vertical height low */}
      <motion.div
        className="grid grid-cols-3 gap-1.5 w-full max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.34 }}
      >
        {domain.deliverables.map((item, i) => (
          <motion.button
            key={i}
            className="group flex items-center justify-center px-3 py-2.5 text-center border border-white/15 rounded-sm hover:border-white/35 hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.38 + i * 0.055 }}
            onClick={(e) => {
              e.stopPropagation();
              onBookCall();
            }}
          >
            <span className="text-xs font-light text-white/60 group-hover:text-white/85 transition-colors duration-200 leading-none whitespace-nowrap">
              {item}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

function DotTrack({
  activeDomain,
  onActivate,
  canHover,
}: {
  activeDomain: string | null;
  onActivate: (id: string | null) => void;
  canHover: boolean;
}) {
  return (
    // grid-cols-5 gives each domain an equal column — the full column width is the hover zone,
    // so moving across the track smoothly switches domains even when content is already expanded.
    <div className="relative grid grid-cols-5 w-full max-w-[50.4rem] mx-auto pointer-events-auto">
      <div className="absolute top-2 left-0 right-0 h-px bg-white/12 pointer-events-none" />

      {domains.map((domain, index) => (
        <div
          key={domain.id}
          className="flex flex-col items-center py-2 cursor-pointer"
          onMouseEnter={() => canHover && onActivate(domain.id)}
        >
          {/* Dot + rings wrapper */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            {/* Idle pulse ring */}
            {!activeDomain && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
                animate={{ scale: [1, 2.6, 1], opacity: [0, 0.2, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.6, ease: 'easeInOut' }}
              />
            )}

            {/* One-shot exhale ring: blooms once when this dot becomes active */}
            {activeDomain === domain.id && (
              <motion.div
                className="absolute inset-0 rounded-full border border-white/30 pointer-events-none"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}

            <motion.button
              className="w-4 h-4 rounded-full bg-white border border-white/30 relative z-10"
              animate={{
                scale: activeDomain === domain.id ? 0 : activeDomain ? 0.65 : 1,
                opacity: activeDomain === domain.id ? 0 : activeDomain ? 0.15 : 1,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              aria-label={`View ${domain.name} expertise`}
              style={{ display: 'block' }}
            />
          </div>

          <motion.p
            className="font-cormorant font-light text-lg tracking-widest select-none mt-5 text-white"
            animate={{
              opacity: activeDomain === domain.id ? 0 : activeDomain ? 0.12 : 0.85,
            }}
            transition={{
              duration: activeDomain === domain.id ? 0.4 : 0.3,
              delay: activeDomain === domain.id ? 1.0 : 0,
            }}
          >
            {domain.name}
          </motion.p>
        </div>
      ))}
    </div>
  );
}

function MobileGrid({ onActivate }: { onActivate: (id: string) => void }) {
  return (
    <div className="relative flex flex-col items-stretch w-full">
      {/* Vertical connecting line — sits at the true horizontal center */}
      <div className="absolute left-1/2 top-3 bottom-3 w-px bg-white/12 -translate-x-1/2 pointer-events-none" />
      {domains.map((d, i) => {
        const textRight = i % 2 === 0;
        const dot = (
          <div className="relative flex items-center justify-center w-3.5 h-3.5 flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
              animate={{ scale: [1, 2.4, 1], opacity: [0, 0.18, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
            />
            <div className="w-3.5 h-3.5 rounded-full bg-white border border-white/30 relative z-10" />
          </div>
        );
        return (
          <button key={d.id} className="relative flex items-center py-6 w-full" onClick={() => onActivate(d.id)}>
            {textRight ? (
              <>
                <div className="flex-1" />
                {dot}
                <div className="flex-1 pl-5 text-left">
                  <p className="font-cormorant font-light text-white/55 text-base tracking-widest">{d.name}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 pr-5 text-right">
                  <p className="font-cormorant font-light text-white/55 text-base tracking-widest">{d.name}</p>
                </div>
                {dot}
                <div className="flex-1" />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

function BottomSheet({ domain, onClose }: { domain: ExpertiseDomain; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[82vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.velocity.y > 400 || info.offset.y > 180) onClose();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-8 h-0.5 rounded-full bg-black/15" />
        </div>
        <div className="px-8 pb-12 flex flex-col items-center text-center">
          <p className="text-xs font-light tracking-[0.25em] text-black/30 uppercase mb-3 mt-2">{domain.name}</p>
          <h3 className="text-2xl font-cormorant italic text-black leading-snug mb-5 max-w-xs">{domain.hook}</h3>
          <div className="w-6 h-px bg-black/20 mb-5" />
          <p className="text-sm font-light text-black/60 leading-relaxed mb-6 max-w-sm">{domain.description}</p>
          <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            {domain.deliverables.map((item, i) => (
              <p key={i} className="text-xs text-black/40 font-light tracking-wide leading-snug">{item}</p>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExpertiseShowcase() {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [titleInView, setTitleInView] = useState(false);
  const { isMobile, canHover } = useMobileDetection();
  const activeData = domains.find((d) => d.id === activeDomain) ?? null;

  // Cooldown prevents dot-hover from immediately re-activating after a dismiss.
  // Without this, moving the cursor down from the content into the dot track fires
  // both onMouseLeave (dismiss) and onMouseEnter (re-activate) in the same frame,
  // making it impossible to collapse by moving down or up.
  const dismissCooldownRef = useRef(false);

  const dismiss = useCallback(() => {
    setActiveDomain(null);
    dismissCooldownRef.current = true;
    setTimeout(() => { dismissCooldownRef.current = false; }, 150);
  }, []);

  const safeActivate = useCallback((id: string | null) => {
    if (id !== null && dismissCooldownRef.current) return;
    setActiveDomain(id);
  }, []);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: 'discovery' });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);

  const openCalModal = useCallback(async () => {
    const cal = await getCalApi({ namespace: 'discovery' });
    cal('modal', {
      calLink: '0usia/discovery',
      calOrigin: 'https://app.cal.eu',
      config: { layout: 'month_view' },
    });
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center py-20 overflow-hidden"
      onMouseLeave={dismiss}
    >
      {/* Floating content — desktop. Top is anchored at calc(50vh - 320px) so the content
          always ends ~48px above the dot track, regardless of viewport height. */}
      <AnimatePresence>
        {activeDomain && activeData && !isMobile && (
          <motion.div
            key="expertise-content"
            className="absolute inset-0 z-10 flex items-start justify-center pointer-events-none"
            style={{ paddingTop: 'max(32px, calc(50vh - 320px))' }}
          >
            <DomainContent key={activeDomain} domain={activeData} onDismiss={dismiss} onBookCall={openCalModal} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss zones — sides + top + bottom strip below dots.
          z-30 so they fire; dot track container is z-40 pointer-events-none so it doesn't
          block these, while its grid cells (pointer-events-auto) fire above them. */}
      {activeDomain && !isMobile && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1/4 z-30 cursor-default" onMouseEnter={dismiss} />
          <div className="absolute right-0 top-0 bottom-0 w-1/4 z-30 cursor-default" onMouseEnter={dismiss} />
          <div className="absolute top-0 left-1/4 right-1/4 h-32 z-30 cursor-default" onMouseEnter={dismiss} />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-16 z-30 cursor-default" onMouseEnter={dismiss} />
        </>
      )}

      {/* Title — uses onViewportEnter so animate prop can independently control opacity */}
      <motion.div
        className="text-center mb-24 md:mb-32 relative z-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: !titleInView ? 0 : activeDomain ? 0 : 1,
          y: !titleInView ? 20 : 0,
        }}
        transition={{ duration: activeDomain ? 0.3 : 0.6 }}
        onViewportEnter={() => setTitleInView(true)}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-ovsia-header-lg-plus sm:text-ovsia-header-xl md:text-ovsia-header-2xl lg:text-ovsia-header-4xl font-cormorant tracking-tight text-white">
          Expertise
        </h2>
        <p className="text-ovsia-body-xl text-white font-light max-w-2xl mx-auto mt-4">
          How we support flourishment
        </p>
      </motion.div>

      {/* Dot track — z-40 pointer-events-none on the container so it doesn't block side dismiss zones;
          grid root inside re-enables pointer-events-auto for the actual cells */}
      <div className="hidden md:block w-full px-20 lg:px-32 relative z-40 pointer-events-none">
        <DotTrack activeDomain={activeDomain} onActivate={safeActivate} canHover={canHover} />
      </div>

      {/* Mobile grid */}
      <div className="md:hidden w-full px-8 relative z-20">
        <MobileGrid onActivate={setActiveDomain} />
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {activeDomain && activeData && isMobile && (
          <BottomSheet key={`sheet-${activeDomain}`} domain={activeData} onClose={() => setActiveDomain(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
