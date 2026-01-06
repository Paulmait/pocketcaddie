/**
 * Security Configuration
 * Centralized security settings for the SliceFix app
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  // Analysis requests per hour
  ANALYSIS_PER_HOUR: 10,
  // Login attempts before lockout
  LOGIN_ATTEMPTS: 5,
  // Lockout duration in minutes
  LOCKOUT_DURATION: 15,
  // Max video upload size in bytes (100MB)
  MAX_VIDEO_SIZE: 100 * 1024 * 1024,
  // Max video duration in seconds
  MAX_VIDEO_DURATION: 15,
};

// Content Security
export const CONTENT_SECURITY = {
  // Allowed video MIME types
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-m4v'],
  // Allowed image MIME types for profile pictures
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  // Max file name length
  MAX_FILENAME_LENGTH: 255,
};

// Privacy settings
export const PRIVACY_CONFIG = {
  // Video retention period in hours
  VIDEO_RETENTION_HOURS: 24,
  // Analysis data retention in days
  ANALYSIS_RETENTION_DAYS: 365,
  // Anonymization threshold (number of users before aggregate stats shown)
  ANONYMIZATION_THRESHOLD: 100,
};

// Authentication security
export const AUTH_CONFIG = {
  // Session timeout in milliseconds (30 days)
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000,
  // OTP expiration in seconds
  OTP_EXPIRATION: 300,
  // Minimum password length (for future email/password auth)
  MIN_PASSWORD_LENGTH: 8,
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') return 'file';
  return filename
    .replace(/[^a-zA-Z0-9.-_]/g, '_') // Only allow safe characters
    .substring(0, CONTENT_SECURITY.MAX_FILENAME_LENGTH);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidVideoType = (mimeType: string): boolean => {
  return CONTENT_SECURITY.ALLOWED_VIDEO_TYPES.includes(mimeType);
};

// Log security events (without exposing sensitive data)
export const logSecurityEvent = (event: string, metadata?: Record<string, any>): void => {
  // Remove any sensitive data from metadata
  const safeMeta = metadata ? { ...metadata } : {};
  delete safeMeta.password;
  delete safeMeta.token;
  delete safeMeta.apiKey;
  delete safeMeta.secret;

  console.log(`[SECURITY] ${event}`, safeMeta);
};
