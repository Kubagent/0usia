/**
 * Content Caching System
 * 
 * Provides intelligent caching for Notion content with TTL, invalidation, and optimization
 * Supports both memory and file-based caching strategies
 */

import { writeFile, readFile, mkdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';
import type { ContentFetchResult, SiteContent } from '@/types/notion';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  source: string;
  hash?: string;
  metadata?: {
    buildId?: string;
    version?: string;
    size?: number;
  };
}

export interface CacheConfig {
  enabled: boolean;
  directory: string;
  defaultTTL: number; // milliseconds
  maxSize: number; // max cache size in MB
  compression: boolean;
  strategies: {
    memory: boolean;    // In-memory caching
    disk: boolean;      // File-based caching
    network: boolean;   // Network-based caching (future)
  };
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: process.env.NODE_ENV === 'production',
  directory: join(process.cwd(), '.next/cache/notion'),
  defaultTTL: 3600000, // 1 hour
  maxSize: 50, // 50MB
  compression: false, // Could add gzip compression
  strategies: {
    memory: true,
    disk: true,
    network: false,
  },
};

class ContentCache {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry<any>>;
  private memoryUsage: number;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.memoryCache = new Map();
    this.memoryUsage = 0;
    
    logger.debug('cache', 'Cache initialized', {
      enabled: this.config.enabled,
      strategies: this.config.strategies,
      directory: this.config.directory,
      ttl: this.config.defaultTTL,
    });
  }

  /**
   * Generate cache key from string
   */
  private generateKey(input: string): string {
    // Simple hash function - could use crypto.createHash for production
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if cache entry is valid
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < entry.ttl;
  }

  /**
   * Get cache file path
   */
  private getCacheFilePath(key: string): string {
    return join(this.config.directory, `${key}.json`);
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    if (!existsSync(this.config.directory)) {
      await mkdir(this.config.directory, { recursive: true });
      logger.debug('cache', 'Created cache directory', { directory: this.config.directory });
    }
  }

  /**
   * Get from memory cache
   */
  private getFromMemory<T>(key: string): CacheEntry<T> | null {
    if (!this.config.strategies.memory) return null;

    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (this.isValidEntry(entry)) {
      logger.cacheHit(`memory:${key}`, { age: Date.now() - entry.timestamp });
      return entry;
    } else {
      // Remove expired entry
      this.memoryCache.delete(key);
      logger.debug('cache', `Expired memory cache entry removed: ${key}`);
      return null;
    }
  }

  /**
   * Set to memory cache
   */
  private setToMemory<T>(key: string, entry: CacheEntry<T>): void {
    if (!this.config.strategies.memory) return;

    // Simple memory management - remove oldest entries if needed
    const entrySize = JSON.stringify(entry.data).length;
    const maxMemorySize = this.config.maxSize * 1024 * 1024 * 0.1; // 10% of max size for memory

    if (this.memoryUsage + entrySize > maxMemorySize) {
      this.cleanupMemoryCache();
    }

    this.memoryCache.set(key, entry);
    this.memoryUsage += entrySize;
    
    logger.cacheWrite(`memory:${key}`, { 
      size: entrySize, 
      totalMemoryUsage: this.memoryUsage 
    });
  }

  /**
   * Get from disk cache
   */
  private async getFromDisk<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.config.strategies.disk) return null;

    try {
      const filePath = this.getCacheFilePath(key);
      
      if (!existsSync(filePath)) return null;

      const content = await readFile(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(content);

      if (this.isValidEntry(entry)) {
        logger.cacheHit(`disk:${key}`, { 
          age: Date.now() - entry.timestamp,
          filePath 
        });
        
        // Promote to memory cache
        this.setToMemory(key, entry);
        
        return entry;
      } else {
        // Remove expired file
        await unlink(filePath);
        logger.debug('cache', `Expired disk cache entry removed: ${key}`);
        return null;
      }
    } catch (error: unknown) {
      logger.warn('cache', `Failed to read disk cache: ${key}`, { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Set to disk cache
   */
  private async setToDisk<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.config.strategies.disk) return;

    try {
      await this.ensureCacheDirectory();
      
      const filePath = this.getCacheFilePath(key);
      const content = JSON.stringify(entry, null, 2);
      
      await writeFile(filePath, content);
      
      logger.cacheWrite(`disk:${key}`, { 
        filePath,
        size: content.length 
      });
    } catch (error: unknown) {
      logger.warn('cache', `Failed to write disk cache: ${key}`, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Cleanup memory cache by removing oldest entries
   */
  private cleanupMemoryCache(): void {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.memoryCache.delete(key);
    }
    
    // Recalculate memory usage
    this.memoryUsage = 0;
    for (const [, entry] of this.memoryCache) {
      this.memoryUsage += JSON.stringify(entry.data).length;
    }
    
    logger.debug('cache', `Memory cache cleanup: removed ${toRemove} entries`, {
      remaining: this.memoryCache.size,
      memoryUsage: this.memoryUsage,
    });
  }

  /**
   * Get cached content
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      logger.debug('cache', 'Cache disabled, skipping get', { key });
      return null;
    }

    const hashedKey = this.generateKey(key);

    // Try memory cache first
    let entry = this.getFromMemory<T>(hashedKey);
    
    // Try disk cache if memory miss
    if (!entry) {
      entry = await this.getFromDisk<T>(hashedKey);
    }

    if (entry) {
      return entry.data;
    }

    logger.cacheMiss(key);
    return null;
  }

  /**
   * Set cached content
   */
  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      source?: string;
      metadata?: CacheEntry<T>['metadata'];
    } = {}
  ): Promise<void> {
    if (!this.config.enabled) {
      logger.debug('cache', 'Cache disabled, skipping set', { key });
      return;
    }

    const hashedKey = this.generateKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      source: options.source || 'unknown',
      metadata: options.metadata,
    };

    // Set to memory cache
    this.setToMemory(hashedKey, entry);

    // Set to disk cache
    await this.setToDisk(hashedKey, entry);
  }

  /**
   * Delete cached content
   */
  async delete(key: string): Promise<void> {
    const hashedKey = this.generateKey(key);

    // Remove from memory
    if (this.memoryCache.has(hashedKey)) {
      this.memoryCache.delete(hashedKey);
      logger.debug('cache', `Removed from memory cache: ${key}`);
    }

    // Remove from disk
    try {
      const filePath = this.getCacheFilePath(hashedKey);
      if (existsSync(filePath)) {
        await unlink(filePath);
        logger.debug('cache', `Removed from disk cache: ${key}`);
      }
    } catch (error: unknown) {
      logger.warn('cache', `Failed to remove disk cache: ${key}`, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.memoryUsage = 0;

    // Clear disk cache
    try {
      if (existsSync(this.config.directory)) {
        const files = await readFile(this.config.directory);
        // This would need proper directory reading and file deletion
        // Implementation depends on specific requirements
      }
    } catch (error: any) {
      logger.warn('cache', 'Failed to clear disk cache', { error: error.message });
    }

    logger.info('cache', 'Cache cleared');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memory: { entries: number; usage: number };
    disk: { entries: number; usage: number };
    config: CacheConfig;
  }> {
    let diskEntries = 0;
    let diskUsage = 0;

    try {
      if (existsSync(this.config.directory)) {
        // This would need proper directory reading
        // For now, just return approximate values
      }
    } catch (error: any) {
      logger.warn('cache', 'Failed to get disk cache stats', { error: error.message });
    }

    return {
      memory: {
        entries: this.memoryCache.size,
        usage: this.memoryUsage,
      },
      disk: {
        entries: diskEntries,
        usage: diskUsage,
      },
      config: this.config,
    };
  }

  /**
   * Check if cache is healthy
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    stats: any;
  }> {
    const issues: string[] = [];
    
    // Check if cache directory is writable
    try {
      await this.ensureCacheDirectory();
    } catch (error: any) {
      issues.push(`Cache directory not writable: ${error.message}`);
    }

    // Check memory usage
    const maxMemory = this.config.maxSize * 1024 * 1024 * 0.1;
    if (this.memoryUsage > maxMemory) {
      issues.push('Memory cache usage is too high');
    }

    const stats = await this.getStats();
    
    return {
      healthy: issues.length === 0,
      issues,
      stats,
    };
  }
}

// Create and export singleton cache instance
export const contentCache = new ContentCache();

// Specialized cache functions for different content types
export async function getCachedSiteContent(): Promise<SiteContent | null> {
  return contentCache.get<SiteContent>('site-content');
}

export async function setCachedSiteContent(
  content: SiteContent, 
  source: string,
  buildId?: string
): Promise<void> {
  await contentCache.set('site-content', content, {
    source,
    metadata: { buildId, version: '1.0' },
  });
}

export async function getCachedVentures(): Promise<any[] | null> {
  return contentCache.get<any[]>('ventures');
}

export async function setCachedVentures(ventures: unknown[]): Promise<void> {
  await contentCache.set('ventures', ventures, { source: 'notion' });
}

export async function getCachedCapabilities(): Promise<any[] | null> {
  return contentCache.get<any[]>('capabilities');
}

export async function setCachedCapabilities(capabilities: unknown[]): Promise<void> {
  await contentCache.set('capabilities', capabilities, { source: 'notion' });
}

// Utility function to wrap content fetching with caching
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<ContentFetchResult<T>>,
  options: { ttl?: number; source?: string } = {}
): Promise<ContentFetchResult<T>> {
  // Try to get from cache first
  const cached = await contentCache.get<T>(key);
  
  if (cached) {
    logger.cacheHit(key);
    return {
      data: cached,
      error: null,
      timestamp: new Date().toISOString(),
      source: 'cache',
    };
  }

  // Cache miss - fetch fresh data
  logger.cacheMiss(key);
  const result = await fetchFn();
  
  // Cache successful results
  if (result.data && !result.error) {
    await contentCache.set(key, result.data, {
      ttl: options.ttl,
      source: options.source || result.source,
    });
  }

  return result;
}