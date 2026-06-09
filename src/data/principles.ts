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
    angle: 270,
    title: 'Ousia Means Substance',
    description: 'That which remains when noise, hype, and busyness are removed.\nA distinct thesis, a truthful narrative, operations that compound.',
    details: [
      'From ⨀ to 1: substance before scale, clarity before execution.',
      'Long-term compounding of value, capability, and trust — nothing less.',
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
    angle: 0,
    title: 'Vision, Virtue, Venture',
    description: 'We are craftsmen of vision, driven by virtues, to create true ventures. From insight to the coherence of its execution, built with good intent, designed for lasting exchange.',
    details: [
      'Equity partnership, scoped MVP, or ongoing retainer — structured for your stage.',
      'The model serves the mission; the structure serves the builder.',
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
    angle: 180,
    title: 'Interdisciplinary Vision Studio',
    description: 'Strategy for actualising vision, communication of identity, community of shared experience, scalable operations, and function that delivers value, held in harmony by Kuba Wójcik.',
    details: [
      'We partner with entrepreneurs, operators, and creators and artists who build with intention.',
      'Every venture is a partnership; every partnership is a new vision of virtue.',
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
    angle: 90,
    title: 'Truth to Thesis to Execution',
    description: 'Find the secret. Architect the narrative. Build the Minimum Lovable Product. \nProve distribution. Operationalise & Automate. Scale and share love.',
    details: [
      'Start with love: fewer features, strong intent, real value from the first user.',
      'Clear decisions, fair collaboration, craftsmanship-level attention to outcomes — always.',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
];
