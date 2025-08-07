/**
 * Rate Limiting Middleware
 * 
 * Implements rate limiting for API endpoints to prevent spam and abuse.
 * Uses an in-memory store for development and supports Redis for production.
 * 
 * Features:
 * - IP-based and email-based rate limiting
 * - Configurable windows and limits
 * - Different limits for different endpoints
 * - GDPR-compliant logging
 * - TypeScript support
 */

import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from './env-config';

// Rate limit store interface
interface RateLimitStore {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttlMs: number): Promise<void>;
  increment(key: string, ttlMs: number): Promise<number>;
  delete(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

// In-memory store for development
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { value: number; expires: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: number, ttlMs: number): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + ttlMs,
    });
  }

  async increment(key: string, ttlMs: number): Promise<number> {
    const current = await this.get(key);
    const newValue = (current || 0) + 1;
    await this.set(key, newValue, ttlMs);
    return newValue;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: NextRequest, key: string) => void;
  message?: string;
  headers?: boolean;
}

// Predefined rate limit configs
export const RATE_LIMIT_CONFIGS = {
  // Contact form: 5 submissions per 15 minutes per IP
  CONTACT_FORM: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req: NextRequest) => {
      const ip = getClientIP(req);
      return `contact_form_${ip}`;
    },
    message: 'Too many contact form submissions. Please try again in 15 minutes.',
    headers: true,
  },

  // Newsletter: 3 subscriptions per hour per IP
  NEWSLETTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: (req: NextRequest) => {
      const ip = getClientIP(req);
      return `newsletter_${ip}`;
    },
    message: 'Too many newsletter subscription attempts. Please try again later.',
    headers: true,
  },

  // Email-based limiting: 2 submissions per email per hour
  EMAIL_BASED: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 2,
    keyGenerator: (req: NextRequest, email?: string) => {
      if (email) {
        return `email_${email.toLowerCase()}`;
      }
      const ip = getClientIP(req);
      return `no_email_${ip}`;
    },
    message: 'This email has been used too recently. Please try again later.',
    headers: false, // Don't expose email-based limits in headers
  },

  // Global API rate limit: 100 requests per hour per IP
  GLOBAL_API: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    keyGenerator: (req: NextRequest) => {
      const ip = getClientIP(req);
      return `api_${ip}`;
    },
    message: 'API rate limit exceeded. Please try again later.',
    headers: true,
  },
} as const;

// Singleton store instance
let storeInstance: RateLimitStore | null = null;

function getStore(): RateLimitStore {
  if (!storeInstance) {
    // In production, you might want to use Redis
    // For now, using in-memory store
    storeInstance = new MemoryStore();
  }
  return storeInstance;
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: NextRequest): string {
  // Check for forwarded IP (when behind proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Check for real IP
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Fallback to localhost
  return '127.0.0.1';
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given key
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const store = getStore();
  
  try {
    const current = await store.increment(key, config.windowMs);
    const remaining = Math.max(0, config.maxRequests - current);
    const resetTime = Date.now() + config.windowMs;
    
    const result: RateLimitResult = {
      allowed: current <= config.maxRequests,
      limit: config.maxRequests,
      remaining,
      resetTime,
    };

    if (!result.allowed) {
      result.retryAfter = Math.ceil(config.windowMs / 1000);
    }

    return result;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
}

/**
 * Create rate limit middleware for API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator(req);
    const result = await checkRateLimit(key, config);

    // Add rate limit headers if enabled
    const headers: Record<string, string> = {};
    if (config.headers) {
      headers['X-RateLimit-Limit'] = config.maxRequests.toString();
      headers['X-RateLimit-Remaining'] = result.remaining.toString();
      headers['X-RateLimit-Reset'] = Math.ceil(result.resetTime / 1000).toString();
    }

    if (!result.allowed) {
      // Call onLimitReached callback if provided
      if (config.onLimitReached) {
        config.onLimitReached(req, key);
      }

      // Add retry-after header
      if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
      }

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Rate limit passed, continue with request
    // Return null to indicate middleware should continue
    return null;
  };
}

/**
 * Combined rate limit check for multiple limits
 */
export async function checkMultipleRateLimits(
  req: NextRequest,
  configs: Array<{ name: string; config: RateLimitConfig; email?: string }>
): Promise<{ allowed: boolean; failedCheck?: string; response?: NextResponse }> {
  for (const { name, config, email } of configs) {
    const key = email && config.keyGenerator.length > 1 
      ? (config.keyGenerator as any)(req, email)
      : config.keyGenerator(req);
    
    const result = await checkRateLimit(key, config);
    
    if (!result.allowed) {
      const headers: Record<string, string> = {};
      
      if (config.headers) {
        headers['X-RateLimit-Limit'] = config.maxRequests.toString();
        headers['X-RateLimit-Remaining'] = '0';
        headers['X-RateLimit-Reset'] = Math.ceil(result.resetTime / 1000).toString();
      }

      if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
      }

      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests',
          type: name,
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers,
        }
      );

      return {
        allowed: false,
        failedCheck: name,
        response,
      };
    }
  }

  return { allowed: true };
}

/**
 * Utility to manually reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<void> {
  const store = getStore();
  await store.delete(key);
}

/**
 * Utility to get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const store = getStore();
  const current = await store.get(key) || 0;
  const remaining = Math.max(0, config.maxRequests - current);
  const resetTime = Date.now() + config.windowMs;

  return {
    allowed: current < config.maxRequests,
    limit: config.maxRequests,
    remaining,
    resetTime,
    retryAfter: current >= config.maxRequests ? Math.ceil(config.windowMs / 1000) : undefined,
  };
}

/**
 * Cleanup function for graceful shutdown
 */
export async function cleanupRateLimit(): Promise<void> {
  if (storeInstance && 'destroy' in storeInstance) {
    (storeInstance as MemoryStore).destroy();
  }
  storeInstance = null;
}

/**
 * Log rate limit events (GDPR compliant - no personal data)
 */
export function logRateLimitEvent(
  event: 'hit' | 'exceeded',
  endpoint: string,
  ip: string,
  userAgent?: string
): void {
  // Hash IP for privacy (server-side only)
  let hashedIP = 'unknown';
  if (typeof window === 'undefined') {
    const crypto = require('crypto');
    hashedIP = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 8);
  }
  
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    endpoint,
    hashedIP,
    userAgent: userAgent ? userAgent.substring(0, 100) : undefined, // Truncate user agent
  };

  console.log('Rate limit event:', JSON.stringify(logData));
}

// Export commonly used configurations
export const contactFormRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.CONTACT_FORM);
export const newsletterRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.NEWSLETTER);
export const globalApiRateLimit = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.GLOBAL_API);