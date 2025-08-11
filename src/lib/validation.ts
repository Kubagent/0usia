/**
 * Form Validation Utilities
 * 
 * Comprehensive validation library for contact forms and newsletter subscriptions
 * with TypeScript support and GDPR compliance validation.
 * 
 * Features:
 * - Client and server-side validation
 * - GDPR consent validation
 * - File upload validation
 * - Email format validation
 * - Rate limiting validation
 * - Sanitization utilities
 */

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface ContactFormValidationData {
  name: string;
  email: string;
  company?: string;
  message: string;
  gdprConsent: boolean;
  marketingConsent?: boolean;
  file?: File | null;
}

export interface NewsletterValidationData {
  email: string;
  firstName?: string;
  lastName?: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
  source?: string;
}

// Validation rules configuration
export interface ValidationRules {
  email: {
    required: boolean;
    pattern: RegExp;
    maxLength: number;
  };
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
  };
  message: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  company: {
    required: boolean;
    maxLength: number;
  };
  file: {
    maxSize: number; // in bytes
    allowedTypes: string[];
    required: boolean;
  };
  gdpr: {
    required: boolean;
  };
}

// Default validation rules
export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254, // RFC 5321 limit
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s\-'\.]+$/, // Allow letters, spaces, hyphens, apostrophes, dots
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000,
  },
  company: {
    required: false,
    maxLength: 100,
  },
  file: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    required: false,
  },
  gdpr: {
    required: true,
  },
};

/**
 * Validate email address format and deliverability hints
 */
export function validateEmail(email: string, rules = DEFAULT_VALIDATION_RULES.email): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!email && rules.required) {
    errors.email = 'Email address is required';
    return { isValid: false, errors, warnings };
  }

  if (!email) {
    return { isValid: true, errors: {}, warnings };
  }

  // Length check
  if (email.length > rules.maxLength) {
    errors.email = `Email address is too long (maximum ${rules.maxLength} characters)`;
  }

  // Format validation
  if (!rules.pattern.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Additional checks for common issues
  if (email.includes('..')) {
    errors.email = 'Email address cannot contain consecutive dots';
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    errors.email = 'Email address cannot start or end with a dot';
  }

  // Warnings for potentially problematic emails
  if (email.includes('+')) {
    warnings.email = 'Email contains a plus sign - please verify this is correct';
  }

  const domain = email.split('@')[1];
  if (domain && domain.includes('localhost')) {
    warnings.email = 'Local domain detected - this may not receive emails';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate person name
 */
export function validateName(name: string, rules = DEFAULT_VALIDATION_RULES.name): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name && rules.required) {
    errors.name = 'Name is required';
    return { isValid: false, errors };
  }

  if (!name && !rules.required) {
    return { isValid: true, errors: {} };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < rules.minLength) {
    errors.name = `Name must be at least ${rules.minLength} characters long`;
  }

  if (trimmedName.length > rules.maxLength) {
    errors.name = `Name is too long (maximum ${rules.maxLength} characters)`;
  }

  if (!rules.pattern.test(trimmedName)) {
    errors.name = 'Name contains invalid characters';
  }

  // Check for suspicious patterns
  if (/^\s*$/.test(name)) {
    errors.name = 'Name cannot be empty or contain only spaces';
  }

  if (/\d{3,}/.test(name)) {
    errors.name = 'Name cannot contain long sequences of numbers';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate message content
 */
export function validateMessage(message: string, rules = DEFAULT_VALIDATION_RULES.message): ValidationResult {
  const errors: Record<string, string> = {};

  if (!message && rules.required) {
    errors.message = 'Message is required';
    return { isValid: false, errors };
  }

  if (!message && !rules.required) {
    return { isValid: true, errors: {} };
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length < rules.minLength) {
    errors.message = `Message must be at least ${rules.minLength} characters long`;
  }

  if (trimmedMessage.length > rules.maxLength) {
    errors.message = `Message is too long (maximum ${rules.maxLength} characters)`;
  }

  // Check for spam-like patterns
  const urlCount = (message.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 3) {
    errors.message = 'Message contains too many URLs';
  }

  const uppercaseRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (uppercaseRatio > 0.5 && message.length > 20) {
    errors.message = 'Message contains too many uppercase letters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate company name
 */
export function validateCompany(company: string, rules = DEFAULT_VALIDATION_RULES.company): ValidationResult {
  const errors: Record<string, string> = {};

  if (!company && rules.required) {
    errors.company = 'Company name is required';
    return { isValid: false, errors };
  }

  if (!company && !rules.required) {
    return { isValid: true, errors: {} };
  }

  const trimmedCompany = company.trim();

  if (trimmedCompany.length > rules.maxLength) {
    errors.company = `Company name is too long (maximum ${rules.maxLength} characters)`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File | null, rules = DEFAULT_VALIDATION_RULES.file): ValidationResult {
  const errors: Record<string, string> = {};

  if (!file && rules.required) {
    errors.file = 'File is required';
    return { isValid: false, errors };
  }

  if (!file && !rules.required) {
    return { isValid: true, errors: {} };
  }

  if (file) {
    // Size validation
    if (file.size > rules.maxSize) {
      const maxSizeMB = Math.round(rules.maxSize / 1024 / 1024);
      errors.file = `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Type validation
    if (!rules.allowedTypes.includes(file.type)) {
      errors.file = 'File type not allowed. Please upload PDF, DOC, TXT, or image files';
    }

    // Additional security checks
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.file = 'File name contains invalid characters';
    }

    // Check for potentially dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      errors.file = 'File type not allowed for security reasons';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate GDPR consent
 */
export function validateGDPRConsent(consent: boolean, rules = DEFAULT_VALIDATION_RULES.gdpr): ValidationResult {
  const errors: Record<string, string> = {};

  if (!consent && rules.required) {
    errors.gdprConsent = 'You must accept the privacy policy to continue';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate complete contact form data
 */
export function validateContactForm(data: ContactFormValidationData, customRules?: Partial<ValidationRules>): ValidationResult {
  const rules = { ...DEFAULT_VALIDATION_RULES, ...customRules };
  const allErrors: Record<string, string> = {};
  const allWarnings: Record<string, string> = {};

  // Validate each field
  const emailResult = validateEmail(data.email, rules.email);
  const nameResult = validateName(data.name, rules.name);
  const messageResult = validateMessage(data.message, rules.message);
  const companyResult = validateCompany(data.company || '', rules.company);
  const fileResult = validateFile(data.file || null, rules.file);
  const gdprResult = validateGDPRConsent(data.gdprConsent, rules.gdpr);

  // Combine all errors
  Object.assign(allErrors, emailResult.errors, nameResult.errors, messageResult.errors, 
                companyResult.errors, fileResult.errors, gdprResult.errors);

  // Combine all warnings
  if (emailResult.warnings) Object.assign(allWarnings, emailResult.warnings);

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    warnings: Object.keys(allWarnings).length > 0 ? allWarnings : undefined,
  };
}

/**
 * Validate newsletter subscription data
 */
export function validateNewsletterSubscription(data: NewsletterValidationData, customRules?: Partial<ValidationRules>): ValidationResult {
  const rules = { ...DEFAULT_VALIDATION_RULES, ...customRules };
  const allErrors: Record<string, string> = {};
  const allWarnings: Record<string, string> = {};

  // Validate email (required for newsletter)
  const emailResult = validateEmail(data.email, rules.email);
  Object.assign(allErrors, emailResult.errors);
  if (emailResult.warnings) Object.assign(allWarnings, emailResult.warnings);

  // Validate optional name fields
  if (data.firstName) {
    const firstNameResult = validateName(data.firstName, { ...rules.name, required: false });
    if (firstNameResult.errors.name) {
      allErrors.firstName = firstNameResult.errors.name;
    }
  }

  if (data.lastName) {
    const lastNameResult = validateName(data.lastName, { ...rules.name, required: false });
    if (lastNameResult.errors.name) {
      allErrors.lastName = lastNameResult.errors.name;
    }
  }

  // Validate GDPR consent (required for newsletter)
  const gdprResult = validateGDPRConsent(data.gdprConsent, rules.gdpr);
  Object.assign(allErrors, gdprResult.errors);

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    warnings: Object.keys(allWarnings).length > 0 ? allWarnings : undefined,
  };
}

/**
 * Sanitize string input to prevent XSS and other issues
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@.\-_+]/g, '') // Only allow valid email characters
    .slice(0, 254); // RFC limit
}

/**
 * Check if request is potentially spam based on patterns
 */
export function detectSpamPatterns(data: ContactFormValidationData): { isSpam: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for suspicious patterns in message
  const message = data.message.toLowerCase();
  const spamKeywords = ['viagra', 'casino', 'loan', 'crypto', 'bitcoin', 'investment opportunity', 'click here', 'act now'];
  
  spamKeywords.forEach(keyword => {
    if (message.includes(keyword)) {
      reasons.push(`Contains spam keyword: ${keyword}`);
    }
  });

  // Check for excessive URLs
  const urlCount = (data.message.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 2) {
    reasons.push('Contains multiple URLs');
  }

  // Check for suspicious email patterns
  const email = data.email.toLowerCase();
  if (email.includes('noreply') || email.includes('donotreply')) {
    reasons.push('Uses no-reply email address');
  }

  // Check for very short or very long messages
  if (data.message.length < 20) {
    reasons.push('Message too short');
  }
  if (data.message.length > 1500) {
    reasons.push('Message unusually long');
  }

  // Check for name/email mismatch patterns
  if (data.name && data.email) {
    const nameWords = data.name.toLowerCase().split(' ');
    const emailLocal = data.email.split('@')[0].toLowerCase();
    
    const hasNameMatch = nameWords.some(word => 
      word.length > 2 && emailLocal.includes(word)
    );
    
    if (!hasNameMatch && nameWords.join('').length > 3) {
      reasons.push('Name and email do not match');
    }
  }

  return {
    isSpam: reasons.length >= 2, // Consider spam if 2 or more red flags
    reasons,
  };
}

/**
 * Rate limiting validation - check if too many requests from same source
 */
export interface RateLimitCheck {
  key: string;
  limit: number;
  windowMs: number;
}

export function createRateLimitKey(ip: string, email?: string): string {
  if (email) {
    return `form_submit_${sanitizeEmail(email)}`;
  }
  return `form_submit_ip_${ip}`;
}

/**
 * Validate honeypot field (should be empty)
 */
export function validateHoneypot(honeypotValue: string): boolean {
  return !honeypotValue || honeypotValue.trim() === '';
}