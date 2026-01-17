export interface PrincipleQuadrant {
  id: 'why' | 'who' | 'how' | 'what';
  label: string;
  angle: number; // Starting angle for the slice in degrees
  title: string;
  description: string;
  details: string[];
  image?: string;
  color: {
    base: string;
    hover: string;
    overlay: string;
  };
}

export const principlesData: PrincipleQuadrant[] = [
  {
    id: 'why',
    label: 'Why',
    angle: 270, // Top-left quadrant
    title: 'Ousia Means Substance',
    description: "That which remains when you remove noise, hype, and busyness. We exist to help creators, founders and their teams build what's real: ventures with a clear thesis, a truthful narrative, and operations that don't collapse under growth.",
    details: [
      'We believe the best companies are created from substance, ⨀ to 1: not by copying the market, but by committing to a distinct point of view and executing it with discipline.',
      'We build for long-term compounding—of value, capability, and trust—through modern technology, sound decisions, and partners who take full responsibility for outcomes.',
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
    angle: 0, // Top-right quadrant
    title: 'Intersecting Physical & Digital',
    description: 'We build and evolve digital businesses—where commerce, community, and software intersect: marketplaces, eCommerce, SaaS, social platforms, and hybrid models.',
    details: [
      '1. Equity Partnership: Let\u2019s build Together. Shared ownership and responsibility for creation.',
      '2. Your MVP: Complete system with fixed scope, clear timeline, and handoff ready to scale.',
      '3. Ongoing Engagement: Retainer-based partnership that evolves with your needs.',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
  {
    id: 'who',
    label: 'Who',
    angle: 180, // Bottom-left quadrant
    title: 'Interdisciplinary Venture Studio',
    description: "Strategy, narrative, product, and operations tuned in the same direction—so that your company reflects unison of will, rather than a collection of disconnected efforts.",
    details: [
      'We partner with entrepreneurs, operators, designers, marketers, and makers to bring businesses of the present to life—grounded in clarity, fairness, and high standards.',
      "We're partners who help explore, decide, build, and take responsibility for our action.",
      'Led by Jakub: A serial creator, focused on taking visions from principles to people.',
      'Every venture is a partnership; every partnership is a new vision of virtue made operational.',
    ],
    color: {
      base: '#f9fafb',
      hover: '#e5e7eb',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
  {
    id: 'how',
    label: 'How',
    angle: 90, // Bottom-right quadrant
    title: 'Truth to Execution',
    description: 'We focus on the substance. From truth to thesis to execution. Ethos:',
    details: [
      'Find the secret: the overlooked insight that makes your offering meaningfully different',
      'Architect the narrative: an honest and coherent story–usable by your team and market',
      'Design the Minimum Lovable Product: fewer features, stronger intent, clearer value',
      'Build with integration in mind: the simple and efficient stack that scales',
      'Prove distribution: go-to-market loops until the product earns growth',
      'Operationalize: processes and rhythm so quality doesn\u2019t depend on heroics',
      'We commit to clear decisions, fair collaboration, and craftsmanship-level attention to detail–and we routinely deliver more than required of us. Outcomes matter more than optics.',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
];
