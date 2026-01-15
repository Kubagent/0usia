export interface PrincipleQuadrant {
  id: 'why' | 'who' | 'how' | 'what';
  label: string;
  angle: number; // Starting angle for the slice in degrees
  title: string;
  description: string;
  details: string[];
  color: {
    base: string; // Subtle color for the slice
    hover: string; // Highlight color on hover
    overlay: string; // Overlay background color
  };
}

export const principlesData: PrincipleQuadrant[] = [
  {
    id: 'why',
    label: 'Why',
    angle: 0,
    title: 'Ousia means substance',
    description: 'Ousia means substance—what remains when you remove noise, hype, and busyness. We exist to help founders and teams build what\'s real: ventures with a clear thesis, a truthful narrative, and operations that don\'t collapse under growth.',
    details: [
      'We believe the best companies are created from zero to one: not by copying the market, but by committing to a distinct point of view and executing it with discipline.',
      'We build for long-term compounding—of value, capability, and trust—through modern technology, sound decisions, and partners who take full responsibility for outcomes.',
    ],
    color: {
      base: '#f9fafb',
      hover: '#e5e7eb',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
  {
    id: 'who',
    label: 'Who',
    angle: 90,
    title: 'One body, full accountability',
    description: '0usia is an interdisciplinary venture studio led by Jakub. We operate as one body: strategy, narrative, product, and operations working in the same direction—so your company doesn\'t become a collection of disconnected efforts.',
    details: [
      'We partner with entrepreneurs, operators, designers, marketers, and makers to bring businesses of the present to life—grounded in clarity, fairness, and high standards.',
      'We\'re collaborative when exploring, decisive when committing, meticulous in delivery, and accountable for what we ship.',
      'Jakub: A serial entrepreneur focused on taking ventures from first principles to real markets. Every build is a partnership; every partnership is a new story made operational.',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
  {
    id: 'how',
    label: 'How',
    angle: 180,
    title: 'Substance-first: truth to execution',
    description: 'We work "substance-first"—from truth to thesis to execution.',
    details: [
      'Find the secret: the overlooked insight that makes your offering meaningfully different',
      'Architect the narrative: a story that\'s honest, coherent, and usable by your team and market',
      'Design the MLP: fewer features, stronger intent, clearer value',
      'Build with integration in mind: the simplest stack that can scale',
      'Prove distribution: go-to-market loops until the product earns growth',
      'Operationalize: processes and rhythm so quality doesn\'t depend on heroics',
      'We commit to clear decisions, fair collaboration, and craftsmanship-level attention to detail—and we routinely deliver more than the checklist requires because outcomes matter more than optics.',
    ],
    color: {
      base: '#f9fafb',
      hover: '#e5e7eb',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
  {
    id: 'what',
    label: 'What',
    angle: 270,
    title: 'Digital businesses at the intersection',
    description: 'We build and evolve digital businesses—especially where commerce, community, and software intersect: marketplaces, eCommerce, SaaS, thematic social platforms, and hybrid models.',
    details: [
      'Equity Partnership: Co-build from inception. Shared ownership and responsibility for categorical ventures.',
      'Build-to-Run MVP: Complete system with fixed scope, clear timeline, and full handoff ready to scale.',
      'Ongoing Engagement: Retainer-based strategic + technical partnership that evolves with your needs.',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
];
