// Project data structure with metadata
export interface ProjectData {
  id: string;
  name: string;
  status: 'past' | 'present' | 'development';
  businessModel: string;
  form: string;
  industry: string;
  url: string;
  logoSrc: string;
  color: string; // For hover overlay background
}

// Project data from PRD
export const projectsData: ProjectData[] = [
  // Past Projects
  {
    id: 'wojcistics',
    name: 'Wojcistics',
    status: 'past',
    businessModel: 'B2B',
    form: 'Corporation',
    industry: 'Distribution, Transport Tech',
    url: 'https://example.com/wojcistics',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#3B82F6', // Blue
  },
  {
    id: 'fixapp',
    name: 'Fix App (Exit)',
    status: 'past',
    businessModel: 'FM',
    form: 'Startup',
    industry: 'Marketplace',
    url: 'https://example.com/fixapp',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#10B981', // Green
  },
  {
    id: 'objectsgallery',
    name: 'Objects Gallery',
    status: 'past',
    businessModel: 'B2C',
    form: 'Corporation',
    industry: 'Ecomm, Decoration, Interior Design',
    url: 'https://example.com/objectsgallery',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#6366F1', // Indigo
  },

  // Present Projects
  {
    id: 'substans',
    name: 'SUBSTANS',
    status: 'present',
    businessModel: 'B2B',
    form: 'Corporation',
    industry: 'Technology',
    url: 'https://example.com/substans',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#EC4899', // Pink
  },
  {
    id: 'libelo',
    name: 'LIBELO',
    status: 'present',
    businessModel: 'B2C',
    form: 'Startup',
    industry: 'Technology',
    url: 'https://example.com/libelo',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#8B5CF6', // Purple
  },

  // In Development
  {
    id: 'violca',
    name: 'VIOLCA',
    status: 'development',
    businessModel: 'B2B',
    form: 'Startup',
    industry: 'Technology',
    url: 'https://example.com/violca',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#F59E0B', // Amber
  },
  {
    id: 'ourparks',
    name: 'OUR PARKS',
    status: 'development',
    businessModel: 'B2C',
    form: 'Startup',
    industry: 'Recreation',
    url: 'https://example.com/ourparks',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#EF4444', // Red
  },
  {
    id: 'lejman',
    name: 'Lejman',
    status: 'development',
    businessModel: 'B2B',
    form: 'Corporation',
    industry: 'Business Services',
    url: 'https://example.com/lejman',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#14B8A6', // Teal
  },
  {
    id: 'neuhaus',
    name: 'Neuhaus',
    status: 'development',
    businessModel: 'B2C',
    form: 'Corporation',
    industry: 'Design',
    url: 'https://example.com/neuhaus',
    logoSrc: '/project-logos/placeholder.svg',
    color: '#8B5CF6', // Purple
  }
];
