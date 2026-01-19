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
    description: "That which remains when you remove noise, hype, and busyness.",
    
    details: [
      "We help creators and their teams build real ventures with a clear thesis, a truthful narrative, and operations that don't collapse under growth.",
      'We believe the best companies are created from substance: ⨀ to 1.',
      'We build for long-term compounding—of value, capability, and trust—through innovative technology, sound decisions, and partners who take full responsibility for outcomes. Not by copying the market, but by committing to a distinct point of view and discipled execution.'
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
    description: 'We build digital businesses—where commerce, community, and software intersect: marketplaces, eCommerce, SaaS, social platforms, and hybrids.',
    details: [
      '1. Equity Partnership: Shared ownership and responsibility for creation.',
      '2. Your MVP: System with fixed scope, clear timeline–ready to scale.',
      '3. Ongoing Support: Retainer engagement based on your needs.',
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
    description: "Strategy, narrative, product, and operations tuned in the same direction. Your company should reflect unison of will, rather than a collection of disconnected efforts.",
    details: [
      'We partner with entrepreneurs, operators, designers, marketers, and makers to bring businesses of the present to life—grounded in clarity, fairness, and high standards.',
      'Undertakings are led by Jakub Wójcik, a serial creator, focused on taking visions from principles to people. Every venture is a partnership; every partnership is a new vision of virtue, made operational.',
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
    title: 'Truth to Thesis to Execution',
    description: 'We focus on the substance. Our ethos:',
    details: [
      'Find the secret: the insight that makes your offer truly distinct',
      'Architect the narrative: an honest and coherent story for all to follow',
      'Minimum Lovable Product: fewer features, strong intent, real value',
      'With integration in mind: the simple and efficient stack that scales',
      'Prove distribution: GTM loops until the product earns growth',
      'Operationalise: structured processes reflecting natural rhythms',
      'We commit to clear decisions, fair collaboration, and craftsmanship-level attention to detail–and we routinely deliver more than required of us. Outcomes matter more than optics.',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
];
