export interface CaseStudy {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  summary: string;
  challenge: string;
  approach: string;
  deliverables: string[];
  outcomes: string[];
  year: number;
  venture?: string;
}

export const caseStudiesData: CaseStudy[] = [
  {
    id: 'dominik-lejman',
    name: 'Dominik Lejman',
    domain: 'Communication',
    tags: ['artist', 'portfolio', 'brand', 'identity', 'narrative', 'website', 'contemporary-art', 'presentation'],
    summary: 'Brand architecture and digital presence for a major contemporary Polish video and projection artist.',
    challenge: 'Dominik Lejman\'s practice spans gallery installations, public commissions, and institutional exhibitions across three continents. The existing digital presence failed to reflect the depth of the work or serve as a credible interface for curators and collectors. A portfolio built in pieces — disconnected, unscalable, without a coherent voice.',
    approach: 'We established the narrative architecture first: what the work is, how it should be encountered, and by whom. From that foundation, we designed a digital presence built around the work itself — sparse, intentional, built to travel with the practice as it evolves and grows.',
    deliverables: [
      'Brand philosophy and presentation architecture',
      'Full portfolio website design and development',
      'Exhibition and publication documentation system',
      'Voice and tone guide for institutional communications',
      'Press kit and artist statement framework',
    ],
    outcomes: [
      'Cohesive digital presence adopted across all institutional contexts',
      'Improved curatorial and collector engagement through clearer narrative architecture',
      'Scalable system for ongoing practice documentation without structural rework',
    ],
    year: 2026,
    venture: 'dominik-lejman',
  },
  {
    id: 'here-could-be-home',
    name: 'loop-raum',
    domain: 'Arts',
    tags: ['exhibition', 'curation', 'contemporary-art', 'berlin', 'installation', 'partnership', 'substans', 'loop-raum', 'community'],
    summary: 'Here Could Be Home — exhibition co-developed with Substans.art and Rüdiger Lange at loop-raum, Berlin.',
    challenge: 'Bringing together an exhibition that holds a genuine curatorial thesis — not a group show assembled by proximity, but a coherent inquiry — requires alignment across artists, institutional partners, and the space itself. The challenge was to develop a programme that was locally rooted but internationally resonant, and to produce it with the rigour and care the work deserved.',
    approach: 'Working in close partnership with Substans.art and Rüdiger Lange of loop-raum, we co-developed the conceptual framework, the curatorial sequence, and the production architecture of the exhibition. Our role spanned the thinking and the doing: from the thesis to the timeline, from partner coordination to the conditions under which audiences could genuinely encounter the work.',
    deliverables: [
      'Exhibition concept development and curatorial thesis',
      'Programme architecture and artist coordination',
      'Institutional partnership and venue collaboration with loop-raum',
      'Production planning and exhibition logistics',
      'Communications and audience engagement strategy',
    ],
    outcomes: [
      'Exhibition realised in partnership at loop-raum, Berlin',
      'Deepened institutional relationship between 0usia and Substans.art',
      'Programme establishing a model for future co-produced cultural projects',
    ],
    year: 2025,
    venture: 'substans',
  },
  {
    id: 'expanded-art',
    name: 'Expanded Art',
    domain: 'Operations',
    tags: ['art', 'platform', 'digital', 'marketplace', 'community', 'operations', 'gtm', 'brand', 'positioning'],
    summary: 'Platform strategy and go-to-market for a digital art marketplace expanding beyond gallery conventions.',
    challenge: 'The art market is structurally resistant to digital disruption — not because of the art, but because of the relationships. Expanded Art needed a position credible to artists and collectors while genuinely extending beyond the existing gallery model. The key question: what does it mean to expand art, and for whom?',
    approach: 'We worked from first principles: establishing the precise thesis of the platform, its differentiation from gallery and auction models, and the community mechanics that would drive organic participation. Strategy was followed by GTM sequencing — which artists first, which collectors, which cultural institutions — and in what order.',
    deliverables: [
      'First principles positioning and differentiation thesis',
      'Platform business model architecture',
      'Community activation and GTM sequencing plan',
      'Messaging system for artists, collectors, and institutions',
      'Phased roadmap with milestone and validation criteria',
    ],
    outcomes: [
      'Clear platform thesis enabling focused feature development and team alignment',
      'Defined community entry strategy reducing go-to-market uncertainty',
      'Brand and messaging system deployed across all launch-phase communications',
    ],
    year: 2024,
  },
  {
    id: 'lucyna-ai',
    name: 'Lucyna',
    domain: 'Communication',
    tags: ['ai', 'saas', 'startup', 'brand', 'positioning', 'gtm', 'narrative', 'b2b', 'product', 'identity'],
    summary: 'Brand identity and go-to-market strategy for an AI-native product entering a competitive landscape.',
    challenge: 'In a market saturated with AI tooling, Lucyna needed more than a product — it needed a position. The challenge was not capability but articulation: what makes this distinctly valuable, to whom, and why now. Early messaging was technically accurate but failed to land with the intended audience.',
    approach: 'We began with an audience analysis and competitive landscape to locate genuine white space. From there, we rebuilt the brand outward from its core value proposition — establishing the voice, the visual system, and a messaging hierarchy that could scale from product copy to pitch deck without contradiction.',
    deliverables: [
      'Brand philosophy and differentiation thesis',
      'Full brand book: voice, tone, and visual direction',
      'Messaging hierarchy: homepage, product, and outreach',
      'Landing page copy and pitch deck narrative',
      'GTM channel strategy and activation sequence',
    ],
    outcomes: [
      'Brand system adopted across all product surfaces and marketing channels',
      'Improved audience conversion through clearer positioning and landing page copy',
      'Pitch narrative supporting successful investor and partner conversations',
    ],
    year: 2026,
  },
  {
    id: 'paso',
    name: 'Paso',
    domain: 'Function',
    tags: ['product', 'saas', 'ux', 'innovation', 'strategy', 'workflow', 'platform', 'b2b', 'roadmap'],
    summary: 'Product strategy and UX architecture for a step-by-step workflow and process-sharing platform.',
    challenge: 'Paso was solving a real problem — the absence of a lightweight, shareable format for process documentation — but the initial product scope was broader than the market required. Without a clear entry wedge and a defined first user, development was diffuse and early adoption was slow to build momentum.',
    approach: 'We ran a first-principles analysis of who actually needs to share step-by-step processes, the contexts in which that need arises, and what alternatives they currently use. From that, we narrowed the product scope to an MLP, designed the core UX architecture, and sequenced the GTM around a specific community of first adopters.',
    deliverables: [
      'First principles analysis and positioning thesis',
      'MLP feature scope definition and product roadmap',
      'UX architecture and full system wireframing',
      'GTM strategy targeting defined first-adopter community',
      'KPI framework for early traction validation',
    ],
    outcomes: [
      'Focused product scope enabling a materially faster build-to-ship cycle',
      'Defined first-adopter community providing initial distribution without paid acquisition',
      'UX architecture serving as the stable foundation for ongoing feature development',
    ],
    year: 2026,
  },
  {
    id: 'fix',
    name: 'Fix',
    domain: 'Function',
    tags: ['marketplace', 'b2b', 'facility-management', 'product', 'gtm', 'acquisition', 'two-sided', 'platform'],
    summary: 'Marketplace build and operational architecture for a facility management platform — acquired.',
    challenge: 'The facility management sector runs on relationships and phone calls. Fix was building a marketplace to bring that interaction online — a structurally hard problem involving two-sided network effects, trust deficits, and an incumbent base resistant to change. The team needed a GTM and operational model that could build supply-side density before demand arrived.',
    approach: 'We sequenced the launch around geographic concentration rather than broad horizontal expansion — seeding one city deeply before moving. Operational architecture focused on the supply side: onboarding, trust-building, and service consistency mechanisms that reduced churn and built the reputation on which the demand side would eventually depend.',
    deliverables: [
      'Two-sided marketplace strategy and launch sequencing',
      'Supply-side onboarding and operational architecture',
      'Service consistency and trust framework',
      'GTM plan: city-first concentration model',
      'Metrics framework for marketplace health',
    ],
    outcomes: [
      'Successful marketplace launch with positive unit economics within target window',
      'Acquisition by strategic buyer validating the platform model and team execution',
      'Operational systems that transferred cleanly through the M&A process',
    ],
    year: 2021,
    venture: 'fix',
  },
  {
    id: 'violca',
    name: 'Violca',
    domain: 'Communication',
    tags: ['cycling', 'apparel', 'accessories', 'rebranding', 'identity', 'e-commerce', 'lifestyle', 'brand', 'premium'],
    summary: 'Complete organisational rebranding positioning Violca as the destination for high-end cycling apparel, accessories, and adventures.',
    challenge: 'Violca had an established presence in the cycling community but its brand no longer reflected the level of product and experience it was delivering. The visual identity, the voice, and the positioning had drifted — caught between mass-market cycling retail and the premium, experience-led brand it was becoming. The rebrand needed to close that gap completely.',
    approach: 'We rebuilt the brand from its core thesis outward: cycling not as sport alone, but as a mode of encountering the world — demanding the finest equipment and the most meaningful experiences. From that premise, we developed the full identity system, the communication architecture, and the narrative that would hold across product, editorial, and community touchpoints.',
    deliverables: [
      'Brand philosophy and positioning thesis',
      'Full visual identity system: logo, typography, colour, photography direction',
      'Brand book and application guidelines',
      'Messaging system and editorial voice',
      'Digital presence redesign and e-commerce brand integration',
    ],
    outcomes: [
      'Coherent premium brand identity adopted across all channels and product lines',
      'Clearer market positioning differentiating Violca from mass-market cycling retail',
      'Brand system capable of scaling with product range and geographic expansion',
    ],
    year: 2026,
    venture: 'violca',
  },
  {
    id: 'chokosol',
    name: 'ChokoSol',
    domain: 'Strategy',
    tags: ['chocolate', 'artisan', 'identity', 'distribution', 'brand', 'strategy', 'food-beverage', 'craft', 'b2c'],
    summary: 'Identity refinement and distribution strategy for a small-batch artisan chocolate maker.',
    challenge: 'ChokoSol produces exceptional chocolate with a clear philosophy — but the identity had not been developed to the same level as the product, and distribution remained narrower than the brand\'s potential warranted. The question was how to reach the right audience without compromising the integrity of what made the product worth seeking out.',
    approach: 'We worked on two tracks simultaneously: refining the identity to express the intentionality behind the product with full clarity, and designing a distribution strategy that matched that level of care — identifying the right channels, partners, and sequencing to build presence without dilution.',
    deliverables: [
      'Brand identity refinement and visual system development',
      'Distribution channel strategy and partner identification',
      'Positioning thesis and audience definition',
      'Retail and e-commerce distribution roadmap',
      'Brand narrative and communications framework',
    ],
    outcomes: [
      'Identity elevated to match the quality and philosophy of the product',
      'Distribution strategy defining the pathway to reach the right audience at scale',
      'Clear framework for evaluating future distribution opportunities against brand integrity',
    ],
    year: 2026,
    venture: 'chokosol',
  },
  {
    id: 'silcare',
    name: 'Silcare',
    domain: 'Strategy',
    tags: ['beauty', 'cosmetics', 'branding', 'identity', 'distribution', 'strategy', 'innovation', 'channels', 'retail'],
    summary: 'Branding identity consultancy and distribution potential analysis through innovative channels for a beauty and cosmetics brand.',
    challenge: 'Silcare operated in a market where brand identity and distribution channel selection are among the most consequential competitive variables. The existing identity did not fully leverage the brand\'s heritage and product quality, and distribution had not yet explored the channels where its audience was increasingly active and receptive.',
    approach: 'We conducted a structured assessment of the brand\'s identity strengths and gaps, developed a strategic direction for its evolution, and mapped the distribution landscape — identifying the innovative channels best suited to reaching Silcare\'s audience with credibility and at meaningful scale.',
    deliverables: [
      'Brand identity audit and strategic development direction',
      'Innovative distribution channel mapping and prioritisation',
      'Audience analysis and channel-fit assessment',
      'Positioning refinement and competitive differentiation thesis',
      'Strategic roadmap for identity and distribution evolution',
    ],
    outcomes: [
      'Clear strategic direction for brand identity development',
      'Identified distribution channels representing material untapped potential',
      'Roadmap enabling phased execution without disruption to existing business',
    ],
    year: 2024,
  },
];
