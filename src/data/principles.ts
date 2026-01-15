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
    title: 'Purpose-Driven',
    description: 'We believe in building ventures that matter...',
    details: [
      'Impact over vanity metrics',
      'Long-term value creation',
      'Sustainable growth',
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
    title: 'People-First',
    description: 'We partner with exceptional founders...',
    details: [
      'Collaborative partnerships',
      'Diverse perspectives',
      'Empowered teams',
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
    title: 'Excellence-Oriented',
    description: 'We execute with precision and care...',
    details: [
      'Strategic thinking',
      'Operational excellence',
      'Continuous improvement',
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
    title: 'Value-Creating',
    description: 'We build sustainable, impactful ventures...',
    details: [
      'Innovative solutions',
      'Market leadership',
      'Lasting impact',
    ],
    color: {
      base: '#f3f4f6',
      hover: '#d1d5db',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
  },
];
