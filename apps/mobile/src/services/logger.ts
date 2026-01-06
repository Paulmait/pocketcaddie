/**
 * Production-Safe Logger for SliceFix AI
 *
 * Features:
 * - Log levels (debug, info, warn, error)
 * - PII stripping in production
 * - Structured logging
 * - Crashlytics-ready error reporting
 */

import { Platform } from 'react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

// Patterns to detect and redact PII
const PII_PATTERNS = [
  /\b[\w.-]+@[\w.-]+\.\w{2,}\b/gi, // Email
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card
  /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, // SSN
  /\b\d{10,11}\b/g, // Phone numbers
  /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*/gi, // JWT tokens
];

// Keys that should always be redacted
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'credential',
  'ssn',
  'creditCard',
  'credit_card',
];

class Logger {
  private isDev = __DEV__;
  private minLevel: LogLevel = this.isDev ? 'debug' : 'warn';

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  /**
   * Strip PII from a string
   */
  private stripPII(value: string): string {
    let cleaned = value;
    for (const pattern of PII_PATTERNS) {
      cleaned = cleaned.replace(pattern, '[REDACTED]');
    }
    return cleaned;
  }

  /**
   * Recursively sanitize an object
   */
  private sanitize(obj: unknown, depth = 0): unknown {
    if (depth > 5) return '[MAX_DEPTH]';

    if (typeof obj === 'string') {
      return this.isDev ? obj : this.stripPII(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(value, depth + 1);
        }
      }
      return sanitized;
    }

    return String(obj);
  }

  /**
   * Format error for logging
   */
  private formatError(error: Error): Record<string, string> {
    return {
      name: error.name,
      message: this.isDev ? error.message : this.stripPII(error.message),
      stack: this.isDev ? (error.stack || '').substring(0, 1000) : '[STACK_HIDDEN]',
    };
  }

  /**
   * Create a log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message: this.isDev ? message : this.stripPII(message),
      timestamp: new Date().toISOString(),
      context: context ? (this.sanitize(context) as Record<string, unknown>) : undefined,
      error: error ? (this.formatError(error) as unknown as Error) : undefined,
    };
  }

  /**
   * Check if should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  /**
   * Output the log
   */
  private output(entry: LogEntry): void {
    const { level, message, context, error, timestamp } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.log(prefix, message, context || '');
        break;
      case 'info':
        console.info(prefix, message, context || '');
        break;
      case 'warn':
        console.warn(prefix, message, context || '');
        break;
      case 'error':
        console.error(prefix, message, context || '', error || '');
        break;
    }
  }

  /**
   * Debug level log (dev only)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.createEntry('debug', message, context);
    this.output(entry);
  }

  /**
   * Info level log (dev only by default)
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    const entry = this.createEntry('info', message, context);
    this.output(entry);
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.createEntry('warn', message, context);
    this.output(entry);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    const entry = this.createEntry('error', message, context, error);
    this.output(entry);

    // In production, send to crash reporting
    if (!this.isDev && error) {
      this.reportToCrashlytics(entry);
    }
  }

  /**
   * Report error to crashlytics (placeholder)
   */
  private reportToCrashlytics(entry: LogEntry): void {
    // TODO: Integrate with Sentry, Crashlytics, or Bugsnag
    // For now, just ensure we have the error logged
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Create a child logger with preset context
   */
  child(baseContext: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, baseContext);
  }
}

/**
 * Child logger with preset context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private baseContext: Record<string, unknown>
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.baseContext, ...context });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.baseContext, ...context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.baseContext, ...context });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.parent.error(message, error, { ...this.baseContext, ...context });
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    logger.error(message, error, context),
};
