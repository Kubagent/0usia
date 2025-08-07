/**
 * Environment Configuration for Application Services
 * 
 * Centralized configuration management for all external service integrations
 * including Notion CMS and Mailchimp API
 * Provides validation, defaults, and environment-specific settings
 */

import { validateNotionEnvironment } from './fallback';

// Environment variable names
export const ENV_VARS = {
  // Notion Configuration
  NOTION_TOKEN: 'NOTION_TOKEN',
  NOTION_VENTURES_DB_ID: 'NOTION_VENTURES_DB_ID',
  NOTION_CAPABILITIES_DB_ID: 'NOTION_CAPABILITIES_DB_ID',
  NOTION_SITE_COPY_DB_ID: 'NOTION_SITE_COPY_DB_ID',
  NOTION_ASSETS_DB_ID: 'NOTION_ASSETS_DB_ID',
  NOTION_CACHE_ENABLED: 'NOTION_CACHE_ENABLED',
  NOTION_CACHE_TTL: 'NOTION_CACHE_TTL',
  NOTION_FALLBACK_ENABLED: 'NOTION_FALLBACK_ENABLED',
  NOTION_BUILD_VALIDATION: 'NOTION_BUILD_VALIDATION',
  
  // Mailchimp Configuration
  MAILCHIMP_API_KEY: 'MAILCHIMP_API_KEY',
  MAILCHIMP_SERVER: 'MAILCHIMP_SERVER',
  MAILCHIMP_AUDIENCE_ID: 'MAILCHIMP_AUDIENCE_ID',
  MAILCHIMP_CONTACT_LIST_ID: 'MAILCHIMP_CONTACT_LIST_ID',
  
  // Rate Limiting Configuration
  RATE_LIMIT_MAX_REQUESTS: 'RATE_LIMIT_MAX_REQUESTS',
  RATE_LIMIT_WINDOW_MS: 'RATE_LIMIT_WINDOW_MS',
  
  // Security Configuration
  ALLOWED_ORIGINS: 'ALLOWED_ORIGINS',
} as const;

// Configuration interfaces
export interface NotionConfig {
  // API Configuration
  token: string;
  databases: {
    ventures: string;
    capabilities: string;
    siteCopy: string;
    assets: string;
  };
  
  // Caching Configuration
  cache: {
    enabled: boolean;
    ttl: number; // Time to live in milliseconds
    directory: string;
  };
  
  // Fallback Configuration
  fallback: {
    enabled: boolean;
    autoSwitch: boolean; // Automatically switch to fallback on API errors
  };
  
  // Build Configuration
  build: {
    validation: boolean; // Validate content at build time
    failOnErrors: boolean; // Fail build on critical errors
    generateReport: boolean; // Generate build report
  };
  
  // Environment Information
  environment: 'development' | 'production' | 'test';
  isValidConfig: boolean;
}

export interface MailchimpConfig {
  apiKey: string;
  server: string;
  audienceId: string;
  contactListId?: string;
  isValidConfig: boolean;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface SecurityConfig {
  allowedOrigins: string[];
}

export interface AppConfig {
  notion: NotionConfig;
  mailchimp: MailchimpConfig;
  rateLimit: RateLimitConfig;
  security: SecurityConfig;
  environment: 'development' | 'production' | 'test';
}

/**
 * Load and validate Notion configuration from environment variables
 */
export function loadNotionConfig(): NotionConfig {
  const env = process.env;
  const nodeEnv = env.NODE_ENV as 'development' | 'production' | 'test' || 'development';
  
  // Validate environment
  const validation = validateNotionEnvironment();
  
  const config: NotionConfig = {
    // API Configuration
    token: env[ENV_VARS.NOTION_TOKEN] || '',
    databases: {
      ventures: env[ENV_VARS.NOTION_VENTURES_DB_ID] || '',
      capabilities: env[ENV_VARS.NOTION_CAPABILITIES_DB_ID] || '',
      siteCopy: env[ENV_VARS.NOTION_SITE_COPY_DB_ID] || '',
      assets: env[ENV_VARS.NOTION_ASSETS_DB_ID] || '',
    },
    
    // Caching Configuration
    cache: {
      enabled: env[ENV_VARS.NOTION_CACHE_ENABLED] === 'true' || nodeEnv === 'production',
      ttl: parseInt(env[ENV_VARS.NOTION_CACHE_TTL] || '3600000'), // 1 hour default
      directory: '.next/cache/notion',
    },
    
    // Fallback Configuration
    fallback: {
      enabled: env[ENV_VARS.NOTION_FALLBACK_ENABLED] !== 'false', // Default: true
      autoSwitch: nodeEnv === 'production', // Auto-switch in production
    },
    
    // Build Configuration
    build: {
      validation: env[ENV_VARS.NOTION_BUILD_VALIDATION] !== 'false', // Default: true
      failOnErrors: nodeEnv === 'production',
      generateReport: env[ENV_VARS.NOTION_BUILD_VALIDATION] === 'true' || nodeEnv === 'development',
    },
    
    // Environment Information
    environment: nodeEnv,
    isValidConfig: validation.isValid,
  };
  
  return config;
}

/**
 * Load and validate Mailchimp configuration from environment variables
 */
export function loadMailchimpConfig(): MailchimpConfig {
  const env = process.env;
  
  const config: MailchimpConfig = {
    apiKey: env[ENV_VARS.MAILCHIMP_API_KEY] || '',
    server: env[ENV_VARS.MAILCHIMP_SERVER] || '',
    audienceId: env[ENV_VARS.MAILCHIMP_AUDIENCE_ID] || '',
    contactListId: env[ENV_VARS.MAILCHIMP_CONTACT_LIST_ID] || undefined,
    isValidConfig: false,
  };
  
  // Validate Mailchimp configuration
  // Allow placeholder values during build
  const hasPlaceholders = config.apiKey === 'placeholder-key' ||
                         config.server === 'placeholder-server' ||
                         config.audienceId === 'placeholder-audience-id';
  
  config.isValidConfig = hasPlaceholders || !!(
    config.apiKey &&
    config.server &&
    config.audienceId &&
    config.apiKey.includes('-') &&
    config.server.length > 0
  );
  
  return config;
}

/**
 * Load rate limiting configuration
 */
export function loadRateLimitConfig(): RateLimitConfig {
  const env = process.env;
  
  return {
    maxRequests: parseInt(env[ENV_VARS.RATE_LIMIT_MAX_REQUESTS] || '10'),
    windowMs: parseInt(env[ENV_VARS.RATE_LIMIT_WINDOW_MS] || '60000'), // 1 minute default
  };
}

/**
 * Load security configuration
 */
export function loadSecurityConfig(): SecurityConfig {
  const env = process.env;
  const allowedOrigins = env[ENV_VARS.ALLOWED_ORIGINS] || 'localhost:3000,*.ovsia.com';
  
  return {
    allowedOrigins: allowedOrigins.split(',').map(origin => origin.trim()),
  };
}

/**
 * Load complete application configuration
 */
export function loadAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development';
  
  return {
    notion: loadNotionConfig(),
    mailchimp: loadMailchimpConfig(),
    rateLimit: loadRateLimitConfig(),
    security: loadSecurityConfig(),
    environment: nodeEnv,
  };
}

/**
 * Get configuration with validation and warnings
 */
export function getNotionConfig(): {
  config: NotionConfig;
  warnings: string[];
  errors: string[];
} {
  const config = loadNotionConfig();
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Validate configuration
  if (!config.isValidConfig) {
    const validation = validateNotionEnvironment();
    errors.push(...validation.missingVars.map(v => `Missing environment variable: ${v}`));
    warnings.push(...validation.warnings);
  }
  
  // Additional validation
  if (config.cache.ttl < 60000) { // Less than 1 minute
    warnings.push('Cache TTL is very short, consider increasing for better performance');
  }
  
  if (config.environment === 'production' && !config.fallback.enabled) {
    warnings.push('Fallback is disabled in production, consider enabling for reliability');
  }
  
  if (!config.token && config.environment === 'production') {
    errors.push('Notion token is required in production');
  }
  
  // Database ID validation
  Object.entries(config.databases).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Database ID for ${key} is missing`);
    } else if (value.length !== 32 || !/^[a-f0-9]+$/i.test(value.replace(/-/g, ''))) {
      warnings.push(`Database ID for ${key} does not appear to be valid`);
    }
  });
  
  return { config, warnings, errors };
}

/**
 * Environment-specific configuration presets
 */
export const CONFIG_PRESETS = {
  development: {
    cache: { enabled: false, ttl: 300000 }, // 5 minutes
    fallback: { enabled: true, autoSwitch: true },
    build: { validation: true, failOnErrors: false, generateReport: true },
  },
  
  production: {
    cache: { enabled: true, ttl: 3600000 }, // 1 hour
    fallback: { enabled: true, autoSwitch: true },
    build: { validation: true, failOnErrors: true, generateReport: false },
  },
  
  test: {
    cache: { enabled: false, ttl: 0 },
    fallback: { enabled: true, autoSwitch: true },
    build: { validation: false, failOnErrors: false, generateReport: false },
  },
};

/**
 * Apply environment preset to configuration
 */
export function applyConfigPreset(config: NotionConfig): NotionConfig {
  const preset = CONFIG_PRESETS[config.environment];
  
  return {
    ...config,
    cache: { ...config.cache, ...preset.cache },
    fallback: { ...config.fallback, ...preset.fallback },
    build: { ...config.build, ...preset.build },
  };
}

/**
 * Create sample environment file content
 */
export function generateEnvSample(): string {
  return `# Notion CMS Configuration
# Copy this to .env.local and fill in your actual values

# Notion API Token (required)
# Get this from https://www.notion.com/my-integrations
NOTION_TOKEN=secret_your_notion_integration_token_here

# Notion Database IDs (required)
# Copy these from your Notion database URLs
NOTION_VENTURES_DB_ID=your_ventures_database_id_here
NOTION_CAPABILITIES_DB_ID=your_capabilities_database_id_here  
NOTION_SITE_COPY_DB_ID=your_site_copy_database_id_here
NOTION_ASSETS_DB_ID=your_assets_database_id_here

# Optional Configuration
# NOTION_CACHE_ENABLED=true           # Enable content caching (default: true in production)
# NOTION_CACHE_TTL=3600000            # Cache time-to-live in milliseconds (default: 1 hour)
# NOTION_FALLBACK_ENABLED=true        # Enable fallback content (default: true)
# NOTION_BUILD_VALIDATION=true        # Validate content at build time (default: true)

# Development vs Production Notes:
# - Development: Cache disabled, detailed logging, reports generated
# - Production: Cache enabled, fallback auto-switch, build fails on errors
# - Test: All features disabled for consistent testing
`;
}

/**
 * Validate configuration at runtime
 */
export function validateRuntimeConfig(config: NotionConfig): {
  canFetchFromNotion: boolean;
  canUseCache: boolean;
  canUseFallback: boolean;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  const canFetchFromNotion = !!(config.token && 
    config.databases.ventures && 
    config.databases.capabilities && 
    config.databases.siteCopy);
  
  const canUseCache = config.cache.enabled && 
    config.environment !== 'test';
  
  const canUseFallback = config.fallback.enabled;
  
  if (!canFetchFromNotion && !canUseFallback) {
    recommendations.push('Enable fallback content to ensure site functionality');
  }
  
  if (config.environment === 'production' && !canUseCache) {
    recommendations.push('Enable caching in production for better performance');
  }
  
  if (!canFetchFromNotion) {
    recommendations.push('Complete Notion configuration to fetch live content');
  }
  
  return {
    canFetchFromNotion,
    canUseCache,
    canUseFallback,
    recommendations,
  };
}

/**
 * Log configuration status
 */
export function logConfigStatus(config: NotionConfig): void {
  console.log('=== Notion CMS Configuration ===');
  console.log(`Environment: ${config.environment}`);
  console.log(`Valid Config: ${config.isValidConfig}`);
  console.log(`Token Configured: ${!!config.token}`);
  console.log(`Cache Enabled: ${config.cache.enabled}`);
  console.log(`Fallback Enabled: ${config.fallback.enabled}`);
  
  const runtime = validateRuntimeConfig(config);
  console.log(`Can Fetch from Notion: ${runtime.canFetchFromNotion}`);
  console.log(`Can Use Cache: ${runtime.canUseCache}`);
  console.log(`Can Use Fallback: ${runtime.canUseFallback}`);
  
  if (runtime.recommendations.length > 0) {
    console.log('Recommendations:', runtime.recommendations);
  }
}

/**
 * Export configuration instances
 */
export const notionConfig = loadNotionConfig();
export const mailchimpConfig = loadMailchimpConfig();
export const appConfig = loadAppConfig();

// Main configuration export for convenience
export const env = {
  ...process.env,
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || '',
  MAILCHIMP_SERVER: process.env.MAILCHIMP_SERVER || '',
  MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID || '',
  MAILCHIMP_CONTACT_LIST_ID: process.env.MAILCHIMP_CONTACT_LIST_ID || '',
};