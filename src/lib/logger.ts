/**
 * Comprehensive Logging System for Notion CMS
 * 
 * Provides structured logging with different levels, context, and formatting
 * Integrates with error tracking and performance monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'notion' | 'content' | 'build' | 'cache' | 'fallback' | 'performance' | 'validation';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  error?: Error;
  buildId?: string;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  contextColors: Record<LogContext, string>;
  formatters: {
    console: (entry: LogEntry) => string;
    file: (entry: LogEntry) => string;
    remote: (entry: LogEntry) => any;
  };
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableConsole: true,
  enableFile: false, // Could be enabled for production logging
  enableRemote: false, // Could integrate with services like LogRocket, Sentry
  contextColors: {
    notion: '\x1b[36m', // Cyan
    content: '\x1b[32m', // Green
    build: '\x1b[33m', // Yellow
    cache: '\x1b[35m', // Magenta
    fallback: '\x1b[31m', // Red
    performance: '\x1b[34m', // Blue
    validation: '\x1b[37m', // White
  },
  formatters: {
    console: (entry) => {
      const color = DEFAULT_CONFIG.contextColors[entry.context] || '\x1b[0m';
      const reset = '\x1b[0m';
      const levelUpper = entry.level.toUpperCase().padEnd(5);
      const contextUpper = entry.context.toUpperCase().padEnd(11);
      
      let output = `${color}[${levelUpper}] [${contextUpper}]${reset} ${entry.message}`;
      
      if (entry.data) {
        output += `\n${color}Data:${reset} ${JSON.stringify(entry.data, null, 2)}`;
      }
      
      if (entry.error) {
        output += `\n${color}Error:${reset} ${entry.error.message}`;
        if (entry.error.stack && process.env.NODE_ENV === 'development') {
          output += `\n${color}Stack:${reset} ${entry.error.stack}`;
        }
      }
      
      return output;
    },
    file: (entry) => JSON.stringify(entry),
    remote: (entry) => entry,
  },
};

class Logger {
  private config: LoggerConfig;
  private buildId?: string;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.buildId = process.env.BUILD_ID || undefined;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private createEntry(
    level: LogLevel,
    context: LogContext,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
      error,
      buildId: this.buildId,
      sessionId: this.sessionId,
    };
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // Console logging
    if (this.config.enableConsole) {
      const formatted = this.config.formatters.console(entry);
      
      switch (entry.level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          break;
      }
    }

    // File logging (if enabled)
    if (this.config.enableFile) {
      // Implementation would write to file system
      // This is typically done server-side only
    }

    // Remote logging (if enabled)
    if (this.config.enableRemote) {
      // Implementation would send to remote logging service
      // e.g., Sentry, LogRocket, DataDog, etc.
    }
  }

  debug(context: LogContext, message: string, data?: any): void {
    const entry = this.createEntry('debug', context, message, data);
    this.writeLog(entry);
  }

  info(context: LogContext, message: string, data?: any): void {
    const entry = this.createEntry('info', context, message, data);
    this.writeLog(entry);
  }

  warn(context: LogContext, message: string, data?: any, error?: Error): void {
    const entry = this.createEntry('warn', context, message, data, error);
    this.writeLog(entry);
  }

  error(context: LogContext, message: string, data?: any, error?: Error): void {
    const entry = this.createEntry('error', context, message, data, error);
    this.writeLog(entry);
  }

  // Specialized logging methods for common use cases
  notionApiCall(operation: string, data?: any): void {
    this.debug('notion', `API call: ${operation}`, data);
  }

  notionApiError(operation: string, error: Error, data?: any): void {
    this.error('notion', `API error: ${operation}`, data, error);
  }

  contentFetch(source: string, count: number, data?: any): void {
    this.info('content', `Fetched content from ${source}`, { count, ...data });
  }

  contentFallback(reason: string, data?: any): void {
    this.warn('fallback', `Using fallback content: ${reason}`, data);
  }

  buildStart(buildId: string): void {
    this.buildId = buildId;
    this.info('build', `Build started: ${buildId}`);
  }

  buildComplete(buildId: string, duration: number, data?: any): void {
    this.info('build', `Build completed: ${buildId}`, { duration, ...data });
  }

  buildError(buildId: string, error: Error, data?: any): void {
    this.error('build', `Build failed: ${buildId}`, data, error);
  }

  cacheHit(key: string, data?: any): void {
    this.debug('cache', `Cache hit: ${key}`, data);
  }

  cacheMiss(key: string, data?: any): void {
    this.debug('cache', `Cache miss: ${key}`, data);
  }

  cacheWrite(key: string, data?: any): void {
    this.debug('cache', `Cache write: ${key}`, data);
  }

  performanceMetric(metric: string, duration: number, data?: any): void {
    this.debug('performance', `${metric}: ${duration}ms`, data);
  }

  validationError(type: string, errors: string[], data?: any): void {
    this.warn('validation', `Validation failed: ${type}`, { errors, ...data });
  }

  validationWarning(type: string, warnings: string[], data?: any): void {
    this.debug('validation', `Validation warnings: ${type}`, { warnings, ...data });
  }

  // Method to create child logger with different config
  child(config: Partial<LoggerConfig>): Logger {
    return new Logger({ ...this.config, ...config });
  }

  // Method to get current session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Method to set build ID
  setBuildId(buildId: string): void {
    this.buildId = buildId;
  }
}

// Create and export singleton logger instance
export const logger = new Logger();

// Export factory function for creating specialized loggers
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger(config);
}

// Export specialized loggers for different contexts
export const notionLogger = logger.child({
  contextColors: { ...DEFAULT_CONFIG.contextColors, notion: '\x1b[96m' } // Bright cyan
});

export const buildLogger = logger.child({
  contextColors: { ...DEFAULT_CONFIG.contextColors, build: '\x1b[93m' } // Bright yellow
});

export const performanceLogger = logger.child({
  level: 'debug', // Always show performance logs in development
  contextColors: { ...DEFAULT_CONFIG.contextColors, performance: '\x1b[94m' } // Bright blue
});

// Utility functions for common logging patterns
export function logNotionOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    logger.notionApiCall(operation);
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      logger.performanceMetric(`notion.${operation}`, duration);
      resolve(result);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.notionApiError(operation, error, { duration });
      reject(error);
    }
  });
}

export function logBuildOperation<T>(
  operation: string,
  buildId: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    logger.setBuildId(buildId);
    logger.info('build', `Starting ${operation}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      logger.buildComplete(buildId, duration, { operation });
      resolve(result);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.buildError(buildId, error, { operation, duration });
      reject(error);
    }
  });
}