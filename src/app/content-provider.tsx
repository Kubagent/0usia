/**
 * Content Provider Component
 * 
 * Server-side component that fetches content and provides it to client components
 * Handles build-time content fetching with proper error boundaries
 */

import { fetchBuildTimeContent } from '@/lib/build-time-content';
import HomeClient from './page-client';
import { NotionErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

interface ContentProviderProps {
  children?: React.ReactNode;
}

/**
 * Server component that fetches content at build/request time
 */
export default async function ContentProvider({ children }: ContentProviderProps) {
  try {
    logger.info('content', 'ContentProvider: Starting build-time content fetch');
    
    // Skip content fetching during development to avoid delays
    if (process.env.NODE_ENV === 'development') {
      logger.info('content', 'ContentProvider: Skipping fetch for development, using fallback');
      
      return (
        <NotionErrorBoundary>
          <HomeClient 
            siteContent={undefined}
            contentMetadata={{
              source: 'fallback',
              timestamp: new Date().toISOString(),
              buildId: 'dev-fallback',
              errors: [],
              warnings: ['Using fallback content for development'],
            }}
          >
            {children}
          </HomeClient>
        </NotionErrorBoundary>
      );
    }
    
    const result = await fetchBuildTimeContent({
      useCache: process.env.NODE_ENV === 'production',
      forceFresh: false,
    });
    
    logger.info('content', 'ContentProvider: Content fetched successfully', {
      source: result.metadata.source,
      ventures: result.content.ventures.length,
      capabilities: result.content.capabilities.length,
      errors: result.metadata.errors.length,
      warnings: result.metadata.warnings.length,
    });
    
    return (
      <NotionErrorBoundary>
        <HomeClient 
          siteContent={result.content}
          contentMetadata={result.metadata}
        >
          {children}
        </HomeClient>
      </NotionErrorBoundary>
    );
  } catch (error: unknown) {
    logger.error('content', 'ContentProvider: Failed to fetch content', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }, error instanceof Error ? error : undefined);
    
    // Render with fallback content wrapped in error boundary
    return (
      <NotionErrorBoundary>
        <HomeClient 
          siteContent={undefined}
          contentMetadata={{
            source: 'fallback',
            timestamp: new Date().toISOString(),
            buildId: 'error-fallback',
            errors: [`Content fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: ['Using fallback content due to fetch error'],
          }}
        >
          {children}
        </HomeClient>
      </NotionErrorBoundary>
    );
  }
}