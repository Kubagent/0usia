/**
 * GDPR Compliance Utilities
 * 
 * Comprehensive GDPR compliance utilities for handling user consent,
 * data processing, and privacy rights.
 * 
 * Features:
 * - Consent management and validation
 * - Privacy policy integration
 * - Data retention policies
 * - User rights handling (access, deletion, portability)
 * - Audit logging for compliance
 * - Cookie consent management
 */

// GDPR consent types
export interface GDPRConsent {
  gdprConsent: boolean; // Privacy policy acceptance
  marketingConsent: boolean; // Marketing communications
  analyticsConsent?: boolean; // Analytics tracking
  cookieConsent?: boolean; // Cookie usage
  timestamp: Date;
  ipAddress?: string; // For audit trail
  userAgent?: string; // For audit trail
  consentMethod: 'form' | 'cookie_banner' | 'email' | 'api';
}

// User data processing purposes
export enum ProcessingPurpose {
  CONTACT_FORM = 'contact_form_processing',
  NEWSLETTER = 'newsletter_subscription',
  ANALYTICS = 'website_analytics',
  MARKETING = 'marketing_communications',
  CUSTOMER_SUPPORT = 'customer_support',
}

// Legal basis for processing under GDPR
export enum LegalBasis {
  CONSENT = 'consent', // Article 6(1)(a)
  CONTRACT = 'contract', // Article 6(1)(b)
  LEGAL_OBLIGATION = 'legal_obligation', // Article 6(1)(c)
  VITAL_INTERESTS = 'vital_interests', // Article 6(1)(d)
  PUBLIC_TASK = 'public_task', // Article 6(1)(e)
  LEGITIMATE_INTERESTS = 'legitimate_interests', // Article 6(1)(f)
}

// Data retention periods
export const DATA_RETENTION_PERIODS = {
  [ProcessingPurpose.CONTACT_FORM]: 365 * 24 * 60 * 60 * 1000, // 1 year
  [ProcessingPurpose.NEWSLETTER]: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
  [ProcessingPurpose.ANALYTICS]: 26 * 30 * 24 * 60 * 60 * 1000, // 26 months (Google Analytics)
  [ProcessingPurpose.MARKETING]: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
  [ProcessingPurpose.CUSTOMER_SUPPORT]: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
} as const;

// Processing record for GDPR Article 30
export interface ProcessingRecord {
  id: string;
  purpose: ProcessingPurpose;
  legalBasis: LegalBasis;
  dataSubject: {
    email?: string;
    hashedIdentifier?: string; // For privacy
  };
  dataCategories: string[];
  recipientCategories: string[];
  retentionPeriod: number; // in milliseconds
  createdAt: Date;
  consent?: GDPRConsent;
  deletionDate?: Date;
}

/**
 * Validate GDPR consent requirements
 */
export function validateGDPRConsent(
  consent: Partial<GDPRConsent>,
  purpose: ProcessingPurpose
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic consent validation
  if (!consent.gdprConsent) {
    errors.push('Privacy policy consent is required');
  }

  // Purpose-specific validation
  switch (purpose) {
    case ProcessingPurpose.NEWSLETTER:
      if (!consent.marketingConsent) {
        errors.push('Marketing consent is required for newsletter subscription');
      }
      break;

    case ProcessingPurpose.CONTACT_FORM:
      // Marketing consent is optional for contact forms
      if (consent.marketingConsent === undefined) {
        warnings.push('Consider requesting marketing consent for follow-up communications');
      }
      break;

    case ProcessingPurpose.ANALYTICS:
      if (consent.analyticsConsent === undefined) {
        warnings.push('Analytics consent should be explicitly requested');
      }
      break;
  }

  // Timestamp validation
  if (!consent.timestamp || isNaN(consent.timestamp.getTime())) {
    errors.push('Valid consent timestamp is required');
  } else {
    const now = new Date();
    const consentAge = now.getTime() - consent.timestamp.getTime();
    const maxAge = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years
    
    if (consentAge > maxAge) {
      errors.push('Consent is too old and needs to be refreshed');
    }
  }

  // Consent method validation
  if (!consent.consentMethod) {
    errors.push('Consent method must be specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create a processing record for GDPR compliance
 */
export function createProcessingRecord(
  purpose: ProcessingPurpose,
  legalBasis: LegalBasis,
  dataSubject: { email?: string; identifier?: string },
  dataCategories: string[],
  consent?: GDPRConsent
): ProcessingRecord {
  const id = `proc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  // Hash email for privacy in logs
  let hashedIdentifier: string | undefined;
  if (dataSubject.email) {
    const crypto = require('crypto');
    hashedIdentifier = crypto
      .createHash('sha256')
      .update(dataSubject.email.toLowerCase())
      .digest('hex')
      .substring(0, 16);
  } else if (dataSubject.identifier) {
    const crypto = require('crypto');
    hashedIdentifier = crypto
      .createHash('sha256')
      .update(dataSubject.identifier)
      .digest('hex')
      .substring(0, 16);
  }

  return {
    id,
    purpose,
    legalBasis,
    dataSubject: {
      email: dataSubject.email,
      hashedIdentifier,
    },
    dataCategories,
    recipientCategories: getRecipientCategories(purpose),
    retentionPeriod: DATA_RETENTION_PERIODS[purpose],
    createdAt: new Date(),
    consent,
    deletionDate: new Date(Date.now() + DATA_RETENTION_PERIODS[purpose]),
  };
}

/**
 * Get recipient categories for a processing purpose
 */
function getRecipientCategories(purpose: ProcessingPurpose): string[] {
  const common = ['Ovsia Team', 'IT Service Providers'];
  
  switch (purpose) {
    case ProcessingPurpose.NEWSLETTER:
      return [...common, 'Email Service Provider (Mailchimp)'];
    
    case ProcessingPurpose.CONTACT_FORM:
      return [...common, 'CRM System', 'Email Service Provider (Mailchimp)'];
    
    case ProcessingPurpose.ANALYTICS:
      return [...common, 'Analytics Provider (Google Analytics)'];
    
    case ProcessingPurpose.MARKETING:
      return [...common, 'Email Service Provider (Mailchimp)', 'Marketing Platforms'];
    
    default:
      return common;
  }
}

/**
 * GDPR-compliant logging function
 */
export function logGDPREvent(
  event: 'consent_given' | 'consent_withdrawn' | 'data_processed' | 'data_deleted' | 'access_requested',
  details: {
    purpose?: ProcessingPurpose;
    hashedIdentifier?: string;
    legalBasis?: LegalBasis;
    metadata?: Record<string, any>;
  }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    purpose: details.purpose,
    hashedIdentifier: details.hashedIdentifier,
    legalBasis: details.legalBasis,
    metadata: details.metadata,
    // No personal data in logs
  };

  console.log('GDPR Event:', JSON.stringify(logEntry));
  
  // In production, you might want to send this to a secure audit log
  // or compliance monitoring system
}

/**
 * Check if data should be deleted based on retention policy
 */
export function shouldDeleteData(record: ProcessingRecord): boolean {
  const now = new Date();
  return record.deletionDate ? now > record.deletionDate : false;
}

/**
 * Generate privacy policy text for specific purposes
 */
export function generatePrivacyNotice(purposes: ProcessingPurpose[]): string {
  const notices: Record<ProcessingPurpose, string> = {
    [ProcessingPurpose.CONTACT_FORM]: 
      'We process your contact information to respond to your inquiry and provide customer support. This is based on our legitimate interest in communicating with potential clients.',
    
    [ProcessingPurpose.NEWSLETTER]: 
      'We process your email address and name to send you our newsletter with updates about our work and industry insights. This is based on your explicit consent.',
    
    [ProcessingPurpose.ANALYTICS]: 
      'We use analytics tools to understand how visitors use our website to improve user experience. This may include tracking your browsing behavior.',
    
    [ProcessingPurpose.MARKETING]: 
      'We may use your contact information to send you marketing communications about our services. This is based on your explicit consent.',
    
    [ProcessingPurpose.CUSTOMER_SUPPORT]: 
      'We process your information to provide ongoing customer support and maintain our business relationship.',
  };

  const applicableNotices = purposes.map(purpose => notices[purpose]).filter(Boolean);
  
  return `
**Data Processing Notice**

${applicableNotices.join('\n\n')}

**Your Rights**
You have the right to:
- Access your personal data
- Rectify inaccurate data
- Erase your data (right to be forgotten)
- Restrict processing
- Data portability
- Object to processing
- Withdraw consent at any time

**Data Retention**
We retain your data only as long as necessary for the purposes outlined above, or as required by law.

**Contact**
For any questions about your data or to exercise your rights, contact us at privacy@ovsia.com.
  `.trim();
}

/**
 * Cookie consent categories
 */
export enum CookieCategory {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PREFERENCES = 'preferences',
}

/**
 * Cookie consent configuration
 */
export interface CookieConsent {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: Date;
}

/**
 * Default cookie consent (only necessary cookies)
 */
export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: new Date(),
};

/**
 * Validate cookie consent
 */
export function validateCookieConsent(consent: Partial<CookieConsent>): CookieConsent {
  return {
    necessary: true, // Always required
    analytics: Boolean(consent.analytics),
    marketing: Boolean(consent.marketing),
    preferences: Boolean(consent.preferences),
    timestamp: consent.timestamp || new Date(),
  };
}

/**
 * Check if specific cookie category is allowed
 */
export function isCookieAllowed(consent: CookieConsent, category: CookieCategory): boolean {
  switch (category) {
    case CookieCategory.NECESSARY:
      return true; // Always allowed
    case CookieCategory.ANALYTICS:
      return consent.analytics;
    case CookieCategory.MARKETING:
      return consent.marketing;
    case CookieCategory.PREFERENCES:
      return consent.preferences;
    default:
      return false;
  }
}

/**
 * Generate consent summary for user display
 */
export function generateConsentSummary(consent: GDPRConsent): string {
  const items: string[] = [];
  
  if (consent.gdprConsent) {
    items.push('✓ Privacy Policy accepted');
  }
  
  if (consent.marketingConsent) {
    items.push('✓ Marketing communications allowed');
  }
  
  if (consent.analyticsConsent) {
    items.push('✓ Analytics tracking allowed');
  }
  
  if (consent.cookieConsent) {
    items.push('✓ Cookie usage allowed');
  }
  
  items.push(`Consent given: ${consent.timestamp.toLocaleDateString()}`);
  items.push(`Method: ${consent.consentMethod}`);
  
  return items.join('\n');
}

/**
 * Data subject rights request types
 */
export enum DataSubjectRightType {
  ACCESS = 'access', // Article 15
  RECTIFICATION = 'rectification', // Article 16
  ERASURE = 'erasure', // Article 17
  RESTRICT_PROCESSING = 'restrict_processing', // Article 18
  DATA_PORTABILITY = 'data_portability', // Article 20
  OBJECT = 'object', // Article 21
  WITHDRAW_CONSENT = 'withdraw_consent', // Article 7(3)
}

/**
 * Create a data subject rights request
 */
export interface DataSubjectRightsRequest {
  id: string;
  type: DataSubjectRightType;
  email: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
  response?: string;
}

/**
 * Validate data subject rights request
 */
export function validateDataSubjectRightsRequest(
  request: Partial<DataSubjectRightsRequest>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!request.type || !Object.values(DataSubjectRightType).includes(request.type)) {
    errors.push('Valid request type is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default {
  validateGDPRConsent,
  createProcessingRecord,
  logGDPREvent,
  shouldDeleteData,
  generatePrivacyNotice,
  validateCookieConsent,
  isCookieAllowed,
  generateConsentSummary,
  validateDataSubjectRightsRequest,
};