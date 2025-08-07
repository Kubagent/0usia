// ExpertiseSection.tsx - Static server component with no client-side dependencies

// Define expertise items statically to avoid any client-side processing
const expertiseItems = [
  { title: 'Talent network', description: 'Access to a curated network of top-tier professionals and domain experts' },
  { title: 'Strategy', description: 'Data-driven strategic planning and execution for sustainable growth' },
  { title: 'AI operations', description: 'Leveraging artificial intelligence to optimize business processes' },
  { title: 'Brand values & narrative', description: 'Crafting compelling brand stories that resonate with your audience' },
  { title: 'Inspiration', description: 'Fostering innovation through creative thinking and visionary leadership' },
  { title: 'Capital', description: 'Strategic investment and financial resources to fuel your venture\'s growth' },
];

// Static styles as constants to ensure consistent server-side rendering
const sectionStyle = {
  width: '100%',
  height: '100vh', // Full viewport height
  padding: '5rem 1rem',
  backgroundColor: '#ffffff',
  color: '#000000',
  position: 'relative' as const,
  zIndex: 10,
  overflow: 'hidden' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const headingStyle = {
  textAlign: 'center' as const,
  fontSize: '2.25rem',
  fontWeight: 'bold' as const,
  marginBottom: '4rem',
  color: '#000000',
  position: 'relative' as const,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '2.5rem',
  width: '90%',
  maxWidth: '1400px',
  margin: '0 auto',
  position: 'relative' as const,
  zIndex: 5,
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '2rem',
  borderRadius: '0.75rem',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
  transition: 'none',
  transform: 'none',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'flex-start' as const,
};

const cardTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 'bold' as const,
  marginBottom: '0.75rem',
  color: '#000000',
};

const cardDescriptionStyle = {
  color: '#4B5563',
};

// Export as a pure static server component
export default function ExpertiseSection() {
  // Use a simple array mapping with no dynamic behavior
  const expertiseCards = [];
  for (let i = 0; i < expertiseItems.length; i++) {
    const item = expertiseItems[i];
    expertiseCards.push(
      <div key={i} style={cardStyle}>
        <h3 style={cardTitleStyle}>{item.title}</h3>
        <p style={cardDescriptionStyle}>{item.description}</p>
      </div>
    );
  }

  return (
    <section id="expertise-section" style={sectionStyle}>
      <h2 style={headingStyle}>Our Expertise</h2>
      <div style={gridStyle}>{expertiseCards}</div>
    </section>
  );
}
