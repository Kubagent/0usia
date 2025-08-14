/**
 * Home Page - Server Component
 * 
 * Entry point that delegates to ContentProvider for build-time content fetching
 * This approach allows for proper SSG/ISR with the App Router
 */

import ContentProvider from './content-provider';
import { Suspense } from 'react';

// Loading component for content fetching
function ContentLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
        <p className="text-2xl font-space">Loading Ovsia content...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<ContentLoading />}>
      <ContentProvider />
    </Suspense>
  );
}