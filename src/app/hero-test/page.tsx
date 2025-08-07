import SimpleHero from '@/components/sections/SimpleHero';

export default function HeroTestPage() {
  return (
    <div>
      {/* Updated SimpleHero with robust scroll animation */}
      <SimpleHero />
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-gray-800">Section 2 - Scroll Up To See Animation</h2>
      </div>
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-blue-800">Section 3</h2>
      </div>
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-green-800">Section 4</h2>
      </div>
    </div>
  );
}