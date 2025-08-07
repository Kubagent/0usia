import TagLineSection from '@/sections/TagLineSection';

export default function TestPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black' }}>
      <h1 style={{ 
        color: 'red', 
        fontSize: '3rem', 
        textAlign: 'center',
        paddingTop: '2rem',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        TEST PAGE - Can you see this red text?
      </h1>
      <TagLineSection />
    </div>
  );
}
