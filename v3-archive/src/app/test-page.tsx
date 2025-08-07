import TagLineSection from '@/sections/TagLineSection';

export default function TestPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black', padding: '2rem' }}>
      <h1 style={{ color: 'white', fontSize: '3rem', textAlign: 'center' }}>Test Page</h1>
      <TagLineSection />
    </div>
  );
}
